import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest, { params }: { params: { fid: string } }) {
  try {
    const fid = params.fid

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom, #4b0082, #8a2be2)',
            color: 'white',
            width: '100%',
            height: '100%',
            padding: '40px',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: '20px' }}>
            My Farcaster Profile
          </div>
          <div style={{ fontSize: 40, marginBottom: '40px' }}>
            Farcaster ID: {fid}
          </div>
          <div style={{ fontSize: 24 }}>
            View my profile on MiniApp
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e) {
    console.error(e)
    return new Response(`Failed to generate image`, {
      status: 500
    })
  }
} 