import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const personalityTypes = {
  'builder': {
    title: 'The Builder',
    description: 'Practical, hands-on, and loves creating things',
    color: 'from-blue-500 to-cyan-400'
  },
  'visionary': {
    title: 'The Visionary',
    description: 'Future-oriented, creative, and sees possibilities',
    color: 'from-purple-500 to-pink-400'
  },
  'connector': {
    title: 'The Connector',
    description: 'Social, empathetic, and brings people together',
    color: 'from-green-500 to-emerald-400'
  },
  'analyst': {
    title: 'The Analyst',
    description: 'Logical, detail-oriented, and research-driven',
    color: 'from-yellow-500 to-amber-400'
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { fid: string; personality: string } }
) {
  try {
    const { fid, personality } = params;
    const personalityInfo = personalityTypes[personality as keyof typeof personalityTypes] || {
      title: 'Web3 Builder',
      description: 'Took the Web3 Personality Quiz!',
      color: 'from-purple-500 to-blue-500'
    };

    // Get gradients based on personality
    let gradientFrom, gradientTo;
    
    switch (personality) {
      case 'builder':
        gradientFrom = '#3b82f6'; // blue-500
        gradientTo = '#22d3ee';   // cyan-400
        break;
      case 'visionary':
        gradientFrom = '#8b5cf6'; // purple-500
        gradientTo = '#f472b6';   // pink-400
        break;
      case 'connector':
        gradientFrom = '#22c55e'; // green-500
        gradientTo = '#10b981';   // emerald-400
        break;
      case 'analyst':
        gradientFrom = '#eab308'; // yellow-500
        gradientTo = '#f59e0b';   // amber-400
        break;
      default:
        gradientFrom = '#8b5cf6'; // purple-500
        gradientTo = '#3b82f6';   // blue-500
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
            color: 'white',
            width: '100%',
            height: '100%',
            padding: '40px',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ 
            fontSize: 28, 
            opacity: 0.9, 
            marginBottom: '20px',
            fontWeight: 'bold'
          }}>
            WEB3 PERSONALITY QUIZ
          </div>
          
          <div style={{ 
            width: 150, 
            height: 150, 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 80,
            fontWeight: 'bold',
            marginBottom: '30px'
          }}>
            {personality.charAt(0).toUpperCase()}
          </div>
          
          <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: '20px' }}>
            {personalityInfo.title}
          </div>
          
          <div style={{ fontSize: 30, marginBottom: '40px', opacity: 0.8 }}>
            {personalityInfo.description}
          </div>
          
          <div style={{ fontSize: 24, opacity: 0.7 }}>
            Farcaster #{fid}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate image`, {
      status: 500
    });
  }
} 