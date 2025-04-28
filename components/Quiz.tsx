"use client";

import { useState } from 'react';
import { Button } from './DemoComponents';

// Personality types and their descriptions
const personalityTypes = {
  'builder': {
    title: 'The Builder',
    description: 'You love creating things and seeing tangible results. You\'re practical, hands-on, and enjoy solving problems through building solutions.'
  },
  'visionary': {
    title: 'The Visionary',
    description: 'You see possibilities where others don\'t. You\'re future-oriented, creative, and always thinking about what\'s next in the space.'
  },
  'connector': {
    title: 'The Connector',
    description: 'You thrive on bringing people together. You\'re social, empathetic, and excel at creating communities and meaningful relationships.'
  },
  'analyst': {
    title: 'The Analyst',
    description: 'You love diving deep into data and understanding how things work. You\'re logical, detail-oriented, and make decisions based on thorough research.'
  }
};

// Quiz questions
const questions = [
  {
    id: 1,
    question: 'When starting a new project, you prefer to:',
    options: [
      { text: 'Jump right in and start building', type: 'builder' },
      { text: 'Think about the big picture and long-term vision', type: 'visionary' },
      { text: 'Discuss it with others and gather feedback', type: 'connector' },
      { text: 'Research thoroughly and analyze all aspects', type: 'analyst' }
    ]
  },
  {
    id: 2,
    question: 'In a team setting, you\'re most likely to:',
    options: [
      { text: 'Take charge of implementation details', type: 'builder' },
      { text: 'Share innovative ideas and possibilities', type: 'visionary' },
      { text: 'Focus on team dynamics and making sure everyone is heard', type: 'connector' },
      { text: 'Evaluate different approaches and identify potential issues', type: 'analyst' }
    ]
  },
  {
    id: 3,
    question: 'When you hear about a new blockchain technology, you first:',
    options: [
      { text: 'Try to build something with it right away', type: 'builder' },
      { text: 'Imagine all the potential applications', type: 'visionary' },
      { text: 'Share it with your network and discuss possibilities', type: 'connector' },
      { text: 'Research how it works and its technical merits', type: 'analyst' }
    ]
  },
  {
    id: 4,
    question: 'Your ideal Web3 project would be:',
    options: [
      { text: 'A practical tool that solves a specific problem', type: 'builder' },
      { text: 'Something revolutionary that changes how people think', type: 'visionary' },
      { text: 'A platform that brings people together in new ways', type: 'connector' },
      { text: 'A system with elegant design and technical excellence', type: 'analyst' }
    ]
  },
  {
    id: 5,
    question: 'When faced with a challenge, you typically:',
    options: [
      { text: 'Roll up your sleeves and work until you solve it', type: 'builder' },
      { text: 'Step back and think of creative, unconventional solutions', type: 'visionary' },
      { text: 'Reach out to others who might help or collaborate', type: 'connector' },
      { text: 'Break it down into smaller parts and analyze each component', type: 'analyst' }
    ]
  }
];

type QuizProps = {
  userFid: number;
  onComplete: (result: QuizResult) => void;
  onStart: () => void;
};

export type QuizResult = {
  userFid: number;
  personalityType: keyof typeof personalityTypes;
  score: number;
  timestamp: number;
};

export function Quiz({ userFid, onComplete, onStart }: QuizProps) {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleStart = () => {
    setStarted(true);
    onStart();
  };

  const handleAnswer = (type: string) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed, calculate result
      const counts: Record<string, number> = {};
      newAnswers.forEach(type => {
        counts[type] = (counts[type] || 0) + 1;
      });

      // Find dominant personality type
      let maxCount = 0;
      let dominantType = 'builder';
      
      Object.entries(counts).forEach(([type, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantType = type;
        }
      });

      const quizResult: QuizResult = {
        userFid,
        personalityType: dominantType as keyof typeof personalityTypes,
        score: maxCount,
        timestamp: Date.now()
      };

      setResult(quizResult);
      setCompleted(true);
      onComplete(quizResult);
    }
  };

  if (!started) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden p-5">
          <h2 className="text-xl font-bold text-center mb-4">Discover Your Web3 Personality</h2>
          <p className="text-[var(--app-foreground-muted)] mb-6 text-center">
            Take this quick quiz to find out what kind of Web3 builder you are!
          </p>
          <div className="flex justify-center">
            <Button onClick={handleStart}>Start Quiz</Button>
          </div>
        </div>
      </div>
    );
  }

  if (completed && result) {
    const personalityType = personalityTypes[result.personalityType];
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden p-5">
          <h2 className="text-xl font-bold text-center mb-2">Your Web3 Personality</h2>
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {result.personalityType.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-center mb-2 text-[var(--app-accent)]">{personalityType.title}</h3>
          <p className="text-[var(--app-foreground-muted)] mb-6 text-center">
            {personalityType.description}
          </p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => {
              setStarted(false);
              setCurrentQuestion(0);
              setAnswers([]);
              setCompleted(false);
              setResult(null);
            }}>
              Retake Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden p-5">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[var(--app-foreground-muted)]">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-sm font-medium text-[var(--app-accent)]">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-[var(--app-gray)] rounded-full h-2">
            <div 
              className="bg-[var(--app-accent)] h-2 rounded-full" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-4">{questions[currentQuestion].question}</h3>
        
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.type)}
              className="w-full text-left px-4 py-3 rounded-lg border border-[var(--app-card-border)] hover:border-[var(--app-accent)] hover:bg-[var(--app-accent-light)] transition-colors"
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 