import { loadGoogleFont, loadImage } from "@/lib/og-utils";
import { ImageResponse } from "next/og";

//  Thankyou to the builider Garden and Limone for the original code https://github.com/builders-garden/base-minikit-starter
// Force dynamic rendering to ensure fresh image generation on each request
export const dynamic = "force-dynamic";

// Define the dimensions for the generated OpenGraph image
const size = {
  width: 600,
  height: 400,
};

// Personality types and their descriptions
const personalityTypes = {
  'builder': {
    title: 'The Builder',
    description: 'Practical, hands-on, and loves creating things',
  },
  'visionary': {
    title: 'The Visionary',
    description: 'Future-oriented, creative, and sees possibilities',
  },
  'connector': {
    title: 'The Connector',
    description: 'Social, empathetic, and brings people together',
  },
  'analyst': {
    title: 'The Analyst',
    description: 'Logical, detail-oriented, and research-driven',
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
    const { id } = params;

    // Get the personality type from query parameters
    const url = new URL(request.url);
    const personalityType = url.searchParams.get('personality');
    
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
            backgroundColor: "#8b5cf6", // Purple background
            color: "white",
            gap: "20px",
            padding: "20px",
          }}
        >
          <img
            src={`data:image/png;base64,${Buffer.from(logoImage).toString("base64")}`}
            style={{
              width: "100px",
              marginBottom: "20px",
              borderRadius: "10px",
            }}
          />
          
          <div
            style={{
              fontSize: 24,
              fontFamily: "PressStart2P",
              marginBottom: "10px",
            }}
          >
            My Web3 Personality:
          </div>
          
          <div
            style={{
              fontSize: 28,
              fontFamily: "PressStart2P",
              marginBottom: "10px",
              color: "#ffffff",
            }}
          >
            {personality.title}
          </div>
          
          <div
            style={{
              fontSize: 16,
              fontFamily: "PressStart2P",
              textAlign: "center",
              marginBottom: "20px",
              maxWidth: "80%",
            }}
          >
            {personality.description}
          </div>
          
          <div
            style={{
              fontSize: 14,
              fontFamily: "PressStart2P",
            }}
          >
            Farcaster #{id}
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
            backgroundColor: "#8b5cf6", // Purple background
            color: "white",
            gap: "20px",
            padding: "20px",
          }}
        >
          <img
            src={`data:image/png;base64,${Buffer.from(logoImage).toString("base64")}`}
            style={{
              width: "100px",
              marginBottom: "20px",
              borderRadius: "10px",
            }}
          />
          
          <div
            style={{
              fontSize: 28,
              fontFamily: "PressStart2P",
              marginBottom: "10px",
            }}
          >
            Web3 Personality Quiz
          </div>
          
          <div
            style={{
              fontSize: 16,
              fontFamily: "PressStart2P",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            Discover your Web3 personality!
          </div>
          
          <div
            style={{
              fontSize: 14,
              fontFamily: "PressStart2P",
            }}
          >
            Farcaster #{id}
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