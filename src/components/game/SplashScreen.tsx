import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating creatures */}
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321802628_7025bef0.jpg" 
          alt="" 
          className="absolute top-10 left-10 w-16 h-16 rounded-full animate-bounce opacity-70"
          style={{ animationDelay: '0s', animationDuration: '3s' }}
        />
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321810567_99563e03.jpg" 
          alt="" 
          className="absolute top-20 right-20 w-20 h-20 rounded-full animate-bounce opacity-70"
          style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}
        />
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321811522_a9a123dd.png" 
          alt="" 
          className="absolute bottom-32 left-20 w-14 h-14 rounded-full animate-bounce opacity-70"
          style={{ animationDelay: '1s', animationDuration: '3.5s' }}
        />
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321872035_87a820c3.png" 
          alt="" 
          className="absolute bottom-40 right-10 w-18 h-18 rounded-full animate-bounce opacity-70"
          style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}
        />
        
        {/* Sparkles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse">
            FINAL
          </h1>
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
            EXAM
          </h1>
        </div>

        {/* Principal Avatar */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/6829088702a251ce52390b4c_1768321680007_eefa5b93.jpg"
              alt="Principal Powers"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-1 rounded-full">
            <span className="text-xs font-bold text-white whitespace-nowrap">Principal Powers</span>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-cyan-300 font-semibold mb-8 animate-fade-in">
          Are You Ready to Prove Yourself?
        </p>

        {/* Loading bar or Start button */}
        {isLoading ? (
          <div className="w-64 mx-auto">
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 rounded-full"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-slate-400 mt-2 text-sm">Loading... {loadingProgress}%</p>
          </div>
        ) : (
          <button
            onClick={onComplete}
            className="group relative px-12 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full font-bold text-xl text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transform hover:scale-105 transition-all duration-300"
          >
            <span className="relative z-10">LET'S GO!</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 blur-md opacity-50 group-hover:opacity-80 transition-opacity"></div>
          </button>
        )}
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </div>
  );
};

export default SplashScreen;
