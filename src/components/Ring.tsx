interface RingProps {
  ratio: number
  size?: number
  label?: string
  color?: string
}

/** Circular progress ring with a centered percentage. */
export default function Ring({ ratio, size = 96, label, color = '#22d3c5' }: RingProps) {
  const stroke = size * 0.11
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.round(ratio * 100)

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`${pct}% complete`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring__center">
        <span className="ring__pct">{pct}%</span>
        {label && <span className="ring__label">{label}</span>}
      </div>
    </div>
  )
}
