import React, { useState, useEffect, useMemo } from 'react';
import { GameDesign, TileType } from '../types';
import { Dice5, X, Trophy, RefreshCw, ScrollText, AlertCircle, Volume2, VolumeX } from 'lucide-react';

interface GameSimulationProps {
  design: GameDesign;
  imageUrl: string | null;
  onClose: () => void;
}

interface GameState {
  playerPosition: number;
  log: string[];
  turn: number;
  isGameOver: boolean;
  currentEffect: string | null;
  drawnCard: { type: string, content: string } | null;
}

const TOTAL_SPACES = 24;

// --- Audio Utility ---
const playSfx = (type: 'roll' | 'move' | 'card' | 'win' | 'tile') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const now = ctx.currentTime;
    const createOsc = (type: OscillatorType, freq: number, startTime: number, duration: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
      return { osc, gain };
    };

    switch (type) {
      case 'roll':
        // Rattle sound
        createOsc('square', 150, now, 0.1, 0.1);
        createOsc('square', 120, now + 0.08, 0.1, 0.1);
        createOsc('square', 100, now + 0.16, 0.2, 0.08);
        break;

      case 'move':
        // "Bloop" / Step sound
        const moveOsc = ctx.createOscillator();
        const moveGain = ctx.createGain();
        moveOsc.connect(moveGain);
        moveGain.connect(ctx.destination);
        moveOsc.type = 'sine';
        moveOsc.frequency.setValueAtTime(600, now);
        moveOsc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        moveGain.gain.setValueAtTime(0.15, now);
        moveGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        moveOsc.start(now);
        moveOsc.stop(now + 0.15);
        break;

      case 'card':
        // Paper swish (approximated with triangle sweep)
        const cardOsc = ctx.createOscillator();
        const cardGain = ctx.createGain();
        cardOsc.connect(cardGain);
        cardGain.connect(ctx.destination);
        cardOsc.type = 'triangle';
        cardOsc.frequency.setValueAtTime(800, now);
        cardOsc.frequency.linearRampToValueAtTime(1200, now + 0.1);
        cardGain.gain.setValueAtTime(0.05, now);
        cardGain.gain.linearRampToValueAtTime(0, now + 0.1);
        cardOsc.start(now);
        cardOsc.stop(now + 0.1);
        break;
        
      case 'tile':
        // Chime
        createOsc('sine', 880, now, 0.8, 0.1); // A5
        break;

      case 'win':
        // Fanfare Arpeggio
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
           createOsc('triangle', freq, now + i * 0.1, 0.6, 0.1);
        });
        break;
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

