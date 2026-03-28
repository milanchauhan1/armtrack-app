export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", color: "#3B82F6", marginBottom: 16, textTransform: "uppercase" }}>
        404
      </p>
      <h1 style={{ fontSize: 40, fontWeight: 350, letterSpacing: "-0.03em", color: "#f5f5f5", margin: "0 0 16px" }}>
        Page not found.
      </h1>
      <p style={{ fontSize: 16, color: "#888888", marginBottom: 36 }}>
        This page doesn&apos;t exist or was moved.
      </p>
      <a
        href="/"
        style={{
          background: "#3B82F6",
          color: "#ffffff",
          padding: "12px 28px",
          borderRadius: 999,
          fontSize: 15,
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 0 24px rgba(59,130,246,0.4)",
        }}
      >
        Back to ArmTrack
      </a>
    </div>
  );
}
