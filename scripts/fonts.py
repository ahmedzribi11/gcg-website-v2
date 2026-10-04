"""
Construit les deux fichiers de police du site (src/fonts/) à partir des sources OFL :
- Geist (variable, graisses 300 à 600), source : paquet npm « geist » (dist/fonts/geist-sans/Geist-Variable.woff2)
- Instrument Serif italique, source : @fontsource/instrument-serif (sous-ensemble latin)

Les sous-ensembles couvrent le français complet (accents, capitales accentuées, œ æ, « » ’, m²)
et l’espace fine insécable U+202F, absente des polices d’origine : elle est associée au glyphe
de l’espace insécable pour éviter tout glyphe de repli.

Usage : python3 scripts/fonts.py <Geist-Variable.woff2>
Dépendances : pip install fonttools brotli
"""
import sys
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "fonts"

UNICODES = (
    list(range(0x20, 0x7F))  # latin de base
    + list(range(0xA0, 0x100))  # latin-1 (é è ê ë à â î ï ô û ù ü ÿ ç æ, capitales, « », ², ×)
    + [0x152, 0x153, 0x178, 0x2C6, 0x2DC]  # Œ œ Ÿ ˆ ˜
    + [0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C, 0x201D, 0x201E, 0x2022, 0x2026, 0x2039, 0x203A]
    + [0x20AC, 0x2122, 0x2212]
)


def add_narrow_nbsp(font: TTFont) -> None:
    for table in font["cmap"].tables:
        if table.isUnicode() and 0xA0 in table.cmap:
            table.cmap[0x202F] = table.cmap[0xA0]


def subset(font: TTFont) -> None:
    opts = Options()
    opts.layout_features = ["kern", "liga", "calt", "tnum", "case", "ccmp", "locl", "mark", "mkmk"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.drop_tables += ["DSIG"]
    s = Subsetter(opts)
    s.populate(unicodes=UNICODES)
    s.subset(font)


def save(font: TTFont, name: str) -> None:
    font.flavor = "woff2"
    path = OUT / name
    font.save(path)
    print(f"{path.relative_to(ROOT)}: {path.stat().st_size / 1024:.1f} KB")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    geist = TTFont(sys.argv[1])
    geist = instantiateVariableFont(geist, {"wght": (300, 600)})
    subset(geist)
    add_narrow_nbsp(geist)
    save(geist, "geist-300-600.woff2")

    serif = TTFont(ROOT / "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2")
    subset(serif)
    add_narrow_nbsp(serif)
    save(serif, "instrument-serif-italic.woff2")


if __name__ == "__main__":
    main()
