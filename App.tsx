import React, { useState } from 'react';
import InputForm from './components/InputForm';
import GameBlueprint from './components/GameBlueprint';
import { generateGameConcept, generateBoardImage } from './services/geminiService';
import { GameDesign } from './types';

const App: React.FC = () => {
  const [gameDesign, setGameDesign] = useState<GameDesign | null>(null);
  const [loading, setLoading] = useState(false);
  const [boardImageUrl, setBoardImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const handleGenerate = async (problem: string) => {
    setLoading(true);
    setGameDesign(null);
    setBoardImageUrl(null);

    try {
      // 1. Generate Text Content
      const design = await generateGameConcept(problem);
      setGameDesign(design);
      setLoading(false);

      // 2. Trigger Image Generation (Parallel/Async after text is ready)
      if (design.boardDesign) {
        setLoadingImage(true);
        // We do not await this to allow UI to render the text first
        generateBoardImage(design.boardDesign, design.title)
          .then(url => {
            setBoardImageUrl(url);
            setLoadingImage(false);
          })
          .catch(err => {
            console.error("Image gen failed silently", err);
            setLoadingImage(false);
          });
      }
    } catch (error) {
      console.error("Failed to generate game", error);
      alert("Oops! Our game designers dropped the dice. Please try again.");
      setLoading(false);
      setLoadingImage(false);
    }
  };

  const handleReset = () => {
    setGameDesign(null);
    setBoardImageUrl(null);
  };

  const handleUpdateImage = (newUrl: string) => {
    setBoardImageUrl(newUrl);
  };

  return (
    <div className="min-h-screen">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {!gameDesign ? (
        <InputForm onGenerate={handleGenerate} isLoading={loading} />
      ) : (
        <GameBlueprint 
          design={gameDesign} 
          imageUrl={boardImageUrl} 
          loadingImage={loadingImage}
          onReset={handleReset} 
          onUpdateImage={handleUpdateImage}
        />
      )}
    </div>
  );
};

export default App;
