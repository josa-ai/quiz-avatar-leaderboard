import React, { useState, useEffect, useCallback } from 'react';
import { escapeRooms as initialRooms, hostQuotes } from '@/data/gameData';
import AIHost from './AIHost';
import Timer from './Timer';

interface Round2Props {
  onComplete: (score: number, roomsCompleted: number) => void;
  onEndGame: () => void;
  questionSeed?: number;
}

const Round2EscapeRoom: React.FC<Round2Props> = ({ onComplete, onEndGame }) => {
  const [rooms, setRooms] = useState(() => JSON.parse(JSON.stringify(initialRooms)));
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [currentEquationIndex, setCurrentEquationIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [hostMessage, setHostMessage] = useState('');
  const [showBuzzer, setShowBuzzer] = useState(false);
  const [roomsCompleted, setRoomsCompleted] = useState(0);

  const currentRoom = rooms[currentRoomIndex];
  const currentEquation = currentRoom?.equations[currentEquationIndex];

  const roomBackgrounds = [
    'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321926395_62d6162e.png',
    'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321926395_62d6162e.png',
    'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321926395_62d6162e.png'
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      setIsRunning(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isRunning || feedback || !userAnswer.trim()) return;

    const numAnswer = parseFloat(userAnswer);
    const isCorrect = numAnswer === currentEquation.answer;

    if (isCorrect) {
      setScore(prev => prev + 200);
      setFeedback('correct');
      setHostMessage(hostQuotes.correct[Math.floor(Math.random() * hostQuotes.correct.length)]);

      setTimeout(() => {
        setFeedback(null);
        setHostMessage('');
        setUserAnswer('');

        if (currentEquationIndex < currentRoom.equations.length - 1) {
          setCurrentEquationIndex(prev => prev + 1);
        } else {
          // Room completed
          const newRooms = [...rooms];
          newRooms[currentRoomIndex].isCompleted = true;
          setRoomsCompleted(prev => prev + 1);
          
          if (currentRoomIndex < rooms.length - 1) {
            newRooms[currentRoomIndex + 1].isUnlocked = true;
            setRooms(newRooms);
            setCurrentRoomIndex(prev => prev + 1);
            setCurrentEquationIndex(0);
            setHostMessage("Room cleared! Moving to the next challenge!");
          } else {
            // All rooms completed
            handleTimeUp();
          }
        }
      }, 1500);
    } else {
      setFeedback('incorrect');
      setHostMessage(hostQuotes.incorrect[Math.floor(Math.random() * hostQuotes.incorrect.length)]);
      setTimeout(() => {
        setFeedback(null);
        setHostMessage('');
        setUserAnswer('');
      }, 1000);
    }
  }, [currentEquation, currentEquationIndex, currentRoom, currentRoomIndex, feedback, isRunning, rooms, userAnswer]);

  const handleTimeUp = useCallback(() => {
    setIsRunning(false);
    setShowBuzzer(true);
    
    setTimeout(() => {
      setShowBuzzer(false);
      onComplete(score, roomsCompleted);
    }, 2000);
  }, [score, roomsCompleted, onComplete]);

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AIHost messageType="round2Intro" size="large" />
          <div className="mt-8">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
              ROUND 2
            </h2>
            <p className="text-2xl text-white mb-2">MATH ESCAPE ROOM</p>
            <p className="text-slate-400">10 minutes | 3 Rooms | Solve to Escape</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Room background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${roomBackgrounds[currentRoomIndex]})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900"></div>

      {/* Buzzer overlay */}
      {showBuzzer && (
        <div className="fixed inset-0 bg-red-500/30 z-50 flex items-center justify-center animate-pulse">
          <div className="text-center">
            <div className="text-8xl font-black text-white mb-4 animate-bounce">TIME'S UP!</div>
          </div>
        </div>
      )}

      <div className="relative z-10 p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={onEndGame}
              className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium mb-1"
            >
              ✕ End Game
            </button>
            <h1 className="text-2xl font-bold text-white">Round 2: Escape Room</h1>
            <p className="text-cyan-400 font-semibold">{currentRoom.name}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-slate-400 text-sm">Score</p>
              <p className="text-3xl font-bold text-cyan-400">{score}</p>
            </div>
            <Timer 
              duration={600} 
              onTimeUp={handleTimeUp} 
              isRunning={isRunning}
              size="medium"
            />
          </div>
        </div>

        {/* Room progress */}
        <div className="flex gap-4 mb-8">
          {rooms.map((room: any, index: number) => (
            <div 
              key={room.id}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                index === currentRoomIndex 
                  ? 'border-cyan-400 bg-cyan-400/20' 
                  : room.isCompleted 
                    ? 'border-green-500 bg-green-500/20'
                    : room.isUnlocked
                      ? 'border-slate-600 bg-slate-800/50'
                      : 'border-slate-700 bg-slate-800/30 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {room.isCompleted ? (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : room.isUnlocked ? (
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
                <span className={`text-sm font-semibold ${
                  index === currentRoomIndex ? 'text-cyan-400' : 
                  room.isCompleted ? 'text-green-400' : 'text-slate-400'
                }`}>
                  Room {index + 1}
                </span>
              </div>
              <p className="text-white text-sm">{room.name}</p>
            </div>
          ))}
        </div>

        {/* AI Host */}
        {hostMessage && (
          <div className="mb-6">
            <AIHost message={hostMessage} messageType="custom" size="small" isAnimating />
          </div>
        )}

        {/* Equation Card */}
        <div className={`bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border-2 transition-all duration-300 ${
          feedback === 'correct' ? 'border-green-500 shadow-lg shadow-green-500/30' :
          feedback === 'incorrect' ? 'border-red-500 shadow-lg shadow-red-500/30 animate-shake' :
          'border-slate-700/50'
        }`}>
          {/* Progress in room */}
          <div className="flex items-center gap-2 mb-6">
            {currentRoom.equations.map((_: any, idx: number) => (
              <div 
                key={idx}
                className={`w-8 h-2 rounded-full transition-all ${
                  idx < currentEquationIndex ? 'bg-green-500' :
                  idx === currentEquationIndex ? 'bg-cyan-400' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Equation */}
          <div className="text-center mb-8">
            <p className="text-slate-400 mb-2">Solve for the variable:</p>
            <div className="text-4xl md:text-5xl font-mono font-bold text-white bg-slate-700/50 rounded-2xl p-6 inline-block">
              {currentEquation.equation}
            </div>
          </div>

          {/* Answer input */}
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter your answer"
              className="flex-1 px-6 py-4 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white text-2xl text-center font-bold placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={!userAnswer.trim() || !!feedback}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-xl text-white shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
            >
              SUBMIT
            </button>
          </form>
        </div>

        {/* Hint */}
        <p className="text-center text-slate-500 mt-6 text-sm">
          Tip: Enter only the numerical answer (e.g., 5, -3, 0.5)
        </p>
      </div>
    </div>
  );
};

export default Round2EscapeRoom;
