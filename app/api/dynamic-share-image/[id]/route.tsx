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
    gradientFrom: '#8b5cf6', // purple-500
    gradientTo: '#c084fc',   // purple-400
  },
  'visionary': {
    title: 'The Visionary',
    description: 'Future-oriented, creative, and sees possibilities',
    gradientFrom: '#8b5cf6', // purple-500
    gradientTo: '#c084fc',   // purple-400
  },
  'connector': {
    title: 'The Connector',
    description: 'Social, empathetic, and brings people together',
    gradientFrom: '#8b5cf6', // purple-500
    gradientTo: '#c084fc',   // purple-400
  },
  'analyst': {
    title: 'The Analyst',
    description: 'Logical, detail-oriented, and research-driven',
    gradientFrom: '#8b5cf6', // purple-500
    gradientTo: '#c084fc',   // purple-400
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
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // Extract the ID from the route parameters
    const { id } = await params;

    // Get the personality type from query parameters
    const url = new URL(request.url);
    const personalityType = url.searchParams.get('personality');
    
    // Get the application's base URL from environment variables
    const appUrl = process.env.NEXT_PUBLIC_URL;

    // Load the logo image from the public directory
    const logoImage = await loadImage(`${appUrl}/images/icon.png`);

    // If we have a personality type, generate a personality quiz share image
    if (personalityType && personalityTypes[personalityType as keyof typeof personalityTypes]) {
      const personality = personalityTypes[personalityType as keyof typeof personalityTypes];
      const titleFontData = await loadGoogleFont("Inter:wght@800", personality.title);
      const textFontData = await loadGoogleFont("Inter", "SwiftUI Fundamentals");
      
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(to bottom right, ${personality.gradientFrom}, ${personality.gradientTo})`,
              color: 'white',
              width: '100%',
              height: '100%',
              padding: '40px',
              textAlign: 'center',
              fontFamily: 'Inter',
            }}
          >
            <img
              src={`data:image/png;base64,${Buffer.from(logoImage).toString(
                "base64"
              )}`}
              style={{
                width: "80px",
                marginBottom: "20px",
                borderRadius: "10px",
              }}
            />
            
            <div style={{ 
              fontSize: 28, 
              opacity: 0.9, 
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              SWIFTUI FUNDAMENTALS
            </div>
            
            <div style={{ 
              width: 150, 
              height: 150, 
              borderRadius: '75px', 
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 80,
              fontWeight: 'bold',
              marginBottom: '30px'
            }}>
              {personalityType.charAt(0).toUpperCase()}
            </div>
            
            <div style={{ 
              fontSize: 60, 
              fontWeight: 'bold', 
              marginBottom: '20px',
              fontFamily: 'InterBold',
            }}>
              {personality.title}
            </div>
            
            <div style={{ fontSize: 30, marginBottom: '40px', opacity: 0.8 }}>
              {personality.description}
            </div>
            
            <div style={{ fontSize: 24, opacity: 0.7 }}>
              Farcaster #{id}
            </div>
          </div>
        ),
        {
          ...size,
          fonts: [
            {
              name: "Inter",
              data: textFontData,
              style: "normal",
            },
            {
              name: "InterBold",
              data: titleFontData,
              style: "normal",
            },
          ],
        }
      );
    }

    // Default image if no personality type is provided
    // Load and prepare the custom font with the text to be rendered
    const fontData = await loadGoogleFont("Inter:wght@600", "SwiftUI Fundamentals");
    const bodyFontData = await loadGoogleFont("Inter", "Explore the core principles of SwiftUI");

    // Generate and return the image response with the composed elements
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
            background: "linear-gradient(to bottom right, #8b5cf6, #c084fc)",
            color: "white",
            gap: "20px",
            padding: "40px",
          }}
        >
          <img
            src={`data:image/png;base64,${Buffer.from(logoImage).toString(
              "base64"
            )}`}
            style={{
              width: "80px",
              marginBottom: "20px",
              borderRadius: "10px",
            }}
          />
          
          <div
            style={{
              fontSize: 60,
              fontWeight: "bold",
              fontFamily: "InterBold",
              marginBottom: "20px",
            }}
          >
            SwiftUI Fundamentals
          </div>
          
          <div
            style={{
              fontSize: 28,
              opacity: 0.9,
              fontFamily: "Inter",
              textAlign: "center",
              maxWidth: "70%",
              marginBottom: "20px",
            }}
          >
            Explore the core principles of SwiftUI with our introductory course
          </div>
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "16px 32px",
              fontWeight: "500",
              fontSize: "24px",
              marginTop: "20px",
            }}
          >
            Farcaster #{id}
          </div>
        </div>
      ),
      {
        ...size,
        // Configure the custom font for use in the image
        fonts: [
          {
            name: "Inter",
            data: bodyFontData,
            style: "normal",
          },
          {
            name: "InterBold",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (e) {
    // Log and handle any errors during image generation
    console.log(`Failed to generate image`, e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}