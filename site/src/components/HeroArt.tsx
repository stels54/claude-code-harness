const ink = { stroke: 'var(--line)' }
const faint = { stroke: 'var(--line-faint)' }
const ochre = { stroke: 'var(--ochre)' }
const rose = { stroke: 'var(--rose)' }
const teal = { stroke: 'var(--teal)' }
const violet = { stroke: 'var(--violet)' }

const spires: [number, number, number][] = [
  [150, 120, 14],
  [196, 70, 18],
  [244, 140, 12],
  [300, 46, 22],
  [356, 110, 16],
  [404, 84, 14],
  [452, 150, 12],
  [492, 120, 10],
]

function HeroArt() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 640 300"
      width="100%"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--violet)" stopOpacity="0.16" />
          <stop offset="0.55" stopColor="var(--rose)" stopOpacity="0.2" />
          <stop offset="1" stopColor="var(--sunset)" stopOpacity="0.26" />
        </linearGradient>
        <clipPath id="hero-window">
          <path d="M110 300 V140 A210 120 0 0 1 530 140 V300 Z" />
        </clipPath>
      </defs>

      <path d="M110 300 V140 A210 120 0 0 1 530 140 V300 Z" fill="url(#hero-sky)" />

      <g clipPath="url(#hero-window)" strokeWidth="1">
        <circle cx="412" cy="96" r="26" style={rose} />
        <circle cx="412" cy="96" r="20" style={faint} />
        <ellipse cx="412" cy="96" rx="48" ry="9" transform="rotate(-14 412 96)" style={ochre} />
        <circle cx="210" cy="52" r="5" style={violet} />
        <path d="M166 74 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" style={ochre} />

        <g style={teal}>
          <ellipse cx="252" cy="92" rx="16" ry="4" />
          <path d="M244 90 q8 -9 16 0" />
          <ellipse cx="478" cy="90" rx="11" ry="3" />
          <path d="M472 88 q6 -6 12 0" />
        </g>

        <g style={ink} strokeWidth="1.1">
          {spires.map(([x, top, w]) => (
            <g key={x}>
              <path d={`M${x - w} 300 V${top + 40} L${x} ${top} L${x + w} ${top + 40} V300`} />
              <path d={`M${x} ${top} V${top - 18}`} />
              <path d={`M${x - w} ${top + 60} H${x + w} M${x - w} ${top + 90} H${x + w}`} style={faint} />
              <circle cx={x} cy={top + 24} r="2.5" />
            </g>
          ))}
        </g>

        <path d="M110 232 C190 214 260 246 330 226 S470 206 530 228" style={ochre} strokeWidth="1.2" />
        <path d="M110 250 H530" style={ink} />
        <path d="M150 262 H490 M190 274 H450" style={faint} />
      </g>

      <g style={ink} strokeWidth="1.4">
        <path d="M110 300 V140 A210 120 0 0 1 530 140 V300" />
        <path d="M96 300 V138 A224 132 0 0 1 544 138 V300" />
        <path d="M320 20 V300 M110 196 H530" style={faint} />
      </g>
      <path d="M60 300 H580" style={ink} strokeWidth="1.4" />
      <path d="M40 290 H600" style={faint} />
    </svg>
  )
}

export default HeroArt
