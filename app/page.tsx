"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "../components/DemoComponents";
import { Icon } from "../components/DemoComponents";
import { Quiz, QuizResult } from "../components/Quiz";
import { Leaderboard } from "../components/Leaderboard";
import { ShareButton } from "../components/ShareButton";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeView, setActiveView] = useState<'quiz' | 'results' | 'leaderboard'>('quiz');
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const handleQuizComplete = useCallback(async (result: QuizResult) => {
    setQuizResult(result);
    setActiveView('results');
    
    // Store result in Redis
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to submit quiz result:', errorText);
      }
    } catch (error) {
      console.error('Error submitting quiz result:', error);
    }
  }, []);

  const handleQuizStart = useCallback(() => {
    // Analytics or other actions when quiz starts
    console.log('Quiz started by user:', context?.user?.fid || 203090);
  }, [context?.user?.fid]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
              <Wallet className="z-10">
                <ConnectWallet>
                  <Name className="text-inherit" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
          <div>{saveFrameButton}</div>
        </header>

        <main className="flex-1">
          <h1 className="text-2xl font-bold text-center mb-6">Web3 Personality Quiz</h1>
          
          {/* View navigation */}
          <div className="flex space-x-2 mb-6">
            <Button 
              variant={activeView === 'quiz' ? 'primary' : 'ghost'} 
              size="sm" 
              className="flex-1"
              onClick={() => setActiveView('quiz')}
            >
              Quiz
            </Button>
            <Button 
              variant={activeView === 'results' && quizResult ? 'primary' : 'ghost'} 
              size="sm" 
              className="flex-1"
              onClick={() => quizResult && setActiveView('results')}
              disabled={!quizResult}
            >
              Your Result
            </Button>
            <Button 
              variant={activeView === 'leaderboard' ? 'primary' : 'ghost'} 
              size="sm" 
              className="flex-1"
              onClick={() => setActiveView('leaderboard')}
            >
              Leaderboard
            </Button>
          </div>
          
          {/* Active view content */}
          {activeView === 'quiz' && (
            <Quiz 
              userFid={context?.user?.fid || 203090}
              onComplete={handleQuizComplete}
              onStart={handleQuizStart}
            />
          )}
          
          {activeView === 'results' && quizResult && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden p-5">
                <h2 className="text-xl font-bold text-center mb-4">Share Your Result</h2>
                <p className="text-[var(--app-foreground-muted)] mb-6 text-center">
                  Let your friends know about your Web3 personality type!
                </p>
                <div className="space-y-3">
                  <ShareButton userFid={context?.user?.fid || 203090} quizResult={quizResult} />
                  <Button variant="outline" className="w-full" onClick={() => setActiveView('leaderboard')}>
                    View Leaderboard
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {activeView === 'leaderboard' && (
            <Leaderboard userFid={context?.user?.fid || 203090} />
          )}
        </main>

        <footer className="mt-2 pt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            Built on Base with MiniKit
          </Button>
        </footer>
      </div>
    </div>
  );
}
