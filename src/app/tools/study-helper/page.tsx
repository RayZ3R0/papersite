'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ClockIcon,
  BookOpenIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
  LightBulbIcon,
  AcademicCapIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  FireIcon,
  TrophyIcon,
  CalendarIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

// Study Technique Types
interface StudyTechnique {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'focus' | 'practice' | 'review' | 'planning';
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  color: string;
}

// Pomodoro Timer Component
function PomodoroTimer() {
  const [workDuration, setWorkDuration] = useState(25); // minutes
  const [breakDuration, setBreakDuration] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [session, setSession] = useState<'work' | 'break'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Preset options for work and break durations
  const workOptions = [15, 25, 30, 45, 50];
  const breakOptions = [5, 10, 15, 20];

  // Audio notification function
  const playNotificationSound = (type: 'work' | 'break') => {
    // Create audio context for notification sound
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different tones for work vs break
      if (type === 'break') {
        // Higher, more urgent tone for break time
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      } else {
        // Lower, calmer tone for back to work
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
      }
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Session completed
      setIsRunning(false);
      if (session === 'work') {
        setCompletedSessions(prev => prev + 1);
        setSession('break');
        setTimeLeft(breakDuration * 60); // Use selected break duration
        playNotificationSound('break'); // Play break notification
      } else {
        setSession('work');
        setTimeLeft(workDuration * 60); // Use selected work duration
        playNotificationSound('work'); // Play work notification
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, session, workDuration, breakDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setSession('work');
    setTimeLeft(workDuration * 60);
  };

  const updateWorkDuration = (minutes: number) => {
    setWorkDuration(minutes);
    if (session === 'work' && !isRunning) {
      setTimeLeft(minutes * 60);
    }
  };

  const updateBreakDuration = (minutes: number) => {
    setBreakDuration(minutes);
    if (session === 'break' && !isRunning) {
      setTimeLeft(minutes * 60);
    }
  };

  return (
    <div className="bg-surface rounded-xl p-6 border border-border">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold text-text">Pomodoro Timer</h3>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            disabled={isRunning}
          >
            <svg
              className="h-5 w-5 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-surface-alt rounded-lg p-4 space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Work Duration (minutes)
              </label>
              <div className="flex gap-2 flex-wrap">
                {workOptions.map(minutes => (
                  <button
                    key={minutes}
                    onClick={() => updateWorkDuration(minutes)}
                    disabled={isRunning}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      workDuration === minutes
                        ? 'bg-primary text-white'
                        : 'bg-surface hover:bg-surface-hover text-text border border-border'
                    }`}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Break Duration (minutes)
              </label>
              <div className="flex gap-2 flex-wrap">
                {breakOptions.map(minutes => (
                  <button
                    key={minutes}
                    onClick={() => updateBreakDuration(minutes)}
                    disabled={isRunning}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      breakDuration === minutes
                        ? 'bg-secondary text-white'
                        : 'bg-surface hover:bg-surface-hover text-text border border-border'
                    }`}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-text-muted">
                Settings can only be changed when timer is stopped
              </p>
            </div>
          </div>
        )}

        <div className={`text-6xl font-mono font-bold ${session === 'work' ? 'text-primary' : 'text-secondary'}`}>
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            session === 'work' 
              ? 'bg-primary/10 text-primary' 
              : 'bg-secondary/10 text-secondary'
          }`}>
            {session === 'work' ? `Focus Time (${workDuration}m)` : `Break Time (${breakDuration}m)`}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <PauseIcon className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5" />
                Start
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium
              bg-surface-alt hover:bg-surface-hover text-text border border-border transition-colors"
          >
            <StopIcon className="h-5 w-5" />
            Reset
          </button>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-4 text-sm text-text-muted">
            <div className="flex items-center gap-1">
              <TrophyIcon className="h-4 w-4" />
              <span>{completedSessions} sessions completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// QP Practice Session Component
function QPPracticeSession() {
  const [subject, setSubject] = useState('');
  const [timeLimit, setTimeLimit] = useState(90);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Economics',
    'Business Studies',
    'Computer Science'
  ];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Time's up notification could go here
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const startSession = () => {
    if (subject) {
      setTimeLeft(timeLimit * 60);
      setIsActive(true);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-surface rounded-xl p-6 border border-border">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <DocumentTextIcon className="h-6 w-6 text-secondary" />
          <h3 className="text-xl font-semibold text-text">QP Practice Session</h3>
        </div>

        {!isActive ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Select Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 bg-surface-alt border border-border rounded-lg
                  text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Choose a subject...</option>
                {subjects.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Time Limit (minutes)
              </label>
              <div className="flex gap-2">
                {[60, 90, 120, 150].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setTimeLimit(mins)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      timeLimit === mins
                        ? 'bg-secondary text-white'
                        : 'bg-surface-alt hover:bg-surface-hover text-text border border-border'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startSession}
              disabled={!subject}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium
                bg-secondary hover:bg-secondary/90 disabled:bg-surface-alt disabled:text-text-muted
                text-white transition-colors disabled:cursor-not-allowed"
            >
              <PlayIcon className="h-5 w-5" />
              Start Practice Session
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold text-secondary">
              {formatTime(timeLeft)}
            </div>
            
            <div className="space-y-2">
              <p className="text-text font-medium">Practicing: {subject}</p>
              <p className="text-text-muted text-sm">Stay focused and work through the questions systematically</p>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setIsActive(false)}
                className="px-4 py-2 rounded-lg font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors"
              >
                <PauseIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => {
                  setIsActive(false);
                  setTimeLeft(timeLimit * 60);
                }}
                className="px-4 py-2 rounded-lg font-medium bg-surface-alt hover:bg-surface-hover 
                  text-text border border-border transition-colors"
              >
                <StopIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Study Techniques Data
const studyTechniques: StudyTechnique[] = [
  {
    id: 'pomodoro',
    title: 'Pomodoro Technique',
    description: 'Break study time into focused 25-minute intervals with short breaks',
    icon: ClockIcon,
    category: 'focus',
    duration: '25 min',
    difficulty: 'beginner',
    color: 'bg-red-500'
  },
  {
    id: 'active-recall',
    title: 'Active Recall',
    description: 'Test yourself without looking at notes to strengthen memory',
    icon: LightBulbIcon,
    category: 'review',
    difficulty: 'intermediate',
    color: 'bg-yellow-500'
  },
  {
    id: 'spaced-repetition',
    title: 'Spaced Repetition',
    description: 'Review material at increasing intervals for long-term retention',
    icon: ArrowPathIcon,
    category: 'review',
    difficulty: 'intermediate',
    color: 'bg-blue-500'
  },
  {
    id: 'qp-practice',
    title: 'Timed QP Practice',
    description: 'Simulate exam conditions with past paper questions',
    icon: DocumentTextIcon,
    category: 'practice',
    duration: '90-150 min',
    difficulty: 'advanced',
    color: 'bg-green-500'
  },
  {
    id: 'feynman',
    title: 'Feynman Technique',
    description: 'Explain concepts in simple terms to identify knowledge gaps',
    icon: AcademicCapIcon,
    category: 'review',
    difficulty: 'intermediate',
    color: 'bg-purple-500'
  },
  {
    id: 'mind-mapping',
    title: 'Mind Mapping',
    description: 'Create visual connections between concepts and topics',
    icon: PuzzlePieceIcon,
    category: 'planning',
    difficulty: 'beginner',
    color: 'bg-pink-500'
  },
  {
    id: 'practice-testing',
    title: 'Practice Testing',
    description: 'Regular self-testing to improve recall and identify weak areas',
    icon: QuestionMarkCircleIcon,
    category: 'practice',
    difficulty: 'intermediate',
    color: 'bg-indigo-500'
  },
  {
    id: 'interleaving',
    title: 'Interleaving',
    description: 'Mix different topics in one study session for better learning',
    icon: BeakerIcon,
    category: 'planning',
    difficulty: 'advanced',
    color: 'bg-teal-500'
  }
];

export default function StudyPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTechnique, setSelectedTechnique] = useState<StudyTechnique | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL
  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    const techniqueId = searchParams.get('technique');
    
    setSelectedCategory(category);
    
    if (techniqueId) {
      const technique = studyTechniques.find(t => t.id === techniqueId);
      setSelectedTechnique(technique || null);
    }
  }, [searchParams]);

  const categories = [
    { id: 'all', name: 'All Techniques', icon: BookOpenIcon },
    { id: 'focus', name: 'Focus & Concentration', icon: ClockIcon },
    { id: 'practice', name: 'Practice & Testing', icon: DocumentTextIcon },
    { id: 'review', name: 'Review & Retention', icon: ArrowPathIcon },
    { id: 'planning', name: 'Planning & Organization', icon: CalendarIcon }
  ];

  const filteredTechniques = selectedCategory === 'all' 
    ? studyTechniques 
    : studyTechniques.filter(t => t.category === selectedCategory);

  const updateFilters = (category: string, technique?: StudyTechnique) => {
    setSelectedCategory(category);
    setSelectedTechnique(technique || null);
    
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (technique) params.set('technique', technique.id);
    
    router.replace(`/tools/study-helper${params.toString() ? '?' + params.toString() : ''}`, { 
      scroll: false 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-[56px] md:top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="py-4 md:py-6">
            <div className="flex items-start justify-between gap-8 mb-4">
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-text">Study Techniques</h1>
                  <p className="text-text-muted mt-1">
                    Proven study methods and tools to boost your Edexcel IAL performance
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Category Filter */}
            <div className="md:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => updateFilters(category.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'bg-surface-alt hover:bg-surface-hover text-text border border-border'
                    }`}
                  >
                    <category.icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop Only */}
          <div className="hidden md:block w-80 flex-shrink-0 space-y-6">
            {/* Categories */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-text mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => updateFilters(category.id)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface-alt text-text'
                    }`}
                  >
                    <category.icon className="h-4 w-4" />
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tools */}
            <div className="space-y-4">
              <PomodoroTimer />
              <QPPracticeSession />
            </div>

            {/* Study Tips */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-text mb-3">Study Tips</h3>
              <div className="space-y-3 text-sm text-text-muted">
                <div className="flex gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Take regular breaks to maintain focus</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Practice with past papers under exam conditions</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Review and revise regularly, not just before exams</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Explain concepts to others to test understanding</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {selectedTechnique ? (
              /* Technique Detail View */
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setSelectedTechnique(null)}
                    className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                  >
                    <ChevronRightIcon className="h-5 w-5 rotate-180 text-text-muted" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${selectedTechnique.color}`}>
                      <selectedTechnique.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-text">{selectedTechnique.title}</h2>
                      <p className="text-text-muted">{selectedTechnique.description}</p>
                    </div>
                  </div>
                </div>

                {/* Technique-specific content */}
                {selectedTechnique.id === 'pomodoro' && (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <PomodoroTimer />
                    <div className="bg-surface rounded-xl p-6 border border-border">
                      <h3 className="text-lg font-semibold text-text mb-4">How it Works</h3>
                      <div className="space-y-3 text-text-muted">
                        <p>1. Choose a task to work on</p>
                        <p>2. Set timer for 25 minutes</p>
                        <p>3. Work with full focus until timer rings</p>
                        <p>4. Take a 5-minute break</p>
                        <p>5. Repeat 3-4 times, then take longer break</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTechnique.id === 'qp-practice' && (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <QPPracticeSession />
                    <div className="bg-surface rounded-xl p-6 border border-border">
                      <h3 className="text-lg font-semibold text-text mb-4">Practice Strategy</h3>
                      <div className="space-y-3 text-text-muted">
                        <p>• Start with recent past papers</p>
                        <p>• Time yourself strictly</p>
                        <p>• Review marking schemes after</p>
                        <p>• Identify weak areas</p>
                        <p>• Focus practice on problem areas</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generic technique details for others */}
                {!['pomodoro', 'qp-practice'].includes(selectedTechnique.id) && (
                  <div className="bg-surface rounded-xl p-6 border border-border">
                    <h3 className="text-lg font-semibold text-text mb-4">About This Technique</h3>
                    <p className="text-text-muted mb-4">{selectedTechnique.description}</p>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 bg-surface-alt rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {selectedTechnique.difficulty === 'beginner' ? '⭐' : 
                           selectedTechnique.difficulty === 'intermediate' ? '⭐⭐' : '⭐⭐⭐'}
                        </div>
                        <div className="text-sm font-medium text-text capitalize">
                          {selectedTechnique.difficulty}
                        </div>
                      </div>
                      
                      <div className="text-center p-4 bg-surface-alt rounded-lg">
                        <div className="text-2xl font-bold text-secondary">
                          {selectedTechnique.category === 'focus' ? '🎯' :
                           selectedTechnique.category === 'practice' ? '📝' :
                           selectedTechnique.category === 'review' ? '🔄' : '📋'}
                        </div>
                        <div className="text-sm font-medium text-text capitalize">
                          {selectedTechnique.category.replace('-', ' ')}
                        </div>
                      </div>
                      
                      {selectedTechnique.duration && (
                        <div className="text-center p-4 bg-surface-alt rounded-lg">
                          <div className="text-2xl font-bold text-accent">⏱️</div>
                          <div className="text-sm font-medium text-text">
                            {selectedTechnique.duration}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Techniques Grid */
              <div className="space-y-6">
                <div className="md:hidden space-y-4">
                  <PomodoroTimer />
                  <QPPracticeSession />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text mb-4">
                    {selectedCategory === 'all' ? 'All Study Techniques' : 
                     categories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 
                    pb-[calc(64px+env(safe-area-inset-bottom,0px))] md:pb-0">
                    {filteredTechniques.map(technique => (
                      <div
                        key={technique.id}
                        onClick={() => setSelectedTechnique(technique)}
                        className="bg-surface rounded-xl p-6 border border-border hover:border-primary/50 
                          transition-all cursor-pointer group hover:shadow-lg"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${technique.color} group-hover:scale-110 transition-transform`}>
                            <technique.icon className="h-6 w-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text mb-2 group-hover:text-primary transition-colors">
                              {technique.title}
                            </h3>
                            <p className="text-text-muted text-sm mb-3">
                              {technique.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  technique.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                  technique.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {technique.difficulty}
                                </span>
                                {technique.duration && (
                                  <span className="text-xs text-text-muted">
                                    {technique.duration}
                                  </span>
                                )}
                              </div>
                              
                              <ChevronRightIcon className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}