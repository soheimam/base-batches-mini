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
  const [filteredEntries, setFilteredEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [userPersonality, setUserPersonality] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // Fetch initial leaderboard data
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
        setFilteredEntries(data);
        
        // Find current user's personality type
        const userEntry = data.find((entry: LeaderboardEntry) => entry.userFid === userFid);
        if (userEntry) {
          setUserPersonality(userEntry.personalityType);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Could not load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [userFid]);

  // Function to fetch filtered user types from Redis
  const fetchUsersByType = async (params: Record<string, string>) => {
    setIsFiltering(true);
    try {
      // Add userFid to params
      const queryParams = new URLSearchParams({
        ...params,
        userFid: userFid.toString()
      }).toString();
      
      const response = await fetch(`/api/quiz/user-types?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user types');
      }
      
      const data = await response.json();
      setFilteredEntries(data);
    } catch (err) {
      console.error('Error fetching user types:', err);
      // Fall back to client-side filtering if Redis query fails
      clientSideFilter(params);
    } finally {
      setIsFiltering(false);
    }
  };

  // Fallback to client-side filtering if Redis query fails
  const clientSideFilter = (params: Record<string, string>) => {
    if (params.type) {
      const filtered = entries.filter(entry => entry.personalityType === params.type);
      setFilteredEntries(filtered);
    } else if (params.compatible && userPersonality) {
      const personalityCompatibility: Record<string, string[]> = {
        'builder': ['connector', 'visionary'],
        'visionary': ['builder', 'analyst'],
        'connector': ['builder', 'analyst'],
        'analyst': ['visionary', 'connector']
      };
      
      const compatibleTypes = personalityCompatibility[userPersonality as keyof typeof personalityCompatibility];
      const compatibleEntries = entries.filter(entry => 
        compatibleTypes.includes(entry.personalityType) && entry.userFid !== userFid
      );
      
      setFilteredEntries(compatibleEntries);
    } else {
      setFilteredEntries(entries);
    }
  };

  const handleFilterChange = (type: string | null) => {
    setActiveFilter(type);
    
    if (type === null) {
      setFilteredEntries(entries);
    } else {
      fetchUsersByType({ type });
    }
  };

  const findCompatible = () => {
    if (!userPersonality) return;
    
    setActiveFilter('compatible');
    fetchUsersByType({ compatible: userPersonality });
  };

  const findSameType = () => {
    if (!userPersonality) return;
    
    setActiveFilter(userPersonality);
    fetchUsersByType({ type: userPersonality });
  };

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
        <div className="bg-purple-100 dark:bg-purple-900/20 backdrop-blur-md rounded-xl shadow-lg border border-purple-200 dark:border-purple-800 overflow-hidden p-6">
          <div className="flex justify-center items-center p-10">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-purple-100 dark:bg-purple-900/20 backdrop-blur-md rounded-xl shadow-lg border border-purple-200 dark:border-purple-800 overflow-hidden p-6">
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-purple-800 hover:bg-purple-900 text-white px-8 py-2 rounded-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-purple-100 dark:bg-purple-900/20 backdrop-blur-md rounded-xl shadow-lg border border-purple-200 dark:border-purple-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100">
            Personality Leaderboard
          </h3>
        </div>
        
        <div className="p-6">
          {entries.length === 0 ? (
            <p className="text-center text-purple-700 dark:text-purple-300 py-4">
              No quiz results yet. Be the first to take the quiz!
            </p>
          ) : (
            <>
              {/* Filter options */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-purple-900 dark:text-purple-100">Find Your People</h4>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {userPersonality && (
                    <>
                      <Button 
                        variant={activeFilter === 'compatible' ? 'primary' : 'outline'} 
                        onClick={findCompatible}
                        className={`text-sm ${activeFilter === 'compatible' ? 
                          'bg-purple-800 hover:bg-purple-900 text-white' : 
                          'border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50'}`}
                        disabled={isFiltering}
                      >
                        Find Compatible Types
                      </Button>
                      <Button 
                        variant={activeFilter === userPersonality ? 'primary' : 'outline'} 
                        onClick={findSameType}
                        className={`text-sm ${activeFilter === userPersonality ? 
                          'bg-purple-800 hover:bg-purple-900 text-white' : 
                          'border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50'}`}
                        disabled={isFiltering}
                      >
                        Find Same Type As You
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(personalityTypes).map(([type, data]) => (
                    <Button 
                      key={type}
                      variant={activeFilter === type ? 'primary' : 'ghost'} 
                      size="sm"
                      onClick={() => handleFilterChange(type)}
                      className={`text-xs ${activeFilter === type ? 
                        'bg-purple-800 hover:bg-purple-900 text-white' : 
                        'text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50'}`}
                      disabled={isFiltering}
                    >
                      {data.title}
                    </Button>
                  ))}
                  <Button 
                    variant={activeFilter === null ? 'primary' : 'ghost'} 
                    size="sm"
                    onClick={() => handleFilterChange(null)}
                    className={`text-xs ${activeFilter === null ? 
                      'bg-purple-800 hover:bg-purple-900 text-white' : 
                      'text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50'}`}
                    disabled={isFiltering}
                  >
                    All Types
                  </Button>
                </div>
              </div>

              {/* Distribution chart */}
              <div className="mb-8">
                <h4 className="text-md font-medium mb-3 text-purple-900 dark:text-purple-100">Personality Distribution</h4>
                <div className="space-y-3">
                  {Object.entries(personalityTypes).map(([type, data]) => {
                    const count = personalityDistribution[type] || 0;
                    const percentage = totalEntries > 0 
                      ? Math.round((count / totalEntries) * 100) 
                      : 0;
                    
                    return (
                      <div key={type}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-purple-700 dark:text-purple-300">
                            {data.title}
                          </span>
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
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

              {/* Results table */}
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-purple-900 dark:text-purple-100">
                    {activeFilter ? 
                      activeFilter === 'compatible' ? 
                        'Compatible Personalities' : 
                        `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Types` 
                      : 'Recent Results'}
                  </h4>
                  <span className="text-sm text-purple-700 dark:text-purple-300">
                    {isFiltering ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        Filtering...
                      </div>
                    ) : (
                      `${filteredEntries.length} ${filteredEntries.length === 1 ? 'result' : 'results'}`
                    )}
                  </span>
                </div>
                {!isFiltering && filteredEntries.length === 0 ? (
                  <p className="text-center text-purple-700 dark:text-purple-300 py-4 mt-4">
                    No users found with this filter.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-purple-200 dark:border-purple-800 mt-3">
                    <table className="min-w-full divide-y divide-purple-200 dark:divide-purple-800">
                      <thead className="bg-purple-200/50 dark:bg-purple-800/50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                            Personality
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-200 dark:divide-purple-800">
                        {!isFiltering && filteredEntries.slice(0, 10).map((entry, index) => (
                          <tr key={index} className={entry.userFid === userFid ? "bg-purple-200/30 dark:bg-purple-800/30" : ""}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-purple-300 dark:bg-purple-700 flex items-center justify-center mr-2 text-purple-800 dark:text-purple-200">
                                  {entry.displayName?.charAt(0) || `F${entry.userFid.toString().slice(-4)}`}
                                </div>
                                <span className="text-purple-800 dark:text-purple-200">{entry.displayName || `Farcaster #${entry.userFid}`}</span>
                                {entry.userFid === userFid && (
                                  <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">(You)</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-purple-800 dark:text-purple-200">
                              {personalityTypes[entry.personalityType]?.title || entry.personalityType}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-purple-800 dark:text-purple-200">
                              {entry.score}/{Object.keys(personalityTypes).length}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 