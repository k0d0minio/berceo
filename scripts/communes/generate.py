#!/usr/bin/env python3
"""
Regenerates src/lib/communes/data.ts — every Belgian postal locality with its
commune and the commune's REFNIS (INS) code — and src/lib/communes/centres.ts,
each commune's official centre. Run by hand when bpost, Statbel or NGI-IGN
publish a new list; the output is committed, nothing runs at build time.

    pip install xlrd==2.0.1 openpyxl==3.1.5 pyshp==2.3.1
    python3 scripts/communes/generate.py           # data.ts, then centres.ts
    python3 scripts/communes/generate.py centres   # centres.ts only, from the committed data.ts

Three inputs, joined here:

1. bpost's postcode list (localities by postcode, French edition): postcode,
   locality, whether it is a sub-locality, the main commune and the province.
   It already follows the 1 January 2025 mergers (565 communes). Rows with no
   province are organisations with their own postcode, not places; dropped.
2. Eurostat's LAU list for Belgium: the REFNIS code of every commune with its
   Dutch-first national name and its French ("Latin") form. Statbel's own
   REFNIS file sits behind a bot challenge that a script cannot pass; the LAU
   codes for Belgium are Statbel's REFNIS codes. The latest LAU file still
   describes the 581 communes of 2024.
3. MERGERS_2025 below: the 14 communes the 2025 mergers created or enlarged,
   with the REFNIS code Statbel gave each. Verify them against Statbel's REFNIS
   list whenever this script runs.

Names shown to families are French where a French form exists (Ixelles,
Mouscron, Anvers), otherwise the official name. The other name stays
searchable. The script fails on any bpost commune it cannot place, so a new
merger is noticed here, never silently dropped.

The centres come from NGI-IGN AdminVector, layer municipalcenter: one point per
commune, the official municipal centre (the town hall, or else the main church
or crossroads), not a centre of gravity. CC BY 4.0. The script fails on a code
that is in one list and not in the other, for the same reason.
"""

from __future__ import annotations

import datetime
import io
import json
import re
import shutil
import sys
import tempfile
import unicodedata
import urllib.request
import zipfile
from pathlib import Path

import openpyxl
import shapefile
import xlrd

BPOST_URL = "https://www.bpost.be/sites/default/files/zipcodes/zipcodes_num_fr_2025.xls"
LAU_URL = (
    "https://ec.europa.eu/eurostat/documents/345175/501971/"
    "EU-27-LAU-2025-NUTS-2024.xlsx/574c9e4a-2dae-99fe-5510-3fd18d8e90c2"
)
STATBEL_URL = "https://statbel.fgov.be/fr/open-data/code-refnis"

# bpost's main-commune name → (REFNIS code, name shown). The 1 January 2025
# mergers; every other commune keeps its 2024 code.
MERGERS_2025: dict[str, tuple[str, str]] = {
    "ANTWERPEN": ("11002", "Anvers"),  # absorbs Borsbeek
    "PAJOTTEGEM": ("23106", "Pajottegem"),  # Galmaarden, Gooik, Herne
    "WINGENE": ("37021", "Wingene"),  # absorbs Ruiselede
    "TIELT": ("37022", "Tielt"),  # absorbs Meulebeke
    "NAZARETH-DE PINTE": ("44086", "Nazareth-De Pinte"),
    "LOCHRISTI": ("44087", "Lochristi"),  # absorbs Wachtebeke
    "MERELBEKE-MELLE": ("44088", "Merelbeke-Melle"),
    "LOKEREN": ("46029", "Lokeren"),  # absorbs Moerbeke
    "BEVEREN-KRUIBEKE-ZWIJNDRECHT": ("46030", "Beveren-Kruibeke-Zwijndrecht"),
    "TESSENDERLO-HAM": ("71071", "Tessenderlo-Ham"),
    "HASSELT": ("71072", "Hasselt"),  # absorbs Kortessem
    "BILZEN-HOESELT": ("73110", "Bilzen-Hoeselt"),
    "TONGEREN-BORGLOON": ("73111", "Tongeren-Borgloon"),
    "BASTOGNE": ("82039", "Bastogne"),  # absorbs Bertogne
}

# bpost names the name-matching cannot place on its own, by (commune, province).
BPOST_OVERRIDES: dict[tuple[str, str], str] = {
    ("HAM-SUR-HEURE", "HAINAUT"): "56086",  # Ham-sur-Heure-Nalinnes
    ("SAINT-NICOLAS", "LIEGE"): "62093",  # not Sint-Niklaas, whose French name it shares
}

ADMINVECTOR_URL = (
    "https://ac.ngi.be/remoteclient-open/ngi-standard-open/Vectordata/TerritorialDivisions/"
    "TerritorialDivisions-AdminVector/fb1e2993-2020-428c-9188-eb5f75e284b9_x-shapefile_4326.zip"
)
ADMINVECTOR_RECORD = "fb1e2993-2020-428c-9188-eb5f75e284b9"  # the dataset's record on geo.be
ADMINVECTOR_LAYER = "municipalcenter_4326"

