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
    
    console.log('Fetching leaderboard data...');
    
    // Get leaderboard entries from Redis sorted set
    const leaderboardData = await redis.zrange('quiz:leaderboard', 0, limit - 1);
    
    console.log('Leaderboard raw data:', leaderboardData);
    
    if (!leaderboardData || !Array.isArray(leaderboardData)) {
      console.log('No leaderboard data found or invalid format');
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
    
    console.log(`Processed ${entries.length} leaderboard entries`);
    
    // If we still don't have entries, try fetching all keys pattern quiz:results:*
    if (entries.length === 0) {
      console.log('Trying alternative fetch method with SCAN...');
      
      // Get all result keys
      const resultKeys = await redis.keys('quiz:results:*');
      console.log('Result keys:', resultKeys);
      
      if (resultKeys && resultKeys.length > 0) {
        const allResults = [];
        
        for (const key of resultKeys) {
          try {
            const userData = await redis.hgetall(key);
            if (userData && Object.keys(userData).length > 0) {
              allResults.push(userData);
            }
          } catch (err) {
            console.error(`Error fetching data for key ${key}:`, err);
          }
        }
        
        console.log(`Alternative method found ${allResults.length} results`);
        return NextResponse.json(allResults);
      }
    }
    
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
} 