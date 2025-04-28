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
│   └── og-utils.ts         # OpenGraph image utilities
└── public/                 # Static assets
    └── images/             # Images including app icon
```

## Key Components

### 1. Main Application (`app/page.tsx`)

The main application component manages:
- User authentication via Farcaster
- View management (Quiz, Results, Leaderboard)
- Frame installation in Farcaster
- Overall app state

It uses three main views:
- Quiz view for taking the personality assessment
- Results view for displaying and sharing personality results
- Leaderboard view for showing community results

### 2. Quiz Component (`components/Quiz.tsx`)

- Presents a series of questions to determine the user's Web3 personality type
- Calculates the final personality result based on answers
- Submits results to the backend API
- Triggers the view change to results when completed

### 3. ShareButton Component (`components/ShareButton.tsx`)

- Allows users to share their quiz results on Farcaster
- Generates personalized share text based on personality type
- Creates a dynamic image URL that shows the user's Farcaster FID
- Uses the Farcaster Frame SDK to launch the composer

```jsx
// Basic sharing flow
const handleShare = async () => {
  // Create the share text with personality type
  let text = 'Check out my profile on MiniApp! 🎉';
  
  if (quizResult) {
    const personalityTitle = personalityTypes[quizResult.personalityType];
    text = `I took the Web3 Personality Quiz and I'm "${personalityTitle}"! Take it yourself and see what you get. 🧠`;
  }
  
  // Create image URL with just the FID
  const imageUrl = `https://my-mini-batches-social.vercel.app/api/dynamic-share-image/${userFid}`;
  
  // Launch Farcaster composer
  await sdk.actions.composeCast({
    text,
    embeds: [imageUrl],
  });
}
```

### 4. Leaderboard Component (`components/Leaderboard.tsx`)

- Fetches and displays quiz results from other users
- Shows the distribution of personality types
- Highlights the current user's result

## API Routes

### 1. Dynamic Share Image (`app/api/dynamic-share-image/[id]/route.tsx`)

Generates a dynamic OpenGraph image for Farcaster sharing:
- Gets the user's FID from the URL path
- Loads the app logo image
- Creates a visually appealing image with the Farcaster FID
- Returns an optimized image for social sharing

The image generation uses Next.js's ImageResponse:

```typescript
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Extract the FID from the params
  let { id } = params;
  
  // Split the ID if it contains a personality type (for backward compatibility)
  if (id.includes('/')) {
    const parts = id.split('/');
    id = parts[0];
  }
  
  // Generate and return a dynamic image with the FID
  return new ImageResponse(
    // JSX for the image content
    <div>
      <img src={logoImage} />
      <div>Farcaster #{id}</div>
    </div>,
    // Image configuration
    {
      width: 600,
      height: 400,
      fonts: [/* Font configuration */]
    }
  );
}
```

### 2. Quiz Submission (`app/api/quiz/submit/route.ts`)

Stores quiz results in Redis:
- Validates the incoming request
- Stores the user's personality type and score
- Updates the leaderboard counts

### 3. Notification API (`app/api/notify/route.ts`)

Handles sending notifications to users through Farcaster:
- Validates notification requests
- Sends personalized notifications to specific FIDs

### 4. Webhook Handler (`app/api/webhook/route.ts`)

Processes incoming webhooks from Farcaster:
- Verifies FID ownership
- Handles subscription events
- Manages onboarding flows

## Redis Data Structure

The application uses Redis to store:

1. **Quiz Results**:
   - Key: `quiz:result:${fid}`
   - Value: JSON object with personality type and score

2. **Personality Type Counts** (for leaderboard):
   - Key: `personality:count:${type}`
   - Value: Count of users with that personality type

3. **User Notification Preferences**:
   - Key: `user:${fid}:notifications`
   - Value: JSON object with notification settings

## Authentication Flow

1. User connects with Farcaster via Coinbase OnchainKit
2. The app receives the user's FID and authentication status
3. Quiz results are associated with the authenticated FID
4. Sharing and notifications are tied to the authenticated user

## Social Sharing Flow

1. User completes the quiz and gets their personality type
2. They click the share button in the results view
3. The ShareButton component generates a personalized message with their personality type
4. A dynamic image URL is created with their Farcaster FID
5. The Farcaster composer is launched with the text and image embed
6. User reviews and posts the content to their Farcaster feed

## Additional Features

- **Frame Installation**: Users can save the app as a Frame in Farcaster
- **Result Persistence**: Quiz results are stored and can be retrieved later
- **Notifications**: The app can send notifications to users via Farcaster

## Implementation Notes

- The app uses Tailwind CSS for styling
- Typescript is used throughout for type safety
- The UI follows a mobile-first design approach
- Font styling uses PressStart2P for a retro gaming aesthetic
- The Redis implementation uses a connection pool for efficiency 