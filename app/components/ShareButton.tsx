import { sdk } from '@farcaster/frame-sdk'
import React, { useState } from 'react'

type ShareButtonProps = {
  userFid: number
}

export function ShareButton({ userFid }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // 1. Construct your dynamic-image URL for sharing
      // Use the full absolute URL for the image embed
      const imageUrl = `${process.env.NEXT_PUBLIC_URL}/api/dynamic-share-image/${userFid}`;

      // 2. Launch the Farcaster composer with that image as an embed
      await sdk.actions.composeCast({
        text: `Check out my profile on MiniApp! 🎉`,
        embeds: [imageUrl],
      });
    } catch (error) {
      console.error("Error sharing to Farcaster:", error);
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <button 
      onClick={handleShare}
      disabled={isSharing}
      className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
    >
      {isSharing ? 'Sharing...' : 'Share on Farcaster'}
    </button>
  )
}
