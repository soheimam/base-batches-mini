"use client";

import { useEffect, useState } from 'react';
import { Button } from './DemoComponents';
import { QuizResult } from './Quiz';

type LeaderboardProps = {
  userFid: number;
};

type LeaderboardEntry = QuizResult & {
  displayName?: string;
};

export function Leaderboard({ userFid }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/quiz/leaderboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        setEntries(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Could not load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const personalityDistribution = entries.reduce((acc, entry) => {
    acc[entry.personalityType] = (acc[entry.personalityType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEntries = entries.length;

  const personalityTypes = {
    'builder': { title: 'The Builder', color: 'from-blue-500 to-cyan-400' },
    'visionary': { title: 'The Visionary', color: 'from-purple-500 to-pink-400' },
    'connector': { title: 'The Connector', color: 'from-green-500 to-emerald-400' },
    'analyst': { title: 'The Analyst', color: 'from-yellow-500 to-amber-400' }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden p-5">
          <div className="flex justify-center items-center p-10">
            <div className="w-10 h-10 border-4 border-[var(--app-accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden p-5">
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--app-card-border)]">
          <h3 className="text-lg font-medium text-[var(--app-foreground)]">
            Personality Leaderboard
          </h3>
        </div>
        
        <div className="p-5">
          {entries.length === 0 ? (
            <p className="text-center text-[var(--app-foreground-muted)] py-4">
              No quiz results yet. Be the first to take the quiz!
            </p>
          ) : (
            <>
              {/* Distribution chart */}
              <div className="mb-8">
                <h4 className="text-md font-medium mb-3">Personality Distribution</h4>
                <div className="space-y-3">
                  {Object.entries(personalityTypes).map(([type, data]) => {
                    const count = personalityDistribution[type] || 0;
                    const percentage = totalEntries > 0 
                      ? Math.round((count / totalEntries) * 100) 
                      : 0;
                    
                    return (
                      <div key={type}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-[var(--app-foreground-muted)]">
                            {data.title}
                          </span>
                          <span className="text-sm font-medium text-[var(--app-foreground-muted)]">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[var(--app-gray)] rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${data.color} h-2 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent results */}
              <h4 className="text-md font-medium mb-3">Recent Results</h4>
              <div className="overflow-hidden rounded-lg border border-[var(--app-card-border)]">
                <table className="min-w-full divide-y divide-[var(--app-card-border)]">
                  <thead className="bg-[var(--app-gray)]">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[var(--app-foreground-muted)] uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[var(--app-foreground-muted)] uppercase tracking-wider">
                        Personality
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[var(--app-foreground-muted)] uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--app-card-border)]">
                    {entries.slice(0, 10).map((entry, index) => (
                      <tr key={index} className={entry.userFid === userFid ? "bg-[var(--app-accent-light)]" : ""}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-[var(--app-gray)] flex items-center justify-center mr-2">
                              {entry.displayName?.charAt(0) || `F${entry.userFid.toString().slice(-4)}`}
                            </div>
                            <span>{entry.displayName || `Farcaster #${entry.userFid}`}</span>
                            {entry.userFid === userFid && (
                              <span className="ml-2 text-xs text-[var(--app-accent)]">(You)</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {personalityTypes[entry.personalityType]?.title || entry.personalityType}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {entry.score}/{Object.keys(personalityTypes).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 