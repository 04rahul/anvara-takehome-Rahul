import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: 44,
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -40,
            background:
              'radial-gradient(120px 120px at 30% 20%, rgba(255,255,255,0.35), transparent 60%), radial-gradient(140px 140px at 80% 70%, rgba(15,23,42,0.25), transparent 62%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            width: 96,
            height: 96,
            borderRadius: 28,
            background: 'rgba(15, 23, 42, 0.18)',
            border: '2px solid rgba(255,255,255,0.35)',
            boxShadow: '0 14px 28px rgba(0,0,0,0.22)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}

