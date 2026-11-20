/**
 * Original, hand-drawn SVG silhouettes of a landmark and a simple flag per language,
 * used in the lessons hero banner. Colours come from currentColor / CSS variables so
 * they follow the light (blue) and dark (navy + gold) themes.
 */
type P = { className?: string };

const LANDMARKS: Record<string, (p: P) => React.ReactElement> = {
  // Clock tower (London)
  en: ({ className }) => (
    <svg viewBox="0 0 120 200" className={className} aria-hidden>
      <path d="M52 0 L60 -2 L68 0 L72 30 L48 30 Z" transform="translate(0 6)" />
      <rect x="44" y="36" width="32" height="40" />
      <circle cx="60" cy="56" r="11" fill="var(--hero-sky, #fff)" />
      <path d="M60 49 V56 L65 59" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="42" y="76" width="36" height="124" />
      <rect x="49" y="90" width="6" height="14" fill="var(--hero-sky, #fff)" opacity=".5" />
      <rect x="65" y="90" width="6" height="14" fill="var(--hero-sky, #fff)" opacity=".5" />
      <rect x="49" y="120" width="6" height="14" fill="var(--hero-sky, #fff)" opacity=".5" />
      <rect x="65" y="120" width="6" height="14" fill="var(--hero-sky, #fff)" opacity=".5" />
      <path d="M0 200 V150 H20 V140 H30 V150 H42 V200 Z M78 200 V145 H92 V135 H100 V145 H120 V200 Z" opacity=".75" />
    </svg>
  ),
  // City gate (Berlin)
  de: ({ className }) => (
    <svg viewBox="0 0 200 140" className={className} aria-hidden>
      <rect x="70" y="0" width="60" height="14" rx="2" />
      <path d="M85 0 Q100 -14 115 0 Z" />
      <rect x="10" y="14" width="180" height="18" />
      <rect x="10" y="32" width="180" height="8" opacity=".8" />
      {[18, 46, 74, 106, 134, 162].map((x) => (
        <rect key={x} x={x} y="40" width="14" height="100" />
      ))}
      <rect x="0" y="134" width="200" height="6" />
    </svg>
  ),
  // Lattice tower (Paris)
  fr: ({ className }) => (
    <svg viewBox="0 0 120 200" className={className} aria-hidden>
      <path d="M58 0 H62 L64 20 H56 Z" />
      <path d="M55 20 H65 L72 80 H48 Z" />
      <rect x="42" y="80" width="36" height="7" />
      <path d="M46 87 H74 L96 160 H24 Z" />
      <path d="M44 160 Q60 128 76 160 Z" fill="var(--hero-sky, #fff)" />
      <rect x="18" y="160" width="84" height="7" />
      <path d="M22 167 H44 L36 200 H6 Z M76 167 H98 L114 200 H84 Z" />
    </svg>
  ),
  // Spired basilica (Barcelona)
  es: ({ className }) => (
    <svg viewBox="0 0 180 200" className={className} aria-hidden>
      {[
        [20, 70],
        [45, 30],
        [70, 10],
        [95, 0],
        [120, 10],
        [145, 30],
      ].map(([x, top]) => (
        <path key={x} d={`M${x} 200 V${top + 40} Q${x + 8} ${top} ${x + 16} ${top + 40} V200 Z`} />
      ))}
      <rect x="10" y="140" width="160" height="60" />
      <path d="M70 200 V165 Q90 145 110 165 V200 Z" fill="var(--hero-sky, #fff)" opacity=".6" />
    </svg>
  ),
  // Amphitheatre (Rome)
  it: ({ className }) => (
    <svg viewBox="0 0 220 120" className={className} aria-hidden>
      <path d="M0 120 V40 Q110 -10 220 30 V120 Z" />
      {[0, 1, 2].map((row) =>
        Array.from({ length: 9 }).map((_, i) => (
          <path key={`${row}-${i}`} d={`M${18 + i * 22} ${110 - row * 26} v-12 q6 -8 12 0 v12 Z`} fill="var(--hero-sky, #fff)" opacity=".55" />
        )),
      )}
    </svg>
  ),
  // Riverside tower (Lisbon)
  pt: ({ className }) => (
    <svg viewBox="0 0 140 200" className={className} aria-hidden>
      <path d="M50 40 L70 20 L90 40 Z" />
      <rect x="50" y="40" width="40" height="80" />
      <rect x="62" y="56" width="16" height="22" rx="8" fill="var(--hero-sky, #fff)" opacity=".55" />
      <rect x="30" y="120" width="80" height="70" />
      {[34, 50, 66, 82, 98].map((x) => (
        <rect key={x} x={x} y="112" width="8" height="8" />
      ))}
      <rect x="0" y="190" width="140" height="10" opacity=".7" />
    </svg>
  ),
  // Domed mosque with minarets (Istanbul)
  tr: ({ className }) => (
    <svg viewBox="0 0 220 160" className={className} aria-hidden>
      <path d="M60 160 V90 Q110 30 160 90 V160 Z" />
      <path d="M108 40 h4 v-12 h-4 Z" />
      <path d="M40 160 V110 Q60 85 80 110 V160 Z M140 160 V110 Q160 85 180 110 V160 Z" opacity=".85" />
      {[20, 196].map((x) => (
        <path key={x} d={`M${x} 160 V30 L${x + 2} 10 L${x + 4} 30 V160 Z`} />
      ))}
      <rect x="0" y="152" width="220" height="8" />
    </svg>
  ),
  // Onion domes (Moscow)
  ru: ({ className }) => (
    <svg viewBox="0 0 200 180" className={className} aria-hidden>
      {[
        [30, 70, 18],
        [100, 20, 26],
        [165, 60, 18],
        [65, 50, 15],
        [135, 45, 15],
      ].map(([x, y, r]) => (
        <g key={`${x}-${y}`}>
          <path d={`M${x} ${y - r * 1.6} Q${x + r * 1.3} ${y - r * 0.3} ${x + r} ${y + r * 0.6} H${x - r} Q${x - r * 1.3} ${y - r * 0.3} ${x} ${y - r * 1.6} Z`} />
          <rect x={x - r * 0.8} y={y + r * 0.6} width={r * 1.6} height={180 - y} />
        </g>
      ))}
    </svg>
  ),
  // Round temple (Beijing)
  zh: ({ className }) => (
    <svg viewBox="0 0 180 180" className={className} aria-hidden>
      <path d="M90 0 L96 14 H84 Z" />
      <path d="M50 30 Q90 10 130 30 Z" />
      <rect x="62" y="30" width="56" height="18" />
      <path d="M36 60 Q90 36 144 60 Z" />
      <rect x="50" y="60" width="80" height="20" />
      <path d="M24 92 Q90 64 156 92 Z" />
      <rect x="38" y="92" width="104" height="28" />
      <rect x="20" y="120" width="140" height="10" />
      <rect x="10" y="130" width="160" height="10" opacity=".8" />
      <rect x="0" y="140" width="180" height="40" opacity=".6" />
    </svg>
  ),
  // Snow-capped mountain and gate (Japan)
  ja: ({ className }) => (
    <svg viewBox="0 0 220 160" className={className} aria-hidden>
      <path d="M0 160 L95 30 Q110 18 125 30 L220 160 Z" opacity=".75" />
      <path d="M95 30 Q110 18 125 30 L138 48 L126 42 L118 50 L110 42 L100 52 L92 44 L82 48 Z" fill="var(--hero-sky, #fff)" />
      <rect x="20" y="78" width="80" height="8" />
      <rect x="26" y="92" width="68" height="6" />
      <rect x="34" y="86" width="8" height="74" />
      <rect x="78" y="86" width="8" height="74" />
    </svg>
  ),
  // Palace pavilion (Seoul)
  ko: ({ className }) => (
    <svg viewBox="0 0 220 150" className={className} aria-hidden>
      <path d="M20 40 Q110 10 200 40 L180 52 H40 Z" />
      <rect x="50" y="52" width="120" height="14" />
      <path d="M8 84 Q110 56 212 84 L192 96 H28 Z" />
      {[40, 70, 100, 130, 160].map((x) => (
        <rect key={x} x={x} y="96" width="8" height="46" />
      ))}
      <rect x="20" y="142" width="180" height="8" />
    </svg>
  ),
  // Pyramids and palm (Egypt / Arabic)
  ar: ({ className }) => (
    <svg viewBox="0 0 220 140" className={className} aria-hidden>
      <path d="M30 140 L95 40 L160 140 Z" />
      <path d="M95 40 L160 140 H120 Z" opacity=".75" />
      <path d="M130 140 L170 80 L210 140 Z" opacity=".85" />
      <path d="M18 140 C20 110 22 95 26 80" stroke="currentColor" strokeWidth="4" fill="none" />
      <path d="M26 80 q-16 -4 -24 6 M26 80 q16 -6 24 4 M26 80 q-8 -14 -20 -14 M26 80 q8 -14 22 -12" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  ),
};

