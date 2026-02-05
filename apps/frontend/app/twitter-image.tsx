import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function TwitterImage() {
  // Keep Twitter image consistent with Open Graph image for crisp previews.
  const bg = '#0f172a';
  const primary = '#6366f1';
  const secondary = '#10b981';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -200,
            background:
              'radial-gradient(640px 320px at 25% 10%, rgba(99,102,241,0.55), transparent 60%), radial-gradient(520px 260px at 95% 35%, rgba(16,185,129,0.45), transparent 58%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            width: 980,
            padding: '64px 70px',
            borderRadius: 32,
            border: '1px solid rgba(248,250,252,0.14)',
            backgroundColor: 'rgba(15,23,42,0.55)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              }}
            />
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: -0.5,
                color: '#f8fafc',
              }}
            >
              Anvara
            </div>
          </div>

          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: -1.5,
              color: '#f8fafc',
              lineHeight: 1.05,
            }}
          >
            Sponsorship Marketplace
          </div>

          <div
            style={{
              fontSize: 26,
              color: 'rgba(148,163,184,1)',
              lineHeight: 1.35,
              maxWidth: 820,
            }}
          >
            Browse inventory, compare pricing, and book placements — built for sponsors and
            publishers.
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {[
              { label: 'Transparent pricing', color: primary },
              { label: 'Fast booking', color: secondary },
            ].map((pill) => (
              <div
                key={pill.label}
                style={{
                  padding: '10px 14px',
                  borderRadius: 999,
                  border: '1px solid rgba(248,250,252,0.14)',
                  backgroundColor: 'rgba(15,23,42,0.35)',
                  color: '#e2e8f0',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: pill.color,
                  }}
                />
                {pill.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

