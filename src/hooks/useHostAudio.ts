import { useState, useRef, useCallback, useEffect } from 'react';

type MessageType = 'welcome' | 'round1Intro' | 'round2Intro' | 'round3Intro' | 'round4Intro' | 'correct' | 'incorrect' | 'timeUp' | 'victory' | 'defeat';

const typeToFilePrefix: Record<MessageType, string> = {
  welcome: 'welcome',
  round1Intro: 'round1-intro',
  round2Intro: 'round2-intro',
  round3Intro: 'round3-intro',
  round4Intro: 'round4-intro',
  correct: 'correct',
  incorrect: 'incorrect',
  timeUp: 'timeup',
  victory: 'victory',
  defeat: 'defeat',
};

export function useHostAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('finalexam_audio_muted') === 'true';
    } catch {
      return false;
    }
  });

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  const play = useCallback((messageType: MessageType, quoteIndex: number) => {
    if (isMuted) return;
    stop();

    const prefix = typeToFilePrefix[messageType];
    if (!prefix) return;

    const fileName = `${prefix}-${quoteIndex + 1}.mp3`;
    const audio = new Audio(`/audio/host/${fileName}`);
    audioRef.current = audio;
    audio.play().catch(() => {
      // Silently fail if audio isn't available
    });
  }, [isMuted, stop]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem('finalexam_audio_muted', String(next));
      } catch {}
      if (next) stop();
      return next;
    });
  }, [stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { play, stop, isMuted, toggleMute };
}