const FLAGS: Record<string, React.ReactElement> = {
  en: (
    <svg viewBox="0 0 60 30">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="2.5" />
      <path d="M30 0 V30 M0 15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0 V30 M0 15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  ),
  de: (
    <svg viewBox="0 0 5 3"><rect width="5" height="1" fill="#000" /><rect y="1" width="5" height="1" fill="#DD0000" /><rect y="2" width="5" height="1" fill="#FFCE00" /></svg>
  ),
  fr: (
    <svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#0055A4" /><rect x="1" width="1" height="2" fill="#fff" /><rect x="2" width="1" height="2" fill="#EF4135" /></svg>
  ),
  es: (
    <svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#AA151B" /><rect y=".5" width="3" height="1" fill="#F1BF00" /></svg>
  ),
  it: (
    <svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#009246" /><rect x="1" width="1" height="2" fill="#fff" /><rect x="2" width="1" height="2" fill="#CE2B37" /></svg>
  ),
  pt: (
    <svg viewBox="0 0 5 3"><rect width="5" height="3" fill="#FF0000" /><rect width="2" height="3" fill="#006600" /><circle cx="2" cy="1.5" r=".6" fill="#FFCC00" /></svg>
  ),
  tr: (
    <svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#E30A17" /><circle cx="11" cy="10" r="5" fill="#fff" /><circle cx="12.3" cy="10" r="4" fill="#E30A17" /><path d="M17 10 l4 -1.3 -2.5 3.4 0 -4.2 2.5 3.4 Z" fill="#fff" /></svg>
  ),
  ru: (
    <svg viewBox="0 0 3 2"><rect width="3" height=".67" fill="#fff" /><rect y=".67" width="3" height=".67" fill="#0039A6" /><rect y="1.33" width="3" height=".67" fill="#D52B1E" /></svg>
  ),
  zh: (
    <svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#DE2910" /><path d="M5 3 l1.2 3.6 -3 -2.2 h3.7 l-3 2.2 Z" fill="#FFDE00" /></svg>
  ),
  ja: (
    <svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#fff" /><circle cx="1.5" cy="1" r=".6" fill="#BC002D" /></svg>
  ),
  ko: (
    <svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#fff" /><path d="M1.5 .6 a.4 .4 0 0 1 0 .8 a.2 .2 0 0 1 0 -.4 a.2 .2 0 0 0 0 -.4 Z" fill="#CD2E3A" /><path d="M1.5 1.4 a.4 .4 0 0 1 0 -.8 a.2 .2 0 0 1 0 .4 a.2 .2 0 0 0 0 .4 Z" fill="#0047A0" /></svg>
  ),
};

export function Landmark({ language, className }: { language: string; className?: string }) {
  const L = LANDMARKS[language] ?? LANDMARKS.en;
  return <L className={className} />;
}

export function Flag({ language, className }: { language: string; className?: string }) {
  const f = FLAGS[language];
  if (!f) return null;
  return <span className={`inline-block overflow-hidden rounded-sm shadow [&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className ?? ""}`}>{f}</span>;
}
