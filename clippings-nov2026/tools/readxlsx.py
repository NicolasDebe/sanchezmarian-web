"""Lee un .xlsx con la stdlib: por hoja, filas con texto de celda + hipervinculo.
Uso: python -I readxlsx.py <archivo.xlsx> <salida.json>
"""
import json, re, sys, zipfile
import xml.etree.ElementTree as ET

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}
RID = "{%s}id" % NS["r"]


def col_idx(ref):
    letters = re.match(r"[A-Z]+", ref).group(0)
    n = 0
    for ch in letters:
        n = n * 26 + ord(ch) - 64
    return n - 1


def main(path, out):
    z = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in root.findall("m:si", NS):
            shared.append("".join(t.text or "" for t in si.iter("{%s}t" % NS["m"])))

    wb = ET.fromstring(z.read("xl/workbook.xml"))
    wbrels = {r.get("Id"): r.get("Target") for r in ET.fromstring(z.read("xl/_rels/workbook.xml.rels")).findall("rel:Relationship", NS)}
    sheets = []
    for s in wb.find("m:sheets", NS).findall("m:sheet", NS):
        target = wbrels[s.get(RID)]
        target = target.lstrip("/")
        if not target.startswith("xl/"):
            target = "xl/" + target
        sheets.append((s.get("name"), target))

    result = {}
    for name, target in sheets:
        root = ET.fromstring(z.read(target))
        relpath = target.replace("worksheets/", "worksheets/_rels/") + ".rels"
        links = {}
        if relpath in z.namelist():
            for r in ET.fromstring(z.read(relpath)).findall("rel:Relationship", NS):
                links[r.get("Id")] = r.get("Target")
        cell_link = {}
        hl = root.find("m:hyperlinks", NS)
        if hl is not None:
            for h in hl.findall("m:hyperlink", NS):
                url = links.get(h.get(RID)) or h.get("location")
                ref = h.get("ref")
                # rangos A1:A3 -> cada celda
                if ":" in ref:
                    a, b = ref.split(":")
                    ra, rb = int(re.search(r"\d+", a).group()), int(re.search(r"\d+", b).group())
                    ca = re.match(r"[A-Z]+", a).group()
                    for rr in range(ra, rb + 1):
                        cell_link[f"{ca}{rr}"] = url
                else:
                    cell_link[ref] = url
        rows = []
        for row in root.find("m:sheetData", NS).findall("m:row", NS):
            cells = {}
            for c in row.findall("m:c", NS):
                ref = c.get("r")
                t = c.get("t")
                v = c.find("m:v", NS)
                f = c.find("m:f", NS)
                text = None
                if t == "s" and v is not None:
                    text = shared[int(v.text)]
                elif t == "inlineStr":
                    text = "".join(x.text or "" for x in c.iter("{%s}t" % NS["m"]))
                elif v is not None:
                    text = v.text
                item = {"v": text}
                if f is not None and f.text:
                    item["f"] = f.text
                if ref in cell_link:
                    item["link"] = cell_link[ref]
                if text is not None or "link" in item:
                    cells[ref] = item
            if cells:
                rows.append({"row": int(row.get("r")), "cells": cells})
        result[name] = rows
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=1)
    for n, rows in result.items():
        print(f"{path.split(chr(92))[-1]} :: {n}: {len(rows)} filas")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
