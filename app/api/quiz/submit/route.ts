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
    
    console.log('Received quiz submission:', body);
    
    // Validate only essential fields
    if (!body.personalityType || body.score === undefined) {
      console.log('Missing required fields in submission');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Set default userFid if not provided
    if (!body.userFid) {
      body.userFid = 203090; // Default FID
      console.log('Using default userFid:', body.userFid);
    }

    // Add timestamp if not provided
    if (!body.timestamp) {
      body.timestamp = Date.now();
      console.log('Added timestamp:', body.timestamp);
    }

    // Ensure all properties are strings for Redis hash storage
    const stringifiedBody = Object.entries(body).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? value : String(value);
      return acc;
    }, {} as Record<string, string>);

    // Store in Redis
    console.log('Storing in Redis hash:', `quiz:results:${body.userFid}`);
    // 1. Store individual result
    await redis.hset(`quiz:results:${body.userFid}`, stringifiedBody);
    
    // Prepare JSON string for sorted set
    const jsonString = JSON.stringify(body);
    console.log('Storing in Redis sorted set with score:', -body.timestamp);
    
    // 2. Add to sorted set for leaderboard (sort by timestamp, newest first)
    await redis.zadd('quiz:leaderboard', {
      score: -body.timestamp, // Negative timestamp so newest is first
      member: jsonString
    });

    console.log('Successfully stored quiz result');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing quiz result:', error);
    return NextResponse.json(
      { error: 'Failed to store quiz result' },
      { status: 500 }
    );
  }
} 