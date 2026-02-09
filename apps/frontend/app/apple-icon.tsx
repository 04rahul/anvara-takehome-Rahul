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
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          fontSize: 100,
          fontWeight: 700,
          color: 'white',
          borderRadius: 44,
        }}
      >
        A
      </div>
    ),
    {
      ...size,
    }
  );
}