const GameSimulation: React.FC<GameSimulationProps> = ({ design, imageUrl, onClose }) => {
  const [gameState, setGameState] = useState<GameState>({
    playerPosition: 0,
    log: ["Welcome to the Playtest! Roll the dice to begin."],
    turn: 1,
    isGameOver: false,
    currentEffect: null,
    drawnCard: null
  });

  const [isRolling, setIsRolling] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Generate a deterministic path of spaces (Snake pattern)
  const spaces = useMemo(() => {
    const path = [];
    const rows = 4;
    const cols = 6;
    for (let i = 0; i < TOTAL_SPACES; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      // Zig-zag pattern
      const actualCol = row % 2 === 0 ? col : cols - 1 - col;
      
      path.push({
        x: (actualCol / (cols - 1)) * 80 + 10, // 10% to 90%
        y: 90 - (row / (rows - 1)) * 80,       // 90% to 10%
        type: i === 0 ? 'START' : i === TOTAL_SPACES - 1 ? 'FINISH' : 'NORMAL',
        // Assign random tile type from design
        tileDetails: i === 0 || i === TOTAL_SPACES - 1 
          ? null 
          : design.tileTypes[i % design.tileTypes.length]
      });
    }
    return path;
  }, [design.tileTypes]);

  const addToLog = (message: string) => {
    setGameState(prev => ({
      ...prev,
      log: [message, ...prev.log]
    }));
  };

  const drawCard = () => {
    if (design.cardTypes.length === 0) return;
    if (soundEnabled) playSfx('card');

    const randomCardType = design.cardTypes[Math.floor(Math.random() * design.cardTypes.length)];
    const randomExample = randomCardType.examples[Math.floor(Math.random() * randomCardType.examples.length)];
    
    setGameState(prev => ({
      ...prev,
      drawnCard: { type: randomCardType.type, content: randomExample }
    }));
    addToLog(`🎴 Drew a ${randomCardType.type}: "${randomExample}"`);
  };

  const handleRoll = async () => {
    if (gameState.isGameOver || isRolling) return;
    
    setIsRolling(true);
    if (soundEnabled) playSfx('roll');
    
    setGameState(prev => ({ ...prev, currentEffect: null, drawnCard: null }));

    // Animation delay
    await new Promise(r => setTimeout(r, 600));
    
    const roll = Math.floor(Math.random() * 6) + 1;
    let newPosition = gameState.playerPosition + roll;
    
    if (newPosition >= TOTAL_SPACES - 1) {
      newPosition = TOTAL_SPACES - 1;
      setGameState(prev => ({ ...prev, isGameOver: true }));
      if (soundEnabled) playSfx('win');
      addToLog(`🎲 Rolled a ${roll}. Reached the Finish!`);
      addToLog(`🏆 ${design.winningCondition}`);
    } else {
      if (soundEnabled) playSfx('move');
      addToLog(`🎲 Rolled a ${roll}. Moved to space ${newPosition + 1}.`);
    }

    setGameState(prev => ({
      ...prev,
      playerPosition: newPosition,
      turn: prev.turn + 1
    }));
    setIsRolling(false);

    // Trigger Tile Effect
    if (newPosition < TOTAL_SPACES - 1 && newPosition > 0) {
      const tile = spaces[newPosition].tileDetails;
      if (tile) {
        setGameState(prev => ({ ...prev, currentEffect: tile.effect }));
        if (soundEnabled) playSfx('tile');
        addToLog(`📍 Landed on ${tile.name}: ${tile.effect}`);
        
        // Random chance to draw a card if effect sounds like it, or just 30% chance for fun
        if (Math.random() < 0.3 || tile.effect.toLowerCase().includes('card')) {
          setTimeout(drawCard, 500);
        }
      }
    }
  };

  const resetGame = () => {
    setGameState({
      playerPosition: 0,
      log: ["Game reset. Ready to start!"],
      turn: 1,
      isGameOver: false,
      currentEffect: null,
      drawnCard: null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-700">
        
        {/* Left Panel: Board View */}
        <div className="flex-grow relative bg-slate-100 flex items-center justify-center p-4 md:p-8 overflow-hidden">
          
          {/* Header Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-slate-200 flex items-center gap-2">
             <span className="font-bold text-slate-700">{design.title}</span>
             <span className="text-xs uppercase tracking-wider text-slate-500 border-l border-slate-300 pl-2">Playtest Demo</span>
          </div>

          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-white/90 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
              title={soundEnabled ? "Mute Sound" : "Enable Sound"}
            >
              {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
            <button 
              onClick={onClose}
              className="bg-white/90 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Board Container */}
          <div className="relative aspect-square w-full max-w-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden border-8 border-slate-800">
            {/* Background Image */}
            {imageUrl ? (
              <img src={imageUrl} alt="Board" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            ) : (
              <div className="absolute inset-0 bg-indigo-50 flex items-center justify-center text-slate-300 font-bold text-4xl select-none">
                BOARD MAP
              </div>
            )}

            {/* Path Visualization (SVG Overlay) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
               <defs>
                 <filter id="glow">
                   <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                   <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                 </filter>
               </defs>
               {/* Draw connections */}
               <path 
                 d={`M ${spaces.map(s => `${s.x} ${s.y}`).join(' L ')}`}
                 fill="none"
                 stroke="white"
                 strokeWidth="3"
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 strokeDasharray="8 8"
                 className="opacity-60"
               />
            </svg>

            {/* Spaces */}
            {spaces.map((space, idx) => (
              <div 
                key={idx}
                className={`absolute w-8 h-8 md:w-12 md:h-12 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border-2 shadow-md transition-transform
                  ${idx === gameState.playerPosition ? 'scale-125 z-20 border-slate-900' : 'scale-100 z-10 border-white'}
                `}
                style={{ 
                  left: `${space.x}%`, 
                  top: `${space.y}%`,
                  backgroundColor: space.tileDetails?.color || (idx === 0 ? '#10b981' : idx === TOTAL_SPACES-1 ? '#f59e0b' : '#cbd5e1')
                }}
              >
                {idx === 0 && <span className="text-[10px] font-bold text-white">GO</span>}
                {idx === TOTAL_SPACES - 1 && <Trophy size={16} className="text-white" />}
                
                {/* Player Token */}
                {idx === gameState.playerPosition && (
                   <div className="absolute inset-0 bg-indigo-600 rounded-full animate-ping opacity-20"></div>
                )}
                {idx === gameState.playerPosition && (
                   <div className="w-full h-full bg-indigo-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">
                     P1
                   </div>
                )}
              </div>
            ))}
          </div>

          {/* Current Tile Indicator (Floating) */}
          {!gameState.isGameOver && spaces[gameState.playerPosition].tileDetails && (
             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-6 py-3 rounded-2xl shadow-xl border border-slate-200 text-center max-w-md animate-in slide-in-from-bottom-4">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Current Space</div>
                <div className="text-lg font-bold text-slate-800" style={{ color: spaces[gameState.playerPosition].tileDetails?.color }}>
                  {spaces[gameState.playerPosition].tileDetails?.name}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  {spaces[gameState.playerPosition].tileDetails?.effect}
                </div>
             </div>
          )}
        </div>

        {/* Right Panel: Controls & Log */}
        <div className="w-full md:w-96 bg-white border-l border-slate-200 flex flex-col z-20">
          
          {/* Active Card Display */}
          <div className="flex-shrink-0 p-6 bg-slate-50 border-b border-slate-200 min-h-[200px] flex flex-col justify-center items-center text-center">
            {gameState.isGameOver ? (
              <div className="animate-in zoom-in duration-300">
                <Trophy size={48} className="text-yellow-500 mx-auto mb-3" />
                <h3 className="text-2xl font-black text-slate-800">You Won!</h3>
                <p className="text-slate-600 mt-2 text-sm">{design.reward}</p>
                <button onClick={resetGame} className="mt-4 text-indigo-600 font-bold text-sm hover:underline flex items-center justify-center gap-1">
                  <RefreshCw size={14} /> Play Again
                </button>
              </div>
            ) : gameState.drawnCard ? (
              <div className="w-full bg-white border-2 border-indigo-100 p-4 rounded-xl shadow-sm relative overflow-hidden animate-in flip-in-x duration-500">
                <div className="absolute top-0 right-0 p-1 bg-indigo-100 rounded-bl-lg">
                  <ScrollText size={14} className="text-indigo-600" />
                </div>
                <h4 className="font-bold text-indigo-900 mb-2 text-sm uppercase">{gameState.drawnCard.type}</h4>
                <p className="text-slate-700 italic font-serif leading-relaxed">"{gameState.drawnCard.content}"</p>
              </div>
            ) : (
               <div className="text-slate-400 flex flex-col items-center">
                 <div className="w-16 h-24 border-2 border-dashed border-slate-300 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-2xl opacity-20">?</span>
                 </div>
                 <span className="text-xs font-semibold">No active card</span>
               </div>
            )}
          </div>

          {/* Game Log */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-white">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white pb-2 border-b border-slate-100">Game Log</h4>
            {gameState.log.map((entry, i) => (
              <div key={i} className="text-sm text-slate-600 border-l-2 border-slate-100 pl-3 py-1 animate-in slide-in-from-left-2 duration-300">
                {i === 0 ? <span className="font-bold text-slate-800">{entry}</span> : entry}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
             <button
               onClick={handleRoll}
               disabled={isRolling || gameState.isGameOver}
               className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-indigo-200 font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95"
             >
               {isRolling ? (
                 <Loader2 className="animate-spin" />
               ) : (
                 <>
                   <Dice5 size={24} /> Roll Dice
                 </>
               )}
             </button>
             <p className="text-center text-xs text-slate-400 mt-3">Turn {gameState.turn} • Click to advance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default GameSimulation;
