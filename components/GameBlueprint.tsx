import React, { useState } from 'react';
import { GameDesign } from '../types';
import BoardVisualizer from './BoardVisualizer';
import CardPreview from './CardPreview';
import GameSimulation from './GameSimulation';
import { Printer, Trophy, BookOpen, Target, ScrollText, Users, Globe, PlayCircle } from 'lucide-react';

interface GameBlueprintProps {
  design: GameDesign;
  imageUrl: string | null;
  loadingImage: boolean;
  onReset: () => void;
  onUpdateImage: (newUrl: string) => void;
}

const GameBlueprint: React.FC<GameBlueprintProps> = ({ design, imageUrl, loadingImage, onReset, onUpdateImage }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* Simulation Modal */}
      {isPlaying && (
        <GameSimulation 
          design={design} 
          imageUrl={imageUrl} 
          onClose={() => setIsPlaying(false)} 
        />
      )}

      {/* Top Navigation / Controls - No Print */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center no-print">
        <button onClick={onReset} className="text-slate-500 hover:text-slate-800 font-semibold text-sm">
          ← Create New Game
        </button>
        <div className="flex gap-2">
           <button 
            onClick={() => setIsPlaying(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <PlayCircle size={18} />
            <span className="font-bold">Play Demo</span>
          </button>
           <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-full hover:bg-slate-700 transition-colors shadow-lg"
          >
            <Printer size={16} />
            <span>Print Design</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 print:p-0 print:max-w-none">
        
        {/* Header Section */}
        <header className="text-center mb-12 border-b-4 border-indigo-100 pb-8 print:border-none">
          <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            Official Game Blueprint
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 font-fredoka">{design.title}</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">{design.overview}</p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-1"><Users size={16} /> Ages 8-14</span>
            <span className="flex items-center gap-1">⏱️ 30-45 Mins</span>
            <span className="flex items-center gap-1">🎲 2-4 Players</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
          
          {/* Left Column: Narrative & Rules */}
          <div className="lg:col-span-2 space-y-8 print:break-after-page">
            
            {/* Story & Goal */}
            <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-indigo-50 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="grid md:grid-cols-2 gap-8 relative z-10">
                 <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800 mb-3">
                      <BookOpen className="text-indigo-500" size={20}/> The Story
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{design.story}</p>
                 </div>
                 <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800 mb-3">
                      <Target className="text-red-500" size={20}/> Champion's Goal
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{design.goal}</p>
                 </div>
               </div>
            </section>

            {/* Gameplay Rules */}
            <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
               <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800 mb-6">
                 <ScrollText className="text-teal-500" size={20}/> Rules & Regulations
               </h3>
               
               <div className="space-y-6">
                 <div>
                   <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-wider">How to Win</h4>
                   <div className="bg-teal-50 text-teal-900 p-4 rounded-xl border border-teal-100 flex items-start gap-3">
                      <Trophy className="shrink-0 mt-1" size={18} />
                      <p>{design.winningCondition}</p>
                   </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-slate-700 mb-3 uppercase text-xs tracking-wider">Setup & Rules</h4>
                      <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-indigo-400">
                        {design.rules.map((rule, i) => (
                          <li key={i}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 mb-3 uppercase text-xs tracking-wider">Turn Sequence</h4>
                      <ol className="list-decimal pl-5 space-y-2 text-slate-600 marker:font-bold marker:text-indigo-600">
                        {design.gameplay.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                 </div>
               </div>
            </section>

             {/* Components List */}
             <section className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 print:break-inside-avoid">
                <h3 className="text-lg font-bold text-slate-800 mb-4">📦 What's in the Box?</h3>
                <ul className="flex flex-wrap gap-2">
                  {design.components.map((comp, i) => (
                    <li key={i} className="bg-white px-3 py-1 rounded-md shadow-sm border border-slate-200 text-slate-600 text-sm">
                      {comp}
                    </li>
                  ))}
                </ul>
            </section>

            {/* Google Search Sources (Grounding) */}
            {design.sources && design.sources.length > 0 && (
              <section className="bg-blue-50 p-6 rounded-3xl border border-blue-100 print:break-inside-avoid">
                 <h3 className="flex items-center gap-2 text-lg font-bold text-blue-800 mb-4">
                   <Globe size={18} /> Verified Sources
                 </h3>
                 <div className="flex flex-wrap gap-3">
                    {design.sources.map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs bg-white text-blue-600 px-3 py-2 rounded-lg border border-blue-200 hover:underline truncate max-w-xs block shadow-sm"
                      >
                        {source.title}
                      </a>
                    ))}
                 </div>
              </section>
            )}
          </div>

          {/* Right Column: Visual Assets */}
          <div className="space-y-8">
             {/* Board Visual */}
             <div className="print:break-inside-avoid">
               <BoardVisualizer 
                  design={design} 
                  imageUrl={imageUrl} 
                  loadingImage={loadingImage} 
                  onUpdateImage={onUpdateImage}
               />
             </div>

             {/* Cards */}
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:break-inside-avoid">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span>🃏</span> Game Cards
                </h3>
                <div className="space-y-2">
                  {design.cardTypes.map((card, i) => (
                    <CardPreview key={i} cardType={card} index={i} />
                  ))}
                </div>
             </div>

             {/* Reward & Outcomes */}
             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl shadow-lg text-white print:break-inside-avoid">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <SparklesIcon /> Ultimate Reward
                </h3>
                <p className="mb-6 opacity-90">{design.reward}</p>
                
                <div className="border-t border-white/20 pt-4">
                   <h4 className="font-bold text-sm uppercase tracking-wider mb-2 opacity-75">Learning Outcomes</h4>
                   <ul className="space-y-1 text-sm opacity-90">
                     {design.learningOutcomes.map((outcome, i) => (
                       <li key={i} className="flex items-start gap-2">
                         <span className="mt-1">•</span> {outcome}
                       </li>
                     ))}
                   </ul>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
)

export default GameBlueprint;
