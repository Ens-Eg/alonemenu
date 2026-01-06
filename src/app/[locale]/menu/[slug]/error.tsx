"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
        {/* Error Icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(220, 38, 38, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <span style={{ fontSize: "48px" }}>⚠️</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 36px)",
            marginBottom: "16px",
            color: "#dc2626",
            fontWeight: "800",
          }}
        >
          حدث خطأ
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "rgba(26, 26, 26, 0.7)",
            marginBottom: "32px",
            lineHeight: "1.6",
          }}
        >
          عذراً، حدث خطأ أثناء تحميل المنيو. يرجى المحاولة مرة أخرى.
        </p>

        {/* Error details (optional - only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              background: "rgba(220, 38, 38, 0.05)",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              textAlign: "left",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#dc2626",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {error.message}
            </p>
          </div>
        )}

        {/* Retry Button */}
        <button
          onClick={() => reset()}
          style={{
            padding: "14px 32px",
            fontSize: "16px",
            background: "linear-gradient(135deg, #FF6D1F 0%, #FF8C42 100%)",
            color: "white",
            border: "none",
            borderRadius: "999px",
            cursor: "pointer",
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
          حاول مرة أخرى
        </button>
      </div>
    </div>
  );
}



