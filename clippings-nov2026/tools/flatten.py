import json, re, sys
BOOKS = [
  ("xl/clipping_de_prensa_bcm.json", "bolsa-comercio"),
  ("xl/clipping_lndlc.json", "noche-de-los-chefs"),
  ("xl/clipping_acutis.json", "capilla-acutis"),
  ("xl/clipping_valley.json", "grupo-presidente"),
  ("xl/clipping_cn.json", "colegio-notarial"),
  ("xl/clipping_chakaymanta.json", "chakaymanta"),
]
out = []
for path, slug in BOOKS:
    d = json.load(open(path, encoding="utf-8"))
    for sheet, rows in d.items():
        for r in rows:
            cells = r["cells"]
            medio = None
            url = None
            text = None
            for ref in sorted(cells, key=lambda k: (len(re.match(r"[A-Z]+", k).group()), k)):
                col = re.match(r"[A-Z]+", ref).group()
                c = cells[ref]
                v = (c.get("v") or "").strip()
                if col == "A":
                    medio = v
                    continue
                link = c.get("link")
                if link and link.startswith("http"):
                    url = link.strip(); text = v
                    break
                if re.match(r"^https?://", v):
                    url = v; text = v
                    break
            if not url:
                out.append({"slug": slug, "sheet": sheet, "row": r["row"], "medio": medio, "url": None, "text": None})
                continue
            out.append({"slug": slug, "sheet": sheet, "row": r["row"], "medio": medio, "url": url, "text": text})
json.dump(out, open("candidates.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
from collections import Counter
c = Counter((o["slug"], o["url"] is not None) for o in out)
for k, v in sorted(c.items()): print(k, v)
print("sin url (muestra):")
for o in out:
    if not o["url"] and o["medio"] and o["medio"] not in ("MEDIO","Z") : print("  ", o["slug"], o["sheet"], o["row"], o["medio"])
