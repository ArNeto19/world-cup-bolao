import React from "react";

interface Props {
  /** ISO 3166-1 alpha-2 code — used to build the FlagKit CDN URL */
  countryCode: string;
  /** Height in px (width auto via natural 3:2 ratio) */
  size?: number;
  style?: React.CSSProperties;
}

const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/madebybowtie/FlagKit@master/Assets/SVG";

/**
 * Renders a country flag from the FlagKit asset library via jsDelivr CDN.
 * Falls back to a neutral grey rectangle when the code is "TBD" or unknown.
 */
export function TeamFlag({ countryCode, size = 24, style }: Props) {
  const isTBD = !countryCode || countryCode === "TBD";

  const base: React.CSSProperties = {
    height: size,
    width: size * 1.5,
    borderRadius: 3,
    objectFit: "cover",
    flexShrink: 0,
    display: "inline-block",
    verticalAlign: "middle",
    ...style,
  };

  if (isTBD) {
    return (
      <span
        style={{
          ...base,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 3,
        }}
      />
    );
  }

  return (
    <img
      src={`${CDN_BASE}/${countryCode.toUpperCase()}.svg`}
      alt={countryCode}
      style={base}
      loading="lazy"
      onError={(e) => {
        // Hide broken image and show placeholder
        (e.currentTarget as HTMLImageElement).style.background =
          "rgba(255,255,255,0.12)";
        (e.currentTarget as HTMLImageElement).src = "";
      }}
    />
  );
}