# AdminVector's REFNIS code → ours, where the two lists differ.
ADMINVECTOR_OVERRIDES: dict[str, str] = {}

OUT = Path(__file__).resolve().parents[2] / "src" / "lib" / "communes" / "data.ts"
CENTRES_OUT = OUT.with_name("centres.ts")


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "berceo-communes/1.0"})
    with urllib.request.urlopen(req, timeout=120) as res:
        return res.read()


def key(name: str) -> str:
    """Compare names without case, accents, punctuation or a (disambiguator)."""
    name = re.sub(r"\s*\(.*?\)", "", name)
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", name.lower())


def strip_paren(name: str) -> str:
    return re.sub(r"\s*\(.*?\)", "", name).strip()


def write_data() -> set[str]:
    """Writes data.ts and returns its REFNIS codes."""
    lau_book = openpyxl.load_workbook(io.BytesIO(fetch(LAU_URL)), read_only=True)
    lau = [r for r in list(lau_book["BE"].iter_rows(values_only=True))[1:] if r[2]]

    # REFNIS code → (national name, French name), and every name → code.
    communes: dict[str, tuple[str, str]] = {}
    by_name: dict[str, set[str]] = {}
    for row in lau:
        code, national, latin = str(row[2]), str(row[4]), str(row[5])
        communes[code] = (national, latin)
        for name in (national, latin):
            by_name.setdefault(key(name), set()).add(code)

    shown_counts: dict[str, int] = {}
    for national, latin in communes.values():
        shown_counts[key(latin)] = shown_counts.get(key(latin), 0) + 1

    def shown(code: str) -> str:
        latin = communes[code][1]
        # Keep "(Anvers)" and the like only where the bare name is ambiguous.
        return strip_paren(latin) if shown_counts[key(latin)] == 1 else latin

    sheet = xlrd.open_workbook(file_contents=fetch(BPOST_URL)).sheets()[0]
    header = sheet.row_values(0)
    if header[:5] != ["Code postal", "Localité", "Sous-commune", "Commune principale", "Province"]:
        sys.exit(f"bpost's columns changed: {header}")

    out_communes: dict[str, dict] = {}
    localities: list[list[str]] = []
    seen: set[tuple[str, str]] = set()
    unplaced: set[str] = set()

    for r in range(1, sheet.nrows):
        postcode, locality, sub, main_commune, province = sheet.row_values(r)[:5]
        if not province:
            continue
        postcode = f"{int(postcode):04d}"
        locality, main_commune = str(locality).strip(), str(main_commune).strip()

        if main_commune in MERGERS_2025:
            code, name = MERGERS_2025[main_commune]
            # A merger that kept an old commune's name keeps its other name too (Bastenaken).
            names = {main_commune.title(), *(strip_paren(communes[c][0]) for c in by_name.get(key(main_commune), set()))}
            aliases = {n for n in names if key(n) != key(name)}
        else:
            override = BPOST_OVERRIDES.get((main_commune, str(province).strip()))
            codes = {override} if override else by_name.get(key(main_commune), set())
            if len(codes) != 1:
                unplaced.add(f"{main_commune} → {sorted(codes) or 'no REFNIS code'}")
                continue
            code = next(iter(codes))
            name = shown(code)
            national = strip_paren(communes[code][0])
            aliases = {national} if key(national) != key(name) else set()

        entry = out_communes.setdefault(code, {"name": name, "aliases": set()})
        entry["aliases"] |= aliases

        # The main locality of a commune is shown under the commune's own name,
        # so « 1050 Elsene » reads « 1050 Ixelles »; bpost's name stays searchable.
        alias = ""
        if sub == "Non" and key(locality) in {key(main_commune), *(key(a) for a in aliases)}:
            if key(locality) != key(name):
                alias = locality
            locality = name

        if (postcode, locality) in seen:
            continue
        seen.add((postcode, locality))
        localities.append([postcode, locality, code] + ([alias] if alias else []))

    if unplaced:
        sys.exit("bpost communes with no single REFNIS code:\n  " + "\n  ".join(sorted(unplaced)))

    today = datetime.date.today().isoformat()
    localities.sort(key=lambda x: (x[0], key(x[1])))
    communes_ts = {
        code: {"name": v["name"], **({"aliases": sorted(v["aliases"])} if v["aliases"] else {})}
        for code, v in sorted(out_communes.items())
    }

    OUT.write_text(
        f"""/**
 * GENERATED by scripts/communes/generate.py on {today}. Do not edit by hand.
 *
 * Every Belgian postal locality with its commune's REFNIS (INS) code.
 * {len(communes_ts)} communes, {len(localities)} localities.
 *
 * Sources:
 * - bpost, localities by postcode: {BPOST_URL}
 * - Eurostat, LAU 2025 list, Belgium (Statbel's REFNIS codes): {LAU_URL}
 * - the 2025 mergers' REFNIS codes, per Statbel ({STATBEL_URL}), listed in the script
 */

export type CommuneRecord = {{ name: string; aliases?: string[] }};

/** REFNIS code → the commune's name (French where one exists) and its other names. */
export const COMMUNES: Record<string, CommuneRecord> = {{
{chr(10).join(f"  {json.dumps(c)}: {json.dumps(v, ensure_ascii=False)}," for c, v in communes_ts.items())}
}};

/** [postcode, locality, REFNIS code, bpost's name when it differs from the one shown]. */
export const LOCALITIES: ReadonlyArray<readonly [string, string, string, string?]> = [
{chr(10).join("  " + json.dumps(x, ensure_ascii=False) + "," for x in localities)}
];
""",
        encoding="utf-8",
    )
    print(f"wrote {OUT} — {len(communes_ts)} communes, {len(localities)} localities")
    return set(communes_ts)


