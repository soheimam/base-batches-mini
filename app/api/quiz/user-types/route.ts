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
    const type = searchParams.get('type'); // personality type to filter by
    const compatible = searchParams.get('compatible'); // find compatible types for this personality
    const userFid = searchParams.get('userFid'); // current user's FID

    console.log('Fetching user types with params:', { type, compatible, userFid });

    // Get all entries from leaderboard
    const limit = 100; // Reasonable limit to avoid overloading
    let entries = [];
    
    // First try fetching from leaderboard sorted set
    const leaderboardData = await redis.zrange('quiz:leaderboard', 0, limit - 1);
    
    if (leaderboardData && Array.isArray(leaderboardData) && leaderboardData.length > 0) {
      // Parse JSON strings from Redis
      entries = leaderboardData
        .filter((entry): entry is string => typeof entry === 'string')
        .map(entry => {
          try {
            return JSON.parse(entry);
          } catch (error) {
            console.error('Error parsing leaderboard entry:', error);
            return null;
          }
        })
        .filter(Boolean);
    }
    
    // If no entries from sorted set, try individual hash keys
    if (entries.length === 0) {
      console.log('No entries from leaderboard, trying individual results...');
      const resultKeys = await redis.keys('quiz:results:*');
      console.log('Result keys:', resultKeys);
      
      if (resultKeys && resultKeys.length > 0) {
        for (const key of resultKeys) {
          try {
            const userData = await redis.hgetall(key);
            if (userData && Object.keys(userData).length > 0) {
              entries.push(userData);
            }
          } catch (err) {
            console.error(`Error fetching data for key ${key}:`, err);
          }
        }
      }
    }
    
    console.log(`Found ${entries.length} total entries`);

    // Define compatibility relationships
    const personalityCompatibility: Record<string, string[]> = {
      'builder': ['connector', 'visionary'],
      'visionary': ['builder', 'analyst'],
      'connector': ['builder', 'analyst'],
      'analyst': ['visionary', 'connector']
    };

    let filteredEntries = entries;

    // If looking for compatible types with a specific personality
    if (compatible && personalityCompatibility[compatible]) {
      const compatibleTypes = personalityCompatibility[compatible];
      filteredEntries = entries.filter(entry => 
        compatibleTypes.includes(entry.personalityType) && 
        (!userFid || entry.userFid.toString() !== userFid)
      );
    } 
    // If filtering by specific personality type
    else if (type) {
      filteredEntries = entries.filter(entry => 
        entry.personalityType === type &&
        (!userFid || entry.userFid.toString() !== userFid)
      );
    }

    // If we have a userFid, always include that user's entry at the beginning
    if (userFid) {
      const userEntry = entries.find(entry => entry.userFid.toString() === userFid);
      if (userEntry) {
        // If user has this entry, make sure it's at the top of the results
        filteredEntries = filteredEntries.filter(entry => entry.userFid.toString() !== userFid);
        filteredEntries.unshift(userEntry);
      }
    }
    
    console.log(`Returning ${filteredEntries.length} filtered entries`);
    return NextResponse.json(filteredEntries);
  } catch (error) {
    console.error('Error fetching user types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user types data' },
      { status: 500 }
    );
  }
} 