# Web3 Personality Quiz: Architecture Documentation

## Project Overview

This is a Next.js application that offers a Web3 personality quiz integrated with Farcaster. Users can take a quiz to determine their Web3 personality type, view their results, share them on Farcaster, and see a leaderboard of other users' results.

## Architecture

### Tech Stack

- **Frontend**: Next.js 14 with React, TypeScript, and Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Storage**: Redis (for storing quiz results and leaderboard data)
- **Authentication**: Farcaster authentication via Coinbase OnchainKit
- **Sharing**: Farcaster Frame SDK for social sharing
- **Image Generation**: Next.js OG Image Generation API

### Component Structure

```
Project Root
├── app/                    # Next.js app directory structure
│   ├── api/                # API routes
│   │   ├── dynamic-share-image/[id]/ # Dynamic image generation for sharing
│   │   ├── notify/         # Notification endpoint
│   │   ├── quiz/submit/    # Endpoint to save quiz results
│   │   ├── quiz/leaderboard/ # Endpoint to fetch leaderboard data
│   │   └── webhook/        # Farcaster webhook endpoint
│   ├── page.tsx            # Main application page
│   └── providers.tsx       # React context providers
├── components/             # React components
│   ├── DemoComponents.tsx  # UI components (buttons, icons)
│   ├── Leaderboard.tsx     # Leaderboard view
│   ├── Quiz.tsx            # Quiz component with questions
│   └── ShareButton.tsx     # Farcaster sharing functionality
├── lib/                    # Utility functions
│   ├── notification.ts     # Notification handling
│   ├── notification-client.ts # Client for notifications
│   ├── redis.ts            # Redis client configuration
│   └── og-utils.ts         # OpenGraph image utilities
└── public/                 # Static assets
    └── images/             # Images including app icon
```

## Key Components with Code Comments

### 1. Main Application (`app/page.tsx`)

The main application component manages:
- User authentication via Farcaster
- View management (Quiz, Results, Leaderboard)
- Frame installation in Farcaster
- Overall app state

```tsx
// Navigation between views
const [activeView, setActiveView] = useState<'quiz' | 'results' | 'leaderboard'>('quiz');

// Store quiz results when user completes the quiz
const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

// Track the submission status for better UX
const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

// Callback when quiz is completed
const handleQuizComplete = useCallback(async (result: QuizResult) => {
  setQuizResult(result);
  setActiveView('results');
  
  // Store result in Redis via API route
  try {
    setSubmitStatus('submitting'); // Show loading indicator
    const response = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    });
    
    // Handle success/failure
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to submit quiz result:', errorText);
      setSubmitStatus('error');
    } else {
      setSubmitStatus('success');
    }
  } catch (error) {
    console.error('Error submitting quiz result:', error);
    setSubmitStatus('error');
  }
}, []);
```

### 2. ShareButton Component (`components/ShareButton.tsx`)

Allows users to share their quiz results on Farcaster by:
1. Creating personalized text based on personality type
2. Generating an image URL with the user's FID
3. Launching the Farcaster composer

