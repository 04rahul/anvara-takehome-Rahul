import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 8,
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 6,
            background: 'rgba(15, 23, 42, 0.20)',
            border: '1px solid rgba(255,255,255,0.40)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}

