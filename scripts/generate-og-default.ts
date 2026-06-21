/**
 * Genera la imagen OG por defecto (1200x630) del sitio.
 * Render de un HTML con la paleta de marca (bordó + hueso + dorado) + el logo
 * negativo, capturado con Edge headless. Salida: public/og/default.jpg.
 * Ejecutar: npx tsx scripts/generate-og-default.ts
 *
 * Es un asset estático que se versiona en el repo; correr de nuevo solo si
 * cambia la marca. NO necesita el server corriendo.
 */
import { chromium } from "playwright-core"
import { mkdirSync, readFileSync } from "fs"
import path from "path"

const OUT_DIR = path.resolve(process.cwd(), "public/og")
const OUT = path.join(OUT_DIR, "default.jpg")

// Logo negativo (claro) embebido como data URI para no depender de red ni server.
const logoPath = path.resolve(process.cwd(), "public/images/logo-marian-negativo.png")
const logoB64 = readFileSync(logoPath).toString("base64")
const logoSrc = `data:image/png;base64,${logoB64}`

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Mono:wght@400&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:1200px; height:630px; }
  .card {
    width:1200px; height:630px; position:relative; overflow:hidden;
    background:
      radial-gradient(ellipse at 75% 85%, rgba(102,0,31,0.55) 0%, transparent 55%),
      radial-gradient(ellipse at 20% 10%, rgba(140,26,53,0.35) 0%, transparent 50%),
      #3D000F;
    display:flex; flex-direction:column; justify-content:center;
    padding:90px 100px; color:#FEFCEF;
    font-family:'Playfair Display', serif;
  }
  .frame { position:absolute; inset:38px; border:1px solid rgba(201,168,130,0.35); border-radius:14px; pointer-events:none; }
  .logo { height:84px; width:auto; margin-bottom:54px; }
  .tagline { font-size:74px; font-weight:700; line-height:1.08; letter-spacing:-0.01em; max-width:820px; }
  .tagline em { font-style:italic; color:#C9A882; font-weight:500; }
  .rule { width:88px; height:3px; background:#C9A882; margin:40px 0 26px; }
  .meta { font-family:'DM Mono', monospace; font-size:23px; letter-spacing:0.14em; text-transform:uppercase; color:rgba(254,252,239,0.75); }
</style></head>
<body>
  <div class="card">
    <div class="frame"></div>
    <img class="logo" src="${logoSrc}" />
    <div class="tagline">Comunicación <em>con propósito</em></div>
    <div class="rule"></div>
    <div class="meta">Estrategia de comunicación · Mendoza, Argentina</div>
  </div>
</body></html>`

async function run() {
  mkdirSync(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.setContent(html, { waitUntil: "networkidle" })
  // margen para que las webfonts terminen de aplicar
  await page.waitForTimeout(600)
  await page.screenshot({ path: OUT, type: "jpeg", quality: 90, clip: { x: 0, y: 0, width: 1200, height: 630 } })
  await browser.close()
  console.log("✓ OG default generada en " + OUT)
}
run().catch((e) => { console.error(e); process.exit(1) })
