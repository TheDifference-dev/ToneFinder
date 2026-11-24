import "server-only";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { libraryArtists } from "./library";
import { popularCatalog } from "./popular";
import { researchSongSheet, resolveEngine } from "./research";
import { hasSheet, saveSheet, sheetCount, songKey } from "./song-library";

// Arka plan kütüphane araştırması: kütüphanedeki her şarkının (100 grup × 20 şarkı, ardından popüler 500)
// bütün gitar bölümlerini Claude Code ile tek tek araştırıp ~/.tonefinder/library/ altına kaydeder.
// Uygulama açık kaldıkça çalışır; kapatılıp açılınca kaldığı yerden sürer. Claude kullanım limiti dolunca
// bekler ve limit yenilenince devam eder.

const STATE_FILE = join(process.env.TONEFINDER_HOME || join(homedir(), ".tonefinder"), "library-job.json");
const CONCURRENCY = 2;
const LIMIT_WAIT_MS = 20 * 60_000;

export interface JobSong {
  title: string;
  artist: string;
}

export interface JobStatus {
  enabled: boolean;
  running: boolean;
  total: number;
  ready: number;
  sheets: number;
  current: string[];
  waitingUntil: number | null;
  lastError: string | null;
  doneThisRun: number;
  failed: number;
}

interface Persisted {
  enabled: boolean;
  failed: Record<string, string>;
}

interface Job {
  persisted: Persisted;
  running: boolean;
  current: Set<string>;
  waitingUntil: number | null;
  lastError: string | null;
  doneThisRun: number;
  stop: boolean;
}

const g = globalThis as unknown as { __tfLibraryJob?: Job };

function loadPersisted(): Persisted {
  try {
    const p = JSON.parse(readFileSync(STATE_FILE, "utf8")) as Persisted;
    return { enabled: Boolean(p.enabled), failed: p.failed ?? {} };
  } catch {
    return { enabled: false, failed: {} };
  }
}

function persist(job: Job) {
  try {
    mkdirSync(join(STATE_FILE, ".."), { recursive: true });
    writeFileSync(STATE_FILE, JSON.stringify(job.persisted));
  } catch {
    // durum yazılamazsa iş yine sürer
  }
}

function job(): Job {
  if (!g.__tfLibraryJob) {
    g.__tfLibraryJob = { persisted: loadPersisted(), running: false, current: new Set(), waitingUntil: null, lastError: null, doneThisRun: 0, stop: false };
  }
  return g.__tfLibraryJob;
}

/** Araştırılacak bütün şarkılar: önce Türkçe rock, sonra dünya grupları, sonra popüler 500 */
export function allSongs(): JobSong[] {
  const seen = new Set<string>();
  const out: JobSong[] = [];
  const add = (title: string, artist: string) => {
    const k = songKey(artist, title);
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ title, artist });
  };
  const artists = libraryArtists();
  for (const region of ["tr", "world"] as const) {
    for (const a of artists.filter((x) => x.region === region)) for (const s of a.songs) add(s.title, a.name);
  }
  for (const e of popularCatalog()) add(e.title, e.artist);
  return out;
}

export function jobStatus(): JobStatus {
  const j = job();
  const songs = allSongs();
  return {
    enabled: j.persisted.enabled,
    running: j.running,
    total: songs.length,
    ready: songs.filter((s) => hasSheet(s.artist, s.title)).length,
    sheets: sheetCount(),
    current: [...j.current],
    waitingUntil: j.waitingUntil,
    lastError: j.lastError,
    doneThisRun: j.doneThisRun,
    failed: Object.keys(j.persisted.failed).length,
  };
}

const sleep = (ms: number, j: Job) =>
  new Promise<void>((resolve) => {
    const until = Date.now() + ms;
    const tick = () => (j.stop || Date.now() >= until ? resolve() : setTimeout(tick, 2000));
    tick();
  });

async function worker(j: Job, queue: JobSong[]) {
  while (!j.stop && queue.length) {
    const s = queue.shift()!;
    if (hasSheet(s.artist, s.title)) continue;
    const name = `${s.artist} – ${s.title}`;
    j.current.add(name);
    try {
      const engine = await resolveEngine();
      if (!engine) {
        j.lastError = "Claude Code bulunamadı; araştırma durdu.";
        j.stop = true;
        queue.unshift(s);
        break;
      }
      const sheet = await researchSongSheet(engine, s.title, s.artist);
      saveSheet({ ...sheet, title: s.title, artist: s.artist, researchedAt: Date.now() });
      delete j.persisted.failed[songKey(s.artist, s.title)];
      j.doneThisRun++;
      j.lastError = null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/limit/i.test(msg)) {
        // Claude kullanım limiti: şarkıyı kuyruğa geri koy, bekle, sonra devam et
        queue.unshift(s);
        j.lastError = msg;
        j.waitingUntil = Date.now() + LIMIT_WAIT_MS;
        j.current.delete(name);
        await sleep(LIMIT_WAIT_MS, j);
        j.waitingUntil = null;
        continue;
      }
      j.persisted.failed[songKey(s.artist, s.title)] = msg.slice(0, 200);
      j.lastError = `${name}: ${msg}`;
      persist(j);
    } finally {
      j.current.delete(name);
    }
  }
}

async function run() {
  const j = job();
  if (j.running) return;
  j.running = true;
  j.stop = false;
  try {
    // Önceki çalışmada başarısız olanlar en sona
    const failed = new Set(Object.keys(j.persisted.failed));
    const pending = allSongs().filter((s) => !hasSheet(s.artist, s.title));
    const queue = [...pending.filter((s) => !failed.has(songKey(s.artist, s.title))), ...pending.filter((s) => failed.has(songKey(s.artist, s.title)))];
    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(j, queue)));
  } finally {
    j.running = false;
    j.current.clear();
  }
}

export function startJob() {
  const j = job();
  j.persisted.enabled = true;
  persist(j);
  void run();
}

export function stopJob() {
  const j = job();
  j.persisted.enabled = false;
  j.stop = true;
  persist(j);
}

/** Uygulama açılınca: kullanıcı araştırmayı açık bıraktıysa kaldığı yerden sürdür */
export function resumeJobIfEnabled() {
  const j = job();
  if (j.persisted.enabled && !j.running) void run();
}
