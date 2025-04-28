"use client";

import { sdk } from '@farcaster/frame-sdk'
import React, { useState } from 'react'
import { Button } from './DemoComponents'
import { QuizResult } from './Quiz'

type ShareButtonProps = {
  userFid: number
  quizResult?: QuizResult | null
}

export function ShareButton({ userFid, quizResult }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // Use same image URL for all shares - only showing FID
      const imageUrl = `https://my-mini-batches-social.vercel.app/api/dynamic-share-image/${userFid}`;
      
      // Default text
      let text = 'Check out my profile on MiniApp! 🎉';
      
      // If we have quiz results, customize only the text content
      if (quizResult) {
        const personalityTypes = {
          'builder': 'The Builder',
          'visionary': 'The Visionary',
          'connector': 'The Connector',
          'analyst': 'The Analyst'
        };
        
        const personalityTitle = personalityTypes[quizResult.personalityType] || quizResult.personalityType;
        
        text = `I took the Web3 Personality Quiz and I'm "${personalityTitle}"! Take it yourself and see what you get. 🧠`;
      }

      // Launch the Farcaster composer with the image as an embed
      await sdk.actions.composeCast({
        text,
        embeds: [imageUrl],
      });
    } catch (error) {
      console.error("Error sharing to Farcaster:", error);
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <Button 
      onClick={handleShare}
      disabled={isSharing}
      className="w-full bg-purple-800 hover:bg-purple-900 text-white rounded-full py-3 flex items-center justify-center"
      icon={<ShareIcon />}
    >
      {isSharing ? 'Sharing...' : 'Continue'}
    </Button>
  )
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 24 24"
      className="ml-2"
    >
      <path d="M13.5 4.5L21 12m0 0L13.5 19.5M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
