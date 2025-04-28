import { loadGoogleFont, loadImage } from "@/lib/og-utils";
import { ImageResponse } from "next/og";

// Force dynamic rendering to ensure fresh image generation on each request
export const dynamic = "force-dynamic";

// Define the dimensions for the generated OpenGraph image
const size = {
  width: 600,
  height: 400,
};

//  Thankyou to the builider Garden and Limone for the original code https://github.com/builders-garden/base-minikit-starter
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
    if (id.includes('/')) {
      const parts = id.split('/');
      id = parts[0]; // The actual ID is the first part
    }
    
    // Get the application's base URL from environment variables
    const appUrl = process.env.NEXT_PUBLIC_URL || "https://my-mini-batches-social.vercel.app";

    // Load the logo image from the public directory
    const logoImage = await loadImage(`${appUrl}/images/icon.png`);

    // Load font for the text
    const fontData = await loadGoogleFont("Press+Start+2P", "Farcaster FID: " + id);

    // Generate and return the image response
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
          
          {/* Display the Farcaster FID with custom styling */}
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