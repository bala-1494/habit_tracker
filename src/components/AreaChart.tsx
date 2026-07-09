interface AreaChartProps {
  /** values in 0..1 */
  values: number[]
  height?: number
}

/** Smooth teal area chart for daily progress (pure SVG, no chart library). */
export default function AreaChart({ values, height = 120 }: AreaChartProps) {
  const width = 1000
  const n = values.length
  if (n === 0) return <div className="chart chart--empty">No data yet</div>

  const step = n > 1 ? width / (n - 1) : width
  const y = (v: number) => height - v * (height - 10) - 4
  const points = values.map((v, i) => [i * step, y(v)] as const)

  // Catmull-Rom -> cubic bezier for a soft curve.
  let path = `M ${points[0][0]},${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    path += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`
  }
  const area = `${path} L ${width},${height} L 0,${height} Z`

  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Daily progress trend">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3c5" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#22d3c5" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaFill)" />
      <path d={path} fill="none" stroke="#22d3c5" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
