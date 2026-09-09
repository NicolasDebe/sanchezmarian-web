/**
 * Escribe los dos mails de reseñas a .preview-emails/ para abrirlos en el
 * navegador. NO manda nada ni toca la base.
 *
 *   npx tsx scripts/preview-emails.ts
 *
 * Sirve para revisar el diseño después de tocar las plantillas, y para chequear
 * que el texto que escribe un usuario sale escapado (el ejemplo incluye HTML
 * adentro del body a propósito).
 */
import * as dotenv from "dotenv"
import path from "path"
import fs from "fs"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const OUT = path.resolve(process.cwd(), ".preview-emails")

async function main() {
  const { verificationHtml, moderationHtml } = await import("../lib/testimonials-email")

  fs.mkdirSync(OUT, { recursive: true })

  const link =
    "https://www.sanchezmarian.com/resenas/verificar/8f14e45f-ceea-467a-9a2b-1c3d4e5f6a7b"

  fs.writeFileSync(
    path.join(OUT, "verificacion.html"),
    verificationHtml("Lucía Fernández", link),
  )

  fs.writeFileSync(
    path.join(OUT, "moderacion.html"),
    moderationHtml(
      {
        id: "8f14e45f-ceea-467a-9a2b-1c3d4e5f6a7b",
        reviewer_type: "periodista",
        author_name: "Lucía <script>alert(1)</script> Fernández",
        author_role: "Editora de Economía",
        author_brand: "Los Andes & Asociados",
        rating: 4,
        body:
          "Trabajar con Marian fue clarísimo de punta a punta.\n\nEntiende los tiempos de la redacción, manda material chequeado y nunca insiste de más. <b>Esto NO debería verse en negrita.</b>",
      },
      "https://www.sanchezmarian.com/admin/resenas",
    ),
  )

  console.log(`Listo. Abrí:\n  ${path.join(OUT, "verificacion.html")}\n  ${path.join(OUT, "moderacion.html")}`)
}

main()
