"use client";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #FFF8E7 0%, #FAF3E1 50%, #F5EDD5 100%)",
        padding: "20px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "500px" }}>
        {/* 404 Icon */}
        <div
          style={{
            fontSize: "clamp(80px, 15vw, 120px)",
            fontWeight: "900",
            background: "linear-gradient(135deg, #FF6D1F 0%, #FF9A4D 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "24px",
            lineHeight: "1",
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 36px)",
            marginBottom: "16px",
            color: "#1a1a1a",
            fontWeight: "800",
          }}
        >
          المنيو غير موجود
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "rgba(26, 26, 26, 0.7)",
            marginBottom: "32px",
            lineHeight: "1.6",
          }}
        >
          عذراً، لم نتمكن من العثور على هذا المنيو. ربما تم حذفه أو تغيير رابطه.
        </p>

        {/* Decorative Elements */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <span style={{ fontSize: "40px" }}>🍽️</span>
          <span style={{ fontSize: "40px" }}>❓</span>
          <span style={{ fontSize: "40px" }}>🔍</span>
        </div>

        {/* Back Button */}
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 32px",
            fontSize: "16px",
            background: "linear-gradient(135deg, #FF6D1F 0%, #FF8C42 100%)",
            color: "white",
            border: "none",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: "700",
            boxShadow: "0 8px 24px rgba(255, 109, 31, 0.3)",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 12px 32px rgba(255, 109, 31, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 8px 24px rgba(255, 109, 31, 0.3)";
          }}
        >
          <i className="ri-home-line" style={{ fontSize: "20px" }} />
          العودة للرئيسية
        </a>
      </div>
    </div>
  );
}
