const CORES = ['#c8262c', '#e5a823', '#17756f', '#ffd978', '#1a120e', '#f28aa0']

/** Chuva de confete que cai uma vez. Posições fixas por índice para não variar entre servidor e cliente. */
export default function Confete({ pieces = 36, fall = '100vh', delay = 0 }: { pieces?: number; fall?: string; delay?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: pieces }, (_, i) => {
        const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1
        const round = r(5) > 0.7
        return (
          <span
            key={i}
            className="confete"
            style={
              {
                left: `${r(1) * 100}%`,
                background: CORES[i % CORES.length],
                width: round ? 10 : 7 + r(2) * 6,
                height: round ? 10 : 12 + r(3) * 8,
                borderRadius: round ? 999 : 2,
                '--delay': `${delay + r(4) * 1.4}s`,
                '--dur': `${2.6 + r(6) * 2}s`,
                '--drift': `${(r(7) - 0.5) * 160}px`,
                '--spin': `${360 + r(8) * 720}deg`,
                '--fall': fall,
              } as React.CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