```tsx
// This function handles the sharing logic
const handleShare = async () => {
  try {
    // Show loading state
    setIsSharing(true);
    
    // Use same image URL for all shares - only showing FID
    // We're not including personality type in the URL anymore
    const imageUrl = `https://my-mini-batches-social.vercel.app/api/dynamic-share-image/${userFid}`;
    
    // Default text for sharing
    let text = 'Check out my profile on MiniApp! 🎉';
    
    // If we have quiz results, customize the text content with personality
    if (quizResult) {
      // Map of personality type codes to human-readable names
      const personalityTypes = {
        'builder': 'The Builder',
        'visionary': 'The Visionary',
        'connector': 'The Connector',
        'analyst': 'The Analyst'
      };
      
      // Get the readable personality title
      const personalityTitle = personalityTypes[quizResult.personalityType] || quizResult.personalityType;
      
      // Create a personalized message with the personality type
      text = `I took the Web3 Personality Quiz and I'm "${personalityTitle}"! Take it yourself and see what you get. 🧠`;
    }

    // Launch the Farcaster composer with the text and image
    await sdk.actions.composeCast({
      text,  // The personalized message
      embeds: [imageUrl],  // The image URL that shows the user's FID
    });
  } catch (error) {
    console.error("Error sharing to Farcaster:", error);
  } finally {
    // Reset loading state
    setIsSharing(false);
  }
}
```

### 3. Dynamic Share Image (`app/api/dynamic-share-image/[id]/route.tsx`)

Generates a dynamic OpenGraph image for Farcaster sharing:

```tsx
/**
 * This API route generates a dynamic image for sharing on Farcaster
 * It extracts the FID from the URL path and renders it in a visually appealing way
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Extract the ID from the route parameters
    let { id } = params;
    
    // Check if the ID contains a personality type (format: "123/visionary")
    // This supports backward compatibility with older URL formats
    if (id.includes('/')) {
      const parts = id.split('/');
      id = parts[0]; // The actual ID is the first part
    }
    
    // Get the app URL from environment or use default
    const appUrl = process.env.NEXT_PUBLIC_URL || "https://my-mini-batches-social.vercel.app";

    // Load the app logo for the image
    const logoImage = await loadImage(`${appUrl}/images/icon.png`);

    // Load the font with text we'll render
    const fontData = await loadGoogleFont("Press+Start+2P", "Farcaster FID: " + id);

    // Return the dynamically generated image with the FID
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            backgroundColor: "#8b5cf6", // Purple background
            gap: "20px",
          }}
        >
          {/* Render the logo image */}
          <img
            src={`data:image/png;base64,${Buffer.from(logoImage).toString("base64")}`}
            style={{
              width: "100px",
              marginBottom: "20px",
              borderRadius: "10px",
            }}
          />
          
          {/* Display the Farcaster FID */}
          <div
            style={{
              position: "relative",
              color: "white",
              fontSize: 48,
              fontFamily: "PressStart2P",
              textAlign: "center",
              display: "flex",
            }}
          >
            Farcaster #{id}
          </div>
        </div>
      ),
      {
        width: 600,
        height: 400,
        fonts: [
          {
            name: "PressStart2P",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (e) {
    // Error handling
    console.log(`Failed to generate image`, e);
    return new Response(`Failed to generate image: ${e instanceof Error ? e.message : String(e)}`, {
      status: 500,
    });
  }
}
```

### 4. Quiz Submission API (`app/api/quiz/submit/route.ts`)

Handles storing quiz results in Redis:

```typescript
/**
 * This API route stores quiz results in Redis
 * It saves individual results and updates the leaderboard
 */
export async function POST(request: NextRequest) {
  // Check if Redis is configured
  if (!redis) {
    return NextResponse.json(
      { error: 'Redis is not configured' },
      { status: 500 }
    );
  }

  try {
    // Parse the request body
    const body = await request.json();
    
    console.log('Received quiz submission:', body);
    
    // Validate required fields
    if (!body.personalityType || body.score === undefined) {
      console.log('Missing required fields in submission');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Set default userFid if not provided (for development/testing)
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
    // Redis hashes require string values
    const stringifiedBody = Object.entries(body).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? value : String(value);
      return acc;
    }, {} as Record<string, string>);

    // STORAGE STEP 1: Store individual result in a hash
    // Key format: quiz:results:{fid}
    console.log('Storing in Redis hash:', `quiz:results:${body.userFid}`);
    await redis.hset(`quiz:results:${body.userFid}`, stringifiedBody);
    
    // Prepare JSON string for sorted set
    const jsonString = JSON.stringify(body);
    console.log('Storing in Redis sorted set with score:', -body.timestamp);
    
    // STORAGE STEP 2: Add to sorted set for leaderboard
    // Using negative timestamp so newest results appear first
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
```

### 5. Leaderboard API (`app/api/quiz/leaderboard/route.ts`)

Retrieves leaderboard data from Redis:

```typescript
/**
 * This API route fetches leaderboard data from Redis
 * It has a fallback mechanism in case the primary method fails
 */
export async function GET(request: NextRequest) {
  // Check if Redis is configured
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
    
    // PRIMARY METHOD: Get leaderboard entries from Redis sorted set
    // This uses ZRANGE to get entries from the sorted set in order
    const leaderboardData = await redis.zrange('quiz:leaderboard', 0, limit - 1);
    
    console.log('Leaderboard raw data:', leaderboardData);
    
    if (!leaderboardData || !Array.isArray(leaderboardData)) {
      console.log('No leaderboard data found or invalid format');
      return NextResponse.json([]);
    }
    
    // Parse JSON strings from Redis
    // Each entry in the sorted set is a JSON string
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
    }).filter(Boolean); // Remove any null entries
    
    console.log(`Processed ${entries.length} leaderboard entries`);
    
    // FALLBACK METHOD: If primary method returns no data
    // Try fetching all individual result keys and combine them
    if (entries.length === 0) {
      console.log('Trying alternative fetch method with SCAN...');
      
      // Get all keys matching the pattern quiz:results:*
      const resultKeys = await redis.keys('quiz:results:*');
      console.log('Result keys:', resultKeys);
      
      if (resultKeys && resultKeys.length > 0) {
        const allResults = [];
        
        // For each key, get the hash data
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
    
    // Return the processed entries
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}
```

## Redis Data Structure and Keys

The application uses Redis to store various types of data:

### 1. Individual Quiz Results

- **Key Pattern**: `quiz:results:{fid}`
- **Type**: Hash
- **Fields**:
  - `userFid`: Farcaster ID of the user
  - `personalityType`: The personality type result (e.g., 'visionary')
  - `score`: Numerical score from the quiz
  - `timestamp`: When the quiz was taken
  - Other metadata fields as needed

```
// Example of how quiz results are stored as a Redis hash
redis.hset('quiz:results:12345', {
  userFid: '12345',
  personalityType: 'visionary',
  score: '85',
  timestamp: '1689847562000'
});
```

### 2. Leaderboard Data

- **Key**: `quiz:leaderboard`
- **Type**: Sorted Set
- **Score**: Negative timestamp (for newest-first ordering)
- **Members**: JSON strings of quiz results

```
// Example of how entries are added to the leaderboard sorted set
redis.zadd('quiz:leaderboard', {
  score: -Date.now(),  // Negative timestamp for newest first
  member: JSON.stringify({
    userFid: 12345,
    personalityType: 'visionary',
    score: 85,
    timestamp: Date.now()
  })
});
```

## Data Flow

### Quiz Submission Flow

1. User completes quiz in the Quiz component
2. `handleQuizComplete` callback in `page.tsx` is triggered with the result
3. Result is sent to `/api/quiz/submit` endpoint
4. API route stores the result in Redis in two places:
   - Individual result in a hash: `quiz:results:{fid}`
   - Leaderboard entry in a sorted set: `quiz:leaderboard`
5. UI updates to show success/error message

### Leaderboard Retrieval Flow

1. User navigates to the Leaderboard view
2. Leaderboard component fetches data from `/api/quiz/leaderboard` endpoint
3. API route tries two methods to get the data:
   - Primary: Get entries from the `quiz:leaderboard` sorted set
   - Fallback: If that fails, get all individual results using the `quiz:results:*` pattern
4. Data is returned and displayed in the Leaderboard component

### Sharing Flow

1. User clicks Share button in the Results view
2. ShareButton component generates:
   - Text message with the personality result (e.g., "I'm The Visionary!")
   - Image URL with just the FID: `/api/dynamic-share-image/{fid}`
3. Farcaster composer is launched via the SDK
4. When someone views the shared post:
   - The dynamic-share-image route generates an image showing the FID
   - The text shows the personality type

## Performance Considerations

1. **Redis Caching**: All quiz results are cached in Redis for fast retrieval
2. **Image Generation**: The dynamic image API uses Next.js's optimized image generation
3. **Error Handling**: Multiple fallback mechanisms for data retrieval
4. **Feedback to Users**: Loading states and error messages for better UX 