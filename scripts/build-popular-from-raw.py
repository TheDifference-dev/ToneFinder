"""Songsterr'in popüler sayfalarından (tarayıcıda okunan) satırlardan data/popular/songs.json'u 500'e tamamlar.

Girdi: data/popular/songsterr-raw-101-550.txt — her satır "Sanatçı ¦ Başlık ¦ enstrümanId|kanal adı".
Var olan şarkılar (ilk 100) ve onların slug'ları korunur; yalnız sona yenileri eklenir.
Atlananlar: gitarsız kayıtlar, klasik/fingerstyle düzenlemeler, yalnız bas kayıtları ve
listede zaten olan bir şarkının akustik/solo/kısım varyantları.
"""

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SONGS = ROOT / "data" / "popular" / "songs.json"
RAW = ROOT / "data" / "popular" / "songsterr-raw-101-550.txt"
TARGET = 500

SKIP_ARTISTS = {"pachelbel", "ludwig van beethoven", "isaac albeniz", "yiruma shunga jung fingerstyle", "spanish song", "jerry c"}
SKIP_TITLE = re.compile(r"fingerstyle|\(bass\)|pulling teeth|\(guitar solo\)|with bass guitar|\(acoustic\)|floods outro", re.I)


CYR = dict(zip("абвгдеёжзийклмнопрстуфхцчшщъыьэюя", "a b v g d e e zh z i y k l m n o p r s t u f h ts ch sh sch - y - e yu ya".split()))


def translit(t: str) -> str:
    return "".join(CYR.get(c, c) if c.islower() else (CYR.get(c.lower(), c).capitalize() if c.lower() in CYR else c) for c in t).replace("-", "")


def norm(t: str) -> str:
    t = translit(t)
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode().lower()
    t = re.sub(r"\(.*?\)", " ", t)
    return re.sub(r"[^a-z0-9]+", " ", t).strip()


def slugify(t: str) -> str:
    t = translit(t)
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:60]


def clean_title(t: str) -> str:
    # "(David Bowie)" gibi orijinal sanatçı notları ve "(Eurythmics Cover)" kalır mı? Arama için sadeleştir
    t = re.sub(r"\s*\((?:[^)]*cover|feat\.[^)]*|with [^)]*|platinum)\)", "", t, flags=re.I)
    return re.sub(r"\s{2,}", " ", t).strip()


def guess_part(title: str, code: str) -> str | None:
    if code == "NOGTR":
        return None
    inst, _, name = code.partition("|")
    if re.search(r"\bsolo\b", title, re.I):
        return "lead"
    n = name.lower()
    try:
        iid = int(inst)
    except ValueError:
        iid = 30
    if iid in (24, 25) or re.search(r"acoustic|clean|nylon|classical|12-string|dobro", n):
        return "clean"
    if re.search(r"\blead\b|\bsolo\b|соло|лид", n):
        return "lead"
    if re.search(r"rhythm", n):
        return "rhythm"
    return "full"


def main() -> None:
    current = json.loads(SONGS.read_text(encoding="utf-8"))
    songs = current["songs"][:100]
    seen = {norm(s["title"]) + "|" + norm(s["artist"]) for s in songs}
    seen_titles = {norm(s["title"]) for s in songs}
    skipped: list[str] = []
    for line in RAW.read_text(encoding="utf-8").splitlines():
        if len(songs) >= TARGET:
            break
        parts = [p.strip() for p in line.split("¦")]
        if len(parts) != 3:
            continue
        artist, title, code = parts
        artist = artist.replace("‐", "-")
        title = clean_title(title)
        key = norm(title) + "|" + norm(artist)
        part = guess_part(title, code)
        if part is None or norm(artist) in SKIP_ARTISTS or SKIP_TITLE.search(parts[1]):
            skipped.append(f"{artist} - {parts[1]}")
            continue
        if key in seen:
            skipped.append(f"{artist} - {parts[1]} (tekrar)")
            continue
        seen.add(key)
        seen_titles.add(norm(title))
        rank = len(songs) + 1
        songs.append({"rank": rank, "title": title, "artist": artist, "part": part, "slug": f"{rank:03d}-{slugify(artist)}-{slugify(title)}"})
    current["songs"] = songs
    current["source"] = "Songsterr ana sayfa popüler listesi (21 Kasım 2026)"
    SONGS.write_text(json.dumps(current, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(songs)} şarkı yazıldı; atlananlar ({len(skipped)}):")
    for s in skipped:
        print("  -", s)


if __name__ == "__main__":
    main()
