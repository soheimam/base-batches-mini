import { sdk } from '@farcaster/frame-sdk'
import React, { useState } from 'react'

type ShareButtonProps = {
  userFid: number
}

export function ShareButton({ userFid }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    // 1. Construct your dynamic-image URL for sharing
    const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/dynamic-share-image/${userFid}`

    try {
      setIsSharing(true);
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8L6 16M18 16L6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {isSharing ? 'Sharing...' : 'Share on Farcaster'}
    </button>
  )
}
