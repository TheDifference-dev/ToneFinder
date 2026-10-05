// ToneFinder masaüstü başlatıcısı.
// Masaüstündeki kısayola tıklanınca:
//   1. GitHub'dan son güncellemeleri çeker (git pull)
//   2. Gerekirse paketleri kurar ve uygulamayı yeniden derler
//   3. Uygulamayı bu bilgisayarda (127.0.0.1) başlatır
//   4. Edge/Chrome'u adres çubuğu olmayan bir uygulama penceresi olarak açar
//   5. Pencere kapanınca sunucuyu da kapatır
// Kullanım: node scripts/launcher.mjs   (ToneFinder.bat / ToneFinder.command bunu çağırır)

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, openSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.TONEFINDER_PORT || 3210);
const URL = `http://127.0.0.1:${PORT}`;
const HOME = process.env.TONEFINDER_HOME || join(homedir(), ".tonefinder");
const IS_WIN = platform() === "win32";
const IS_MAC = platform() === "darwin";

mkdirSync(HOME, { recursive: true });

const log = (msg) => console.log(`[ToneFinder] ${msg}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", shell: IS_WIN, ...opts });
  return res.status === 0;
}

// ---------- 1. Güncelleme ----------

function findGit() {
  if (spawnSync("git", ["--version"], { stdio: "ignore", shell: IS_WIN }).status === 0) return "git";
  // GitHub Desktop kendi git'ini getirir ama PATH'e eklemez
  if (IS_WIN && process.env.LOCALAPPDATA) {
    const base = join(process.env.LOCALAPPDATA, "GitHubDesktop");
    if (existsSync(base)) {
      const apps = readdirSync(base).filter((d) => d.startsWith("app-")).sort().reverse();
      for (const app of apps) {
        const git = join(base, app, "resources", "app", "git", "cmd", "git.exe");
        if (existsSync(git)) return git;
      }
    }
  }
  if (IS_MAC) {
    const git = "/Applications/GitHub Desktop.app/Contents/Resources/app/git/bin/git";
    if (existsSync(git)) return git;
  }
  return null;
}

function update() {
  if (process.env.TONEFINDER_NO_UPDATE || !existsSync(join(ROOT, ".git"))) return;
  const git = findGit();
  if (!git) {
    log("git bulunamadı; güncelleme atlandı (GitHub Desktop'tan 'Fetch/Pull' yapabilirsin).");
    return;
  }
  log("Güncellemeler kontrol ediliyor…");
  const res = spawnSync(git, ["pull", "--ff-only"], { cwd: ROOT, encoding: "utf8", timeout: 60_000 });
  if (res.status === 0) {
    log(/Already up to date|Zaten güncel/i.test(res.stdout) ? "Uygulama güncel." : "Güncellemeler indirildi.");
  } else {
    log("Güncelleme alınamadı (internet yok ya da yerel değişiklik var); mevcut sürümle devam ediliyor.");
    if (res.stderr) console.log(res.stderr.trim());
  }
}

// ---------- 2. Kurulum ve derleme ----------

function fileHash(path) {
  return existsSync(path) ? createHash("sha1").update(readFileSync(path)).digest("hex") : "";
}

function ensureDependencies() {
  const stamp = join(ROOT, "node_modules", ".tonefinder-lock");
  const want = fileHash(join(ROOT, "package-lock.json"));
  if (existsSync(stamp) && readFileSync(stamp, "utf8") === want) return;
  log("Paketler kuruluyor (ilk açılışta birkaç dakika sürebilir)…");
  if (!run("npm", ["install", "--no-audit", "--no-fund"])) throw new Error("npm install başarısız oldu.");
  writeFileSync(stamp, want);
}

// Kaynak dosyaların yolu+boyutu+içeriği değişince yeniden derle
function sourceStamp() {
  const hash = createHash("sha1");
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir).sort()) {
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else hash.update(p.slice(ROOT.length)).update(readFileSync(p));
    }
  };
  for (const d of ["app", "components", "lib", "public"]) walk(join(ROOT, d));
  for (const f of ["package-lock.json", "next.config.ts", "postcss.config.mjs", "tsconfig.json"]) {
    hash.update(f).update(fileHash(join(ROOT, f)));
  }
  return hash.digest("hex");
}

function ensureBuild() {
  const stampFile = join(ROOT, ".next", ".tonefinder-build");
  const want = sourceStamp();
  if (existsSync(join(ROOT, ".next", "BUILD_ID")) && existsSync(stampFile) && readFileSync(stampFile, "utf8") === want) return;
  log("Uygulama hazırlanıyor (güncellemeden sonra bir kez yapılır)…");
  if (!run("npm", ["run", "build"])) throw new Error("Derleme başarısız oldu.");
  writeFileSync(stampFile, want);
}

// ---------- 3. Sunucu ----------

async function isRunning() {
  try {
    const res = await fetch(`${URL}/api/health`, { signal: AbortSignal.timeout(1500) });
    return (await res.json()).app === "tonefinder";
  } catch {
    return false;
  }
}

function startServer() {
  const out = openSync(join(HOME, "server.log"), "a");
  const nextBin = join(ROOT, "node_modules", "next", "dist", "bin", "next");
  return spawn(process.execPath, [nextBin, "start", "-p", String(PORT), "-H", "127.0.0.1"], {
    cwd: ROOT,
    stdio: ["ignore", out, out],
    env: { ...process.env, NODE_ENV: "production" },
  });
}

async function waitForServer(server) {
  for (let i = 0; i < 120; i++) {
    if (await isRunning()) return;
    if (server.exitCode !== null) break;
    await sleep(500);
  }
  throw new Error(`Sunucu başlamadı. Ayrıntılar: ${join(HOME, "server.log")}`);
}

// ---------- 4. Uygulama penceresi ----------

function findBrowser() {
  if (process.env.TONEFINDER_BROWSER) return process.env.TONEFINDER_BROWSER;
  const candidates = IS_WIN
    ? [
        join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Microsoft\\Edge\\Application\\msedge.exe"),
        join(process.env.ProgramFiles || "C:\\Program Files", "Microsoft\\Edge\\Application\\msedge.exe"),
        join(process.env.ProgramFiles || "C:\\Program Files", "Google\\Chrome\\Application\\chrome.exe"),
        join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Google\\Chrome\\Application\\chrome.exe"),
        join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe"),
      ]
    : IS_MAC
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
          "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        ]
      : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"];
  return candidates.find((p) => p && existsSync(p)) ?? null;
}

// Ayrı bir profil klasörü, pencerenin kendi sürecinde açılmasını (ve kapanınca
// bizim de anlamamızı) sağlar; kayıtlı tonlar ve ekipman bu profilde saklanır.
function openAppWindow() {
  const browser = findBrowser();
  if (!browser) return null;
  const win = spawn(
    browser,
    [
      `--app=${URL}`,
      `--user-data-dir=${join(HOME, "window")}`,
      "--window-size=1320,900",
      "--no-first-run",
      "--no-default-browser-check",
    ],
    { stdio: "ignore" },
  );
  win.on("error", (err) => log(`Pencere açılamadı: ${err.message}`));
  return win;
}

function openDefaultBrowser() {
  const [cmd, args] = IS_WIN ? ["cmd", ["/c", "start", "", URL]] : IS_MAC ? ["open", [URL]] : ["xdg-open", [URL]];
  const child = spawn(cmd, args, { stdio: "ignore", detached: true });
  child.on("error", () => log(`Tarayıcı açılamadı; adresi elle aç: ${URL}`));
  child.unref();
}

// ---------- Akış ----------

async function main() {
  log(`Klasör: ${ROOT}`);
  if (await isRunning()) {
    log("ToneFinder zaten açık; pencere getiriliyor.");
    if (!openAppWindow()) openDefaultBrowser();
    return;
  }

  update();
  ensureDependencies();
  ensureBuild();

  log("Başlatılıyor…");
  const server = startServer();
  const stop = () => {
    if (server.exitCode === null) server.kill();
  };
  process.on("SIGINT", () => {
    stop();
    process.exit(0);
  });
  process.on("exit", stop);
  await waitForServer(server);

  const win = openAppWindow();
  if (win) {
    log("Hazır. Uygulama penceresini kapatınca ToneFinder da kapanır.");
    await new Promise((resolve) => win.on("exit", resolve));
    stop();
  } else {
    log(`Edge/Chrome bulunamadı; varsayılan tarayıcıda açılıyor: ${URL}`);
    log("Kapatmak için bu pencereyi kapat.");
    openDefaultBrowser();
    await new Promise((resolve) => server.on("exit", resolve));
  }
}

main().catch((err) => {
  console.error(`\n[ToneFinder] Hata: ${err.message}`);
  process.exitCode = 1;
});
