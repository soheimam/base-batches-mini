import { loadGoogleFont, loadImage } from "@/lib/og-utils";
import { ImageResponse } from "next/og";

//  Thankyou to the builider Garden and Limone for the original code https://github.com/builders-garden/base-minikit-starter
// Force dynamic rendering to ensure fresh image generation on each request
export const dynamic = "force-dynamic";

// Define the dimensions for the generated OpenGraph image
const size = {
  width: 1200,
  height: 630,
};

// Personality types and their descriptions
const personalityTypes = {
  'builder': {
    title: 'The Builder',
    description: 'Practical, hands-on, and loves creating things',
    color: '#4C1D95', // Deep purple background
  },
  'visionary': {
    title: 'The Visionary',
    description: 'Future-oriented, creative, and sees possibilities',
    color: '#5B21B6', // Purple background
  },
  'connector': {
    title: 'The Connector',
    description: 'Social, empathetic, and brings people together',
    color: '#6D28D9', // Lighter purple background
  },
  'analyst': {
    title: 'The Analyst',
    description: 'Logical, detail-oriented, and research-driven',
    color: '#7C3AED', // Violet background
  }
};

/**
 * GET handler for generating dynamic OpenGraph images
 * @param request - The incoming HTTP request
 * @param params - Route parameters containing the ID
 * @returns ImageResponse - A dynamically generated image for OpenGraph
 */
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: {
      id: string;
    };
  }
) {
  try {
    // Extract the ID from the route parameters
    let { id } = params;
    
    // Check if the ID contains a personality type (format: "123/visionary")
    let personalityType: string | null = null;
    
    if (id.includes('/')) {
      const parts = id.split('/');
      id = parts[0]; // The actual ID is the first part
      personalityType = parts[1]; // The personality type is the second part
    } else {
      // If not found in path, try to get from query parameters
      const url = new URL(request.url);
      personalityType = url.searchParams.get('personality');
    }
    
    // Get the application's base URL from environment variables
    const appUrl = process.env.NEXT_PUBLIC_URL || "https://my-mini-batches-social.vercel.app";

    // Load the logo image from the public directory
    const logoImage = await loadImage(`${appUrl}/images/icon.png`);

    // Load font for the text
    const fontData = await loadGoogleFont("Press+Start+2P", "Web3 Personality Quiz");

    // Generate the image content based on whether a personality type is specified
    let imageContent;
    
    if (personalityType && personalityTypes[personalityType as keyof typeof personalityTypes]) {
      const personality = personalityTypes[personalityType as keyof typeof personalityTypes];
      
      imageContent = (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            backgroundColor: personality.color,
            backgroundImage: "linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent)",
            backgroundSize: "100px 100px",
            color: "white",
            padding: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: "20px",
              padding: "40px",
              width: "90%",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <img
              src={`data:image/png;base64,${Buffer.from(logoImage).toString("base64")}`}
              style={{
                width: "120px",
                marginBottom: "30px",
                borderRadius: "15px",
                border: "4px solid white",
              }}
            />
            
            <div
              style={{
                fontSize: 32,
                fontFamily: "PressStart2P",
                marginBottom: "20px",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                color: "white",
              }}
            >
              My Web3 Personality:
            </div>
            
            <div
              style={{
                fontSize: 48,
                fontFamily: "PressStart2P",
                marginBottom: "20px",
                color: "white",
                textShadow: "3px 3px 6px rgba(0,0,0,0.5)",
              }}
            >
              {personality.title}
            </div>
            
            <div
              style={{
                fontSize: 24,
                fontFamily: "PressStart2P",
                textAlign: "center",
                marginBottom: "30px",
                maxWidth: "80%",
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {personality.description}
            </div>
            
            <div
              style={{
                fontSize: 20,
                fontFamily: "PressStart2P",
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                marginTop: "10px",
              }}
            >
              Farcaster #{id}
            </div>
          </div>
        </div>
      );
    } else {
      // Default image if no personality type is provided
      imageContent = (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            backgroundColor: "#7C3AED", // Violet background
            backgroundImage: "linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent)",
            backgroundSize: "100px 100px",
            color: "white",
            padding: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: "20px",
              padding: "40px",
              width: "90%",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <img
              src={`data:image/png;base64,${Buffer.from(logoImage).toString("base64")}`}
              style={{
                width: "120px",
                marginBottom: "30px",
                borderRadius: "15px",
                border: "4px solid white",
              }}
            />
            
            <div
              style={{
                fontSize: 48,
                fontFamily: "PressStart2P",
                marginBottom: "20px",
                color: "white",
                textShadow: "3px 3px 6px rgba(0,0,0,0.5)",
              }}
            >
              Web3 Personality Quiz
            </div>
            
            <div
              style={{
                fontSize: 24,
                fontFamily: "PressStart2P",
                textAlign: "center",
                marginBottom: "30px",
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              Discover your Web3 personality!
            </div>
            
            <div
              style={{
                fontSize: 20,
                fontFamily: "PressStart2P",
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                marginTop: "10px",
              }}
            >
              Farcaster #{id}
            </div>
          </div>
        </div>
      );
    }

    // Generate and return the image response
    return new ImageResponse(
      imageContent,
      {
        ...size,
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
    // Log and handle any errors during image generation
    console.log(`Failed to generate image`, e);
    return new Response(`Failed to generate image: ${e instanceof Error ? e.message : String(e)}`, {
      status: 500,
    });
  }
}