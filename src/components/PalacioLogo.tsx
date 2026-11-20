interface PalacioLogoProps {
  className?: string;
  size?: number;
}

export default function PalacioLogo({ className = '', size = 36 }: PalacioLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${className}`}
      aria-label="Palacio de Oro Emblem"
    >
      <defs>
        {/* Metallic Champagne Bronze Gradient */}
        <linearGradient id="palacioBronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F4E4BC" />
          <stop offset="25%" stopColor="#D4AF37" />
          <stop offset="60%" stopColor="#C5A880" />
          <stop offset="85%" stopColor="#997A15" />
          <stop offset="100%" stopColor="#E5C158" />
        </linearGradient>

        <linearGradient id="palacioDarkGoldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7A5E0B" />
          <stop offset="50%" stopColor="#C5A880" />
          <stop offset="100%" stopColor="#F6F4EF" />
        </linearGradient>

        <radialGradient id="palacioInnerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C5A880" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#080808" stopOpacity="0.8" />
        </radialGradient>

        <filter id="goldDropShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Outer Fine Crest Ring */}
      <circle
        cx="60"
        cy="60"
        r="54"
        stroke="url(#palacioBronzeGrad)"
        strokeWidth="1.2"
        strokeDasharray="2 3"
        opacity="0.8"
      />

      {/* Main Solid Luxury Octagonal/Crest Ring */}
      <circle
        cx="60"
        cy="60"
        r="49"
        fill="url(#palacioInnerGlow)"
        stroke="url(#palacioBronzeGrad)"
        strokeWidth="2"
        filter="url(#goldDropShadow)"
      />

      {/* Inner Concentric Hairline Ring */}
      <circle
        cx="60"
        cy="60"
        r="43"
        stroke="url(#palacioBronzeGrad)"
        strokeWidth="0.8"
        opacity="0.6"
      />

      {/* Heraldic Crown / Crest Top Accents */}
      <path
        d="M50 20 L60 14 L70 20 L66 23 L60 19 L54 23 Z"
        fill="url(#palacioBronzeGrad)"
      />
      <circle cx="60" cy="11.5" r="1.5" fill="url(#palacioBronzeGrad)" />
      <circle cx="50" cy="18" r="1.2" fill="url(#palacioBronzeGrad)" />
      <circle cx="70" cy="18" r="1.2" fill="url(#palacioBronzeGrad)" />

      {/* Flanking Laurel Leaf Accents */}
      {/* Left Leaves */}
      <path
        d="M21 54 C21 44 26 34 33 28 C30 35 29 46 31 56 Z"
        fill="url(#palacioBronzeGrad)"
        opacity="0.85"
      />
      <path
        d="M18 64 C19 74 24 84 32 90 C29 83 27 73 28 63 Z"
        fill="url(#palacioBronzeGrad)"
        opacity="0.85"
      />
      {/* Right Leaves */}
      <path
        d="M99 54 C99 44 94 34 87 28 C90 35 91 46 89 56 Z"
        fill="url(#palacioBronzeGrad)"
        opacity="0.85"
      />
      <path
        d="M102 64 C101 74 96 84 88 90 C91 83 93 73 92 63 Z"
        fill="url(#palacioBronzeGrad)"
        opacity="0.85"
      />

      {/* Bottom Flourish Ribbon / Diamond Accent */}
      <polygon
        points="60,103 64,107 60,111 56,107"
        fill="url(#palacioBronzeGrad)"
      />
      <path
        d="M48 106 C53 105 57 106 60 107 C63 106 67 105 72 106"
        stroke="url(#palacioBronzeGrad)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Royal Serif Monogram "P" */}
      {/* Stem with classical serifs */}
      <path
        d="M43 37 L57 37 M50 37 L50 83 M43 83 L59 83"
        stroke="url(#palacioBronzeGrad)"
        strokeWidth="4"
        strokeLinecap="square"
      />
      
      {/* Subtle stem inner highlight line */}
      <path
        d="M49 39 L49 81"
        stroke="#FFF"
        strokeWidth="0.75"
        opacity="0.6"
      />

      {/* The Curved Loop of the P with classical European calligraphic modulation */}
      <path
        d="M50 37 C70 37 77 44 77 53 C77 62 70 69 50 69"
        stroke="url(#palacioBronzeGrad)"
        strokeWidth="4"
        strokeLinecap="square"
        fill="none"
      />

      {/* Inner loop shading */}
      <path
        d="M52 40 C68 40 73 45 73 53 C73 61 68 66 52 66"
        stroke="#FFF"
        strokeWidth="0.75"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      {/* Decorative center diamond inside the loop */}
      <polygon
        points="61,50 64,53 61,56 58,53"
        fill="url(#palacioBronzeGrad)"
        opacity="0.9"
      />
    </svg>
  );
}
