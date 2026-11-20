import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function Soundscape() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.25);
  const [showVolume, setShowVolume] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const waveGainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Initialize Web Audio procedural ocean wave surf
  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Pink Noise Buffer for Realistic Ocean Waves
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Dynamic Lowpass Filter (simulates wave swelling and receding)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(0.3, ctx.currentTime);
      waveGainRef.current = waveGain;

      whiteNoise.connect(filter);
      filter.connect(waveGain);
      waveGain.connect(masterGain);
      whiteNoise.start();

      // Gentle Oceanic LFO modulation (waves rolling in every ~7 seconds)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.14, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(260, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      // Warm Subtle Harmonic Drone (Ethereal Sanctuary Tone: 110Hz A2)
      const droneOsc = ctx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(110, ctx.currentTime);
      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.04, ctx.currentTime);
      droneOsc.connect(droneGain);
      droneGain.connect(masterGain);
      droneOsc.start();

      setIsPlaying(true);
    } catch (err) {
      console.warn('Soundscape audio init deferred:', err);
    }
  };

  const stopAudio = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVolume, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="relative inline-flex items-center">
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-palacio-bronze/40 hover:bg-white/[0.08] transition-all cursor-pointer group"
        onClick={toggleSound}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
        title={isPlaying ? 'Mute Sanctuary Soundscape' : 'Play Ocean Surf & Sanctuary Breeze'}
      >
        <button
          type="button"
          className="text-palacio-bronze/80 group-hover:text-palacio-bronze transition-colors flex items-center gap-1.5"
          aria-label={isPlaying ? 'Mute Audio' : 'Play Audio'}
        >
          {isPlaying ? (
            <Volume2 size={14} className="text-palacio-bronze animate-pulse" />
          ) : (
            <VolumeX size={14} className="text-palacio-alabaster/50 group-hover:text-palacio-alabaster" />
          )}
        </button>

        <span className="hidden sm:inline text-[10px] font-cinzel tracking-[0.18em] uppercase text-palacio-alabaster/70 group-hover:text-palacio-alabaster transition-colors select-none">
          {isPlaying ? 'Ocean Surf' : 'Soundscape'}
        </span>

        {/* Animated Soundwave Equalizer Bars */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-3 ml-0.5">
            <span className="w-0.5 bg-palacio-bronze rounded-full animate-[bounce_1.2s_infinite_100ms] h-2" />
            <span className="w-0.5 bg-palacio-bronze rounded-full animate-[bounce_1.2s_infinite_300ms] h-3" />
            <span className="w-0.5 bg-palacio-bronze rounded-full animate-[bounce_1.2s_infinite_200ms] h-1.5" />
          </div>
        )}

        {/* Volume popover on hover */}
        {showVolume && isPlaying && (
          <div 
            className="absolute top-full left-0 mt-2 p-2.5 rounded-xl bg-[#0d0d0d] border border-palacio-bronze/30 shadow-2xl flex items-center gap-2 z-50 w-36"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[9px] font-cinzel text-palacio-alabaster/60 uppercase">Vol</span>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-palacio-bronze h-1 bg-white/10 rounded cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
}
