export function ToyotaEmblem({ size = 40, white = false }: { size?: number; white?: boolean }) {
  const c = white ? '#fff' : '#EB0A1E'
  const s = size
  return (
    <svg width={s} height={s * 0.67} viewBox="0 0 60 40" fill="none">
      <ellipse cx="30" cy="20" rx="28" ry="17" stroke={c} strokeWidth="2.8" />
      <ellipse cx="30" cy="20" rx="12" ry="17" stroke={c} strokeWidth="2.8" />
      <ellipse cx="30" cy="20" rx="28" ry="8"  stroke={c} strokeWidth="2.8" />
    </svg>
  )
}

export function ChevronDown() {
  return (
    <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 6L8 10L12 6" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NilavilakkuLamp({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 32 44" fill="none">
      {/* flame */}
      <ellipse cx="16" cy="6" rx="3.5" ry="5" fill="#FFB300" className="flame" opacity="0.95" />
      <ellipse cx="16" cy="7" rx="2" ry="3.5" fill="#FF6D00" className="flame" opacity="0.8" />
      {/* wick */}
      <rect x="15" y="10" width="2" height="4" rx="1" fill="#795548" />
      {/* bowl */}
      <path d="M8 18 Q8 14 16 13 Q24 14 24 18 L22 26 Q16 28 10 26 Z" fill="#FFD54F" />
      <path d="M8 18 Q8 14 16 13 Q24 14 24 18" stroke="#F9A825" strokeWidth="1.2" />
      {/* stem */}
      <rect x="14" y="26" width="4" height="8" rx="2" fill="#FFB300" />
      {/* base */}
      <ellipse cx="16" cy="36" rx="9" ry="3" fill="#FFD54F" />
      <ellipse cx="16" cy="38" rx="7" ry="2" fill="#F9A825" />
    </svg>
  )
}

export function Petal({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 10 16" fill="none">
      <ellipse cx="5" cy="8" rx="4.5" ry="7.5" fill={color} opacity="0.85" />
    </svg>
  )
}

export function Sparkle({ size = 14, color = '#FFD700' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" fill={color} />
    </svg>
  )
}

const FLOWER_CONFIGS = [
  { flower: '🌼', size: 36, left: 8,  delay: 0.1, dur: 4.2 },
  { flower: '🌸', size: 30, left: 18, delay: 0.5, dur: 3.8 },
  { flower: '🌸', size: 42, left: 28, delay: 0.2, dur: 4.5 },
  { flower: '🌼', size: 34, left: 38, delay: 0.8, dur: 3.9 },
  { flower: '🌼', size: 40, left: 48, delay: 0.3, dur: 4.6 },
  { flower: '🌸', size: 28, left: 58, delay: 0.9, dur: 3.7 },
  { flower: '🌼', size: 45, left: 68, delay: 0.1, dur: 4.8 },
  { flower: '🌼', size: 35, left: 78, delay: 0.6, dur: 4.1 },
  { flower: '🌸', size: 32, left: 88, delay: 0.3, dur: 4.3 },
  { flower: '🌸', size: 40, left: 95, delay: 0.7, dur: 3.9 },
]

export function PetalRain() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {FLOWER_CONFIGS.map((f, i) => (
        <div
          key={i}
          className="petal drop-shadow-md"
          style={{ 
            left: `${f.left}%`, 
            top: '-32px', 
            animationDelay: `${f.delay}s`, 
            animationDuration: `${f.dur}s`,
            fontSize: `${f.size}px`
          }}
        >
          {f.flower}
        </div>
      ))}
    </div>
  )
}

export function LotusLoader({ size = 120 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center animate-[spin_15s_linear_infinite]" style={{ width: size, height: size }}>
      {/* Outer Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <div
          key={`outer-${deg}`}
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: size * 0.45,
            height: size * 0.45,
            background: i % 2 === 0 ? 'linear-gradient(135deg, rgba(235,10,30,0.85) 0%, rgba(179,0,16,0.95) 100%)' : 'linear-gradient(135deg, rgba(255,215,0,0.85) 0%, rgba(255,160,0,0.95) 100%)',
            borderRadius: '50% 0 50% 0',
            transformOrigin: '0 0',
            animation: `bloom-petal 2s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.15}s`,
            boxShadow: '0 0 20px rgba(235,10,30,0.4)',
            ['--deg' as any]: `${deg}deg`,
          }}
        />
      ))}
      {/* Inner Petals */}
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg, i) => (
        <div
          key={`inner-${deg}`}
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: size * 0.3,
            height: size * 0.3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,215,0,0.95) 100%)',
            borderRadius: '50% 0 50% 0',
            transformOrigin: '0 0',
            animation: `bloom-petal-inner 2s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.15}s`,
            boxShadow: '0 0 15px rgba(255,255,255,0.5)',
            ['--deg' as any]: `${deg}deg`,
          }}
        />
      ))}
      <div 
        className="absolute rounded-full z-10"
        style={{
          width: size * 0.22,
          height: size * 0.22,
          background: '#FFD700',
          boxShadow: '0 0 25px #FFD700, inset 0 0 15px #EB0A1E',
          animation: 'pulse-glow 2s ease-in-out infinite alternate'
        }}
      />
    </div>
  )
}