def committed_codes() -> set[str]:
    """The REFNIS codes of the committed data.ts."""
    block = OUT.read_text(encoding="utf-8").split("export const COMMUNES", 1)[1].split("};", 1)[0]
    return set(re.findall(r'^  "(\d{5})": \{', block, re.MULTILINE))


def write_centres(codes: set[str]) -> None:
    """Writes centres.ts: one centre per code of data.ts, from AdminVector."""
    # The zip is 100 MB: to a temporary file, never into the repo.
    with tempfile.TemporaryFile() as tmp:
        req = urllib.request.Request(ADMINVECTOR_URL, headers={"User-Agent": "berceo-communes/1.0"})
        with urllib.request.urlopen(req, timeout=120) as res:
            shutil.copyfileobj(res, tmp)
        tmp.seek(0)
        with zipfile.ZipFile(tmp) as z:
            layer = {ext: io.BytesIO(z.read(f"{ADMINVECTOR_LAYER}.{ext}")) for ext in ("shp", "shx", "dbf")}
            prj = z.read(f"{ADMINVECTOR_LAYER}.prj").decode()
    if "WGS_1984" not in prj:
        sys.exit(f"AdminVector's {ADMINVECTOR_LAYER} is not in WGS 84: {prj}")

    centres: dict[str, tuple[float, float]] = {}
    duplicates: set[str] = set()
    with shapefile.Reader(**layer, encoding="utf-8") as reader:
        for row in reader.iterShapeRecords():
            code = ADMINVECTOR_OVERRIDES.get(row.record["niscode"], row.record["niscode"])
            if code in centres:
                duplicates.add(code)
            longitude, latitude = row.shape.points[0]
            centres[code] = (latitude, longitude)

    problems = [f"twice in AdminVector: {c}" for c in sorted(duplicates)]
    problems += [f"in AdminVector, not in data.ts: {c}" for c in sorted(set(centres) - codes)]
    problems += [f"in data.ts, not in AdminVector: {c}" for c in sorted(codes - set(centres))]
    if problems:
        sys.exit("the centres and the communes do not match:\n  " + "\n  ".join(problems))

    today = datetime.date.today().isoformat()
    overrides = ", ".join(f"{a} → {b}" for a, b in ADMINVECTOR_OVERRIDES.items()) or "none"
    CENTRES_OUT.write_text(
        f"""/**
 * GENERATED by scripts/communes/generate.py on {today}. Do not edit by hand.
 *
 * Each commune's official centre: REFNIS (INS) code → [latitude, longitude],
 * WGS 84, five decimals. {len(centres)} communes, the codes of data.ts.
 * Server-only: the browser bundle never carries it.
 *
 * Source: NGI-IGN, AdminVector, layer municipalcenter, downloaded on {today}.
 * - download: {ADMINVECTOR_URL}
 * - the geo.be record: {ADMINVECTOR_RECORD}
 * - licence: Creative Commons Attribution 4.0 (CC BY 4.0), https://creativecommons.org/licenses/by/4.0/
 * - codes mapped to ours: {overrides}
 */
import "server-only";

export const CENTRES: Record<string, readonly [number, number]> = {{
{chr(10).join(f'  "{c}": [{lat:.5f}, {lon:.5f}],' for c, (lat, lon) in sorted(centres.items()))}
}};
""",
        encoding="utf-8",
    )
    print(f"wrote {CENTRES_OUT} — {len(centres)} centres")


def main() -> None:
    args = sys.argv[1:]
    if args == []:
        write_centres(write_data())
    elif args == ["centres"]:
        write_centres(committed_codes())
    else:
        sys.exit("usage: generate.py [centres]")


if __name__ == "__main__":
    main()
