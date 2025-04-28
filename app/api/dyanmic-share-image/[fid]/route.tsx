// app/dynamic-image-example/[id]/route.tsx
import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'      // ← must be an edge function

export async function GET(req: Request) {
  const { pathname } = new URL(req.url)
  const fid = pathname.split('/').pop()  // extract [id]

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111',
          color: 'white',
          width: '100%',
          height: '100%',
          fontSize: 64,
          fontFamily: 'sans-serif',
        }}
      >
        Farcaster ID: {fid}
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
