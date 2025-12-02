import React, { useMemo } from "react";
import { theme as ThemeTokens } from "../theme";

/**
 * PUBLIC_INTERFACE
 * TrendChart - Lightweight, dependency-free inline SVG chart.
 *
 * Props:
 * - data: Array<{ x: number|string, y: number }>
 * - width: number (px)
 * - height: number (px)
 * - stroke: CSS color (default: var(--color-primary))
 * - fill: CSS color for area under curve (optional)
 * - showAxis: boolean (default: false)
 * - showDots: boolean (default: false)
 * - accessibleLabel: string (aria-label for the chart)
 */
export default function TrendChart({
  data = [],
  width = 320,
  height = 120,
  stroke = "var(--color-primary)",
  fill = "rgba(37,99,235,0.18)",
  showAxis = false,
  showDots = false,
  accessibleLabel = "Trend chart"
}) {
  const padding = { top: 10, right: 8, bottom: 16, left: 8 };
  const innerW = Math.max(width - padding.left - padding.right, 1);
  const innerH = Math.max(height - padding.top - padding.bottom, 1);

  const points = Array.isArray(data) ? data.filter(d => typeof d?.y === "number") : [];

  const { path, area, minY, maxY } = useMemo(() => {
    if (points.length === 0) return { path: "", area: "", minY: 0, maxY: 1 };
    const ys = points.map(p => p.y);
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    const yRange = max - min || Math.max(max, 1);

    const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;
    const toX = (i) => padding.left + i * stepX;
    const toY = (y) => padding.top + innerH - ((y - min) / yRange) * innerH;

    let d = "";
    points.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p.y);
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    // Area path
    let a = "";
    if (fill) {
      const firstX = toX(0);
      const lastX = toX(points.length - 1);
      a = `M ${firstX} ${toY(points[0].y)} ` + points.map((p, i) => `L ${toX(i)} ${toY(p.y)}`).join(" ") + ` L ${lastX} ${padding.top + innerH} L ${firstX} ${padding.top + innerH} Z`;
    }

    return { path: d, area: a, minY: min, maxY: max };
  }, [points, innerW, innerH, padding.left, padding.top, fill]);

  // Axis ticks (simple: 2 ticks - min and max)
  const ticks = useMemo(() => {
    if (!showAxis) return [];
    return [
      { y: minY, label: formatTick(minY) },
      { y: maxY, label: formatTick(maxY) }
    ];
  }, [showAxis, minY, maxY]);

  function formatTick(v) {
    // choose compact formatting for readability
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return String(Math.round(v));
  }

  return (
    <figure
      role="img"
      aria-label={accessibleLabel}
      style={{ margin: 0 }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {/* Background grid/axis */}
        {showAxis && (
          <>
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={height - padding.bottom}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            {ticks.map((t, i) => {
              const yRatio = (t.y - minY) / ((maxY - minY) || 1);
              const y = padding.top + innerH - yRatio * innerH;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="var(--color-border)"
                    strokeDasharray="2,4"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left + 4}
                    y={y - 4}
                    fontSize="10"
                    fill="var(--color-text-muted)"
                  >
                    {t.label}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* Area under line */}
        {fill && area && (
          <path d={area} fill={fill} stroke="none" />
        )}

        {/* Trend line */}
        <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Points */}
        {showDots &&
          points.map((p, i) => {
            const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;
            const x = padding.left + i * stepX;
            const yRatio = (p.y - minY) / ((maxY - minY) || 1);
            const y = padding.top + innerH - yRatio * innerH;
            return <circle key={i} cx={x} cy={y} r="2.5" fill={stroke} />;
          })}
      </svg>
    </figure>
  );
}
