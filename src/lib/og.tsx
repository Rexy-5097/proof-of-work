import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Branded OG card: the design system's dark panel, seal, mono label and
 * serif headline. Shared by every route's opengraph-image.
 */
export function renderOgCard({
  label,
  title,
  footer,
}: {
  label: string;
  title: string;
  footer: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#070b12",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#5f7288",
            fontSize: 26,
            fontFamily: "monospace",
            letterSpacing: 3,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 12 12">
            <path d="M6 0.8 L11.2 6 L6 11.2 L0.8 6 Z" fill="#3dd698" />
          </svg>
          {label}
        </div>
        <div
          style={{
            color: "#e6edf6",
            fontSize: 72,
            lineHeight: 1.12,
            maxWidth: 980,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(148,163,184,0.25)",
            paddingTop: 28,
            color: "#9db0c4",
            fontSize: 24,
            fontFamily: "monospace",
          }}
        >
          <span>{footer}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 10, color: "#3dd698" }}>
            <svg width="16" height="16" viewBox="0 0 12 12">
              <path d="M6 0.8 L11.2 6 L6 11.2 L0.8 6 Z" fill="#3dd698" />
            </svg>
            VERIFIED SOURCES
          </span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
