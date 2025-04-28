import { NextRequest, NextResponse } from 'next/server';
import { redis } from '../../../../lib/redis';

export async function GET(request: NextRequest) {
  if (!redis) {
    return NextResponse.json(
      { error: 'Redis is not configured' },
      { status: 500 }
    );
  }

  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    // Get leaderboard entries from Redis sorted set
    const leaderboardData = await redis.zrange('quiz:leaderboard', 0, limit - 1);
    
    if (!leaderboardData || !Array.isArray(leaderboardData)) {
      return NextResponse.json([]);
    }
    
    // Parse JSON strings from Redis
    const entries = leaderboardData.map(entry => {
      try {
        // Make sure entry is a string before parsing
        if (typeof entry === 'string') {
          return JSON.parse(entry);
        }
        return null;
      } catch (error) {
        console.error('Error parsing leaderboard entry:', error);
        return null;
      }
    }).filter(Boolean);
    
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
} 