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
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

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
      setSubmitStatus('submitting');
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
        setSubmitStatus('error');
      } else {
        setSubmitStatus('success');
      }
    } catch (error) {
      console.error('Error submitting quiz result:', error);
      setSubmitStatus('error');
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
              <div className="p-5 text-center">
                <h2 className="text-xl font-bold mb-4">Share Your Result</h2>
                
                {submitStatus === 'submitting' && (
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-md mb-4 flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving your result...
                  </div>
                )}
                
                {submitStatus === 'success' && (
                  <div className="bg-green-100 text-green-700 p-2 rounded-md mb-4">
                    Result saved successfully!
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4">
                    Failed to save result. Try submitting again from the quiz page.
                  </div>
                )}
                
                <p className="text-[var(--app-foreground-muted)] mb-6">
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
