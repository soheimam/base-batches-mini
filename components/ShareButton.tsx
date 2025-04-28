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
      
      let text = 'Check out my profile on MiniApp! 🎉';
      let imageUrl = `https://my-mini-batches-social.vercel.app/api/dynamic-share-image/${userFid}`;
      
      // If we have quiz results, customize the share content
      if (quizResult) {
        const personalityTypes = {
          'builder': 'The Builder',
          'visionary': 'The Visionary',
          'connector': 'The Connector',
          'analyst': 'The Analyst'
        };
        
        const personalityTitle = personalityTypes[quizResult.personalityType] || quizResult.personalityType;
        
        text = `I took the Web3 Personality Quiz and I'm "${personalityTitle}"! Take it yourself and see what you get. 🧠`;
        
        // Use the existing dynamic-share-image endpoint with the personality type as a query parameter
        imageUrl = `https://my-mini-batches-social.vercel.app/api/dynamic-share-image/${userFid}?personality=${quizResult.personalityType}`;
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
      className="w-full"
      variant="secondary"
      icon={<ShareIcon />}
    >
      {isSharing ? 'Sharing...' : 'Share on Farcaster'}
    </Button>
  )
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
    </svg>
  );
}
