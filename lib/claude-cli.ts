import "server-only";
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";

// API anahtarı olmadan araştırma: bilgisayarda kurulu Claude Code komut satırı (claude -p)
// kullanıcının Claude aboneliğiyle çalışır. Yalnız web araması ve sayfa okuma araçlarına izin
// verilir; dosya, komut ya da kullanıcının eklenti/hook ayarları devreye girmez.

export interface ClaudeCli {
  command: string;
  /** .cmd kurulumunda node + cli.js ile çalıştırılır */
  prefixArgs: string[];
  version: string;
}

let cached: { cli: ClaudeCli | null; at: number } | null = null;

function candidates(): string[] {
  const list = [process.env.TONEFINDER_CLAUDE_BIN ?? ""];
  if (process.platform === "win32") {
    const where = spawnSync("where", ["claude"], { encoding: "utf8", timeout: 5000 });
    list.push(...(where.stdout ?? "").split(/\r?\n/));
    list.push(join(homedir(), ".local", "bin", "claude.exe"));
    if (process.env.APPDATA) list.push(join(process.env.APPDATA, "npm", "claude.cmd"));
  } else {
    list.push("claude", join(homedir(), ".local", "bin", "claude"), join(homedir(), ".claude", "local", "claude"), "/opt/homebrew/bin/claude", "/usr/local/bin/claude");
  }
  return list.map((c) => c.trim()).filter(Boolean);
}

function resolve(candidate: string): Omit<ClaudeCli, "version"> | null {
  if (/\.cmd$/i.test(candidate)) {
    // npm ile kurulmuş: claude.cmd kabuk gerektirir; doğrudan node + cli.js çalıştırılır
    const cliJs = join(dirname(candidate), "node_modules", "@anthropic-ai", "claude-code", "cli.js");
    return existsSync(cliJs) ? { command: process.execPath, prefixArgs: [cliJs] } : null;
  }
  return { command: candidate, prefixArgs: [] };
}

/** Claude Code kurulu mu? Sonuç bir dakika önbelleklenir. */
export function findClaudeCli(): ClaudeCli | null {
  if (cached && Date.now() - cached.at < 60_000) return cached.cli;
  let cli: ClaudeCli | null = null;
  for (const c of candidates()) {
    const r = resolve(c);
    if (!r) continue;
    const res = spawnSync(r.command, [...r.prefixArgs, "--version"], { encoding: "utf8", timeout: 15_000, windowsHide: true });
    const version = (res.stdout ?? "").trim();
    if (res.status === 0 && /claude code/i.test(version)) {
      cli = { ...r, version: version.split(/\s/)[0] };
      break;
    }
  }
  cached = { cli, at: Date.now() };
  return cli;
}

export class CliError extends Error {}

interface RunOptions {
  system: string;
  prompt: string;
  /** Yapılandırılmış çıktının JSON Schema'sı */
  schema: object;
  onSearch?: (query: string) => void;
  onFetch?: (url: string) => void;
  timeoutMs?: number;
}

/** claude -p'yi web araçlarıyla çalıştırır ve yapılandırılmış çıktıyı döndürür */
export async function runClaudeCli(cli: ClaudeCli, opts: RunOptions): Promise<{ output: unknown; fetched: string[] }> {
  const dir = join(tmpdir(), "tonefinder-cli");
  await mkdir(dir, { recursive: true });
  const systemFile = join(dir, `system-${process.pid}-${Date.now()}.txt`);
  await writeFile(systemFile, opts.system);

  const args = [
    ...cli.prefixArgs,
    "-p",
    "--output-format",
    "stream-json",
    "--verbose",
    "--tools",
    "WebSearch,WebFetch",
    "--allowedTools",
    "WebSearch,WebFetch",
    "--permission-mode",
    "dontAsk",
    "--setting-sources",
    "project",
    "--strict-mcp-config",
    "--no-session-persistence",
    "--system-prompt-file",
    systemFile,
    "--json-schema",
    // Claude Code "$schema" adresini çözemiyor; şemanın kendisi yeterli
    JSON.stringify({ ...opts.schema, $schema: undefined }),
  ];
  if (process.env.TONEFINDER_CLAUDE_MODEL) args.push("--model", process.env.TONEFINDER_CLAUDE_MODEL);

  return new Promise((resolvePromise, reject) => {
    const child = spawn(cli.command, args, { cwd: dir, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    const fetched: string[] = [];
    let buffer = "";
    let stderr = "";
    let result: { is_error?: boolean; subtype?: string; result?: string; structured_output?: unknown } | null = null;
    const timer = setTimeout(() => {
      child.kill();
      reject(new CliError("Araştırma çok uzun sürdü, lütfen tekrar dene."));
    }, opts.timeoutMs ?? 10 * 60_000);

    const handle = (line: string) => {
      if (!line.trim()) return;
      let event: { type?: string; message?: { content?: { type: string; name?: string; input?: Record<string, unknown> }[] } } & Record<string, unknown>;
      try {
        event = JSON.parse(line);
      } catch {
        return;
      }
      if (event.type === "assistant") {
        for (const block of event.message?.content ?? []) {
          if (block.type !== "tool_use") continue;
          if (block.name === "WebSearch" && typeof block.input?.query === "string") opts.onSearch?.(block.input.query);
          if (block.name === "WebFetch" && typeof block.input?.url === "string") {
            fetched.push(block.input.url);
            opts.onFetch?.(block.input.url);
          }
        }
      } else if (event.type === "result") {
        result = event as typeof result;
      }
    };

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      lines.forEach(handle);
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => (stderr += chunk));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new CliError(`Claude Code başlatılamadı: ${err.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      void rm(systemFile, { force: true });
      handle(buffer);
      const r = result as typeof result;
      if (r && !r.is_error && r.structured_output) return resolvePromise({ output: r.structured_output, fetched });
      const text = `${r?.result ?? ""} ${stderr}`;
      console.error("claude CLI failed", code, text.slice(0, 2000));
      if (/log ?in|not logged|invalid api key|authenticat|\/login/i.test(text)) {
        return reject(new CliError("Claude Code'a giriş yapılmamış. Bir terminalde `claude` yazıp hesabınla giriş yap."));
      }
      if (/usage limit|rate limit|limit reached/i.test(text)) {
        return reject(new CliError("Claude kullanım limitine ulaşıldı. Bir süre sonra tekrar dene."));
      }
      if (/unknown option/i.test(text)) {
        return reject(new CliError("Claude Code sürümü eski. Bir terminalde `claude update` çalıştır."));
      }
      reject(new CliError("Araştırma sonuç üretmedi, lütfen tekrar dene."));
    });

    child.stdin.end(opts.prompt);
  });
}
