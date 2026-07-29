export default function HomePage() {
  return (
    <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <p style={{ color: "#8b93a7", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
        Not yet available
      </p>
      <h1 style={{ fontSize: "clamp(1.9rem, 1.2rem + 3vw, 3rem)", lineHeight: 1.1, margin: "0.75rem 0 1rem" }}>
        DealDesk
      </h1>
      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "#c3c9d6", margin: 0 }}>
        Lease abstracting and closing workflow over one shared property record. A lease
        parsed here populates the critical dates that the closing engine tracks.
      </p>
      <p style={{ marginTop: "2rem", color: "#8b93a7", fontSize: "0.9rem", lineHeight: 1.7 }}>
        This surface is under construction and takes no payments. Engines are ported and
        under test; checkout is intentionally dark.
      </p>
    </main>
  )
}
