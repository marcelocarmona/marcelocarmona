import { ImageResponse } from 'next/og'

export const sfCrashMapSocialImageAlt =
  'SF Crash Map, a DataSF injury crash map for San Francisco neighborhoods.'

export const sfCrashMapSocialImageSize = {
  width: 1200,
  height: 630,
}

export const sfCrashMapSocialImageContentType = 'image/png'

export function renderSfCrashMapSocialImage() {
  return new ImageResponse(
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#080808',
        color: '#ffffff',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 78% 32%, rgba(34, 211, 238, 0.22), transparent 28%), radial-gradient(circle at 86% 72%, rgba(244, 63, 94, 0.2), transparent 24%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: -80,
          width: 690,
          height: 820,
          transform: 'rotate(-8deg)',
          borderRadius: 40,
          background: '#181818',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 56,
          right: 64,
          display: 'flex',
          width: 520,
          height: 520,
          borderRadius: 28,
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {Array.from({ length: 14 }).map((_, index) => (
          <div
            key={`street-x-${index}`}
            style={{
              position: 'absolute',
              left: 32 + index * 35,
              top: 22,
              width: 2,
              height: 476,
              background: 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={`street-y-${index}`}
            style={{
              position: 'absolute',
              left: 24,
              top: 42 + index * 38,
              width: 470,
              height: 2,
              background: 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
        {Array.from({ length: 54 }).map((_, index) => {
          const x = 46 + ((index * 73) % 430)
          const y = 44 + ((index * 47) % 420)
          const severe = index % 7 === 0 || index % 11 === 0

          return (
            <div
              key={`crash-${index}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: severe ? 15 : 11,
                height: severe ? 15 : 11,
                borderRadius: 999,
                background: severe ? '#f43f5e' : '#22d3ee',
                border: '2px solid rgba(0,0,0,0.74)',
                boxShadow: severe
                  ? '0 0 18px rgba(244,63,94,0.44)'
                  : '0 0 14px rgba(34,211,238,0.34)',
              }}
            />
          )
        })}
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 680,
          height: '100%',
          padding: '64px 0 58px 72px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              color: '#fb7185',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 5,
              textTransform: 'uppercase',
            }}
          >
            DataSF crash records
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              maxWidth: 660,
              fontFamily: 'Georgia, Times New Roman, serif',
              fontSize: 90,
              fontWeight: 900,
              letterSpacing: -4,
              lineHeight: 0.9,
            }}
          >
            SF Crash Map
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              maxWidth: 600,
              color: '#d4d4d4',
              fontSize: 32,
              lineHeight: 1.25,
            }}
          >
            Explore injury crashes by San Francisco neighborhood.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          {['Severe/Fatal', 'Walk/Bike', 'Neighborhoods'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.08)',
                padding: '12px 16px',
                color: '#e5e5e5',
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>,
    sfCrashMapSocialImageSize
  )
}
