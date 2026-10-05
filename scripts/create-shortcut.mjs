// Masaüstüne (ve Windows'ta Başlat menüsüne) ToneFinder kısayolu oluşturur.
// Kısayol ToneFinder.bat / ToneFinder.command'ı çalıştırır: güncellemeyi çeker ve uygulamayı açar.
// Kullanım: Masaustu-Kisayolu-Olustur.bat'a çift tıkla ya da `npm run shortcut`.

import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function windows() {
  const ps = (s) => s.replace(/'/g, "''");
  const target = join(ROOT, "ToneFinder.bat");
  const icon = join(ROOT, "public", "tonefinder.ico");
  // WindowStyle 7 = simge durumunda: arka plandaki konsol penceresi görünmez
  const script = `
$shell = New-Object -ComObject WScript.Shell
foreach ($dir in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))) {
  $lnk = $shell.CreateShortcut((Join-Path $dir 'ToneFinder.lnk'))
  $lnk.TargetPath = '${ps(target)}'
  $lnk.WorkingDirectory = '${ps(ROOT)}'
  $lnk.IconLocation = '${ps(icon)},0'
  $lnk.WindowStyle = 7
  $lnk.Description = 'ToneFinder - gitar ton bulucu'
  $lnk.Save()
  Write-Output (Join-Path $dir 'ToneFinder.lnk')
}`;
  const res = spawnSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script], { encoding: "utf8" });
  if (res.status !== 0) throw new Error(res.stderr || "Kısayol oluşturulamadı.");
  return res.stdout.trim().split(/\r?\n/);
}

function mac() {
  const desktop = join(homedir(), "Desktop");
  const file = join(desktop, "ToneFinder.command");
  writeFileSync(file, `#!/bin/bash\nexec "${join(ROOT, "ToneFinder.command")}"\n`);
  chmodSync(file, 0o755);
  chmodSync(join(ROOT, "ToneFinder.command"), 0o755);
  return [file];
}

function linux() {
  const dir = existsSync(join(homedir(), "Desktop")) ? join(homedir(), "Desktop") : join(homedir(), ".local", "share", "applications");
  const file = join(dir, "tonefinder.desktop");
  writeFileSync(
    file,
    [
      "[Desktop Entry]",
      "Type=Application",
      "Name=ToneFinder",
      "Comment=Gitar ton bulucu",
      `Exec=node "${join(ROOT, "scripts", "launcher.mjs")}"`,
      `Icon=${join(ROOT, "public", "tonefinder-256.png")}`,
      "Terminal=false",
      "",
    ].join("\n"),
  );
  chmodSync(file, 0o755);
  return [file];
}

try {
  const created = platform() === "win32" ? windows() : platform() === "darwin" ? mac() : linux();
  console.log("ToneFinder kısayolu oluşturuldu:");
  for (const f of created) console.log("  " + f);
  console.log("\nArtık masaüstündeki ToneFinder simgesine tıklayarak açabilirsin. Her açılışta güncellemeler otomatik indirilir.");
} catch (err) {
  console.error("Kısayol oluşturulamadı:", err.message);
  process.exitCode = 1;
}
