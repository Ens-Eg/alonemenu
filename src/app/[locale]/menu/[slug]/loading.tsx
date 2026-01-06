"use client";

export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #FFF8E7 0%, #FAF3E1 50%, #F5EDD5 100%)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* Spinner */}
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #FF6D1F",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px",
          }}
        />
        
        <p
          style={{
            fontSize: "18px",
            color: "#1a1a1a",
            fontWeight: "500",
          }}
        >
          جاري التحميل...
        </p>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

