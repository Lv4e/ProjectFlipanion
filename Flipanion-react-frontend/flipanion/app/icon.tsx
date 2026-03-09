import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #be123c, #fb7185, #f472b6)",
          borderRadius: "14px",
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 900,
            color: "white",
            lineHeight: 1,
            letterSpacing: "-2px",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          ⚡
        </div>
      </div>
    ),
    { ...size },
  );
}
