"use client"

import { useEditor, EditorContent, useEditorState } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Quote,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Editor de texto enriquecido para el contenido expandido de campañas.
 * Tiptap v3: StarterKit ya incluye la extensión Link, se configura ahí
 * (agregarla aparte duplicaría la extensión y tira warning).
 * `immediatelyRender: false` es obligatorio en Next/SSR para evitar
 * hydration mismatch.
 */
export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? "" : editor.getHTML())
    },
    editorProps: {
      attributes: { class: "rich-content" },
    },
  })

  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      h2: editor?.isActive("heading", { level: 2 }) ?? false,
      h3: editor?.isActive("heading", { level: 3 }) ?? false,
      bulletList: editor?.isActive("bulletList") ?? false,
      orderedList: editor?.isActive("orderedList") ?? false,
      link: editor?.isActive("link") ?? false,
      blockquote: editor?.isActive("blockquote") ?? false,
    }),
  })

  function setLink() {
    if (!editor) return
    const previous = (editor.getAttributes("link").href as string) ?? ""
    const input = window.prompt(
      "URL del link (tiene que empezar con http:// o https://):",
      previous,
    )
    if (input === null) return
    const url = input.trim()
    if (url === "") {
      editor.chain().focus().unsetLink().run()
      return
    }
    if (!isHttpUrl(url)) {
      window.alert("La URL no es válida. Tiene que empezar con http:// o https://.")
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const BUTTONS = [
    {
      label: "Negrita",
      icon: <Bold size={15} />,
      isActive: active?.bold,
      onClick: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      label: "Cursiva",
      icon: <Italic size={15} />,
      isActive: active?.italic,
      onClick: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      label: "Título",
      icon: <Heading2 size={15} />,
      isActive: active?.h2,
      onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Subtítulo",
      icon: <Heading3 size={15} />,
      isActive: active?.h3,
      onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Lista",
      icon: <List size={15} />,
      isActive: active?.bulletList,
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Lista numerada",
      icon: <ListOrdered size={15} />,
      isActive: active?.orderedList,
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Link",
      icon: <Link2 size={15} />,
      isActive: active?.link,
      onClick: setLink,
    },
    {
      label: "Cita",
      icon: <Quote size={15} />,
      isActive: active?.blockquote,
      onClick: () => editor?.chain().focus().toggleBlockquote().run(),
    },
  ]

  return (
    <div className="rte-wrapper">
      <div className="rte-toolbar" role="toolbar" aria-label="Formato de texto">
        {BUTTONS.map((b) => (
          <button
            key={b.label}
            type="button"
            title={b.label}
            aria-label={b.label}
            onClick={b.onClick}
            className={`rte-btn${b.isActive ? " is-active" : ""}`}
          >
            {b.icon}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
