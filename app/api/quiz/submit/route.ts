import { NextRequest, NextResponse } from 'next/server';
import { redis } from '../../../../lib/redis';

export async function POST(request: NextRequest) {
  if (!redis) {
    return NextResponse.json(
      { error: 'Redis is not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userFid || !body.personalityType || body.score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add timestamp if not provided
    if (!body.timestamp) {
      body.timestamp = Date.now();
    }

    // Store in Redis
    // 1. Store individual result
    await redis.hset(`quiz:results:${body.userFid}`, body);
    
    // 2. Add to sorted set for leaderboard (sort by timestamp, newest first)
    await redis.zadd('quiz:leaderboard', {
      score: -body.timestamp, // Negative timestamp so newest is first
      member: JSON.stringify(body)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing quiz result:', error);
    return NextResponse.json(
      { error: 'Failed to store quiz result' },
      { status: 500 }
    );
  }
} 