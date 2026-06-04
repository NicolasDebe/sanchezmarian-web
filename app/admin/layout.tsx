export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-hueso-oscuro)" }}>
      {children}
    </div>
  )
}
