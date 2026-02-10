import React, { useState } from 'react';
import { Dice5, Sparkles } from 'lucide-react';

interface InputFormProps {
  onGenerate: (problem: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [problem, setProblem] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problem.trim()) {
      onGenerate(problem);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center transition-all duration-500">
      <div className="mb-8 p-4 bg-white rounded-full shadow-xl border-4 border-indigo-100 inline-block animate-bounce">
        <Dice5 size={64} className="text-indigo-600" />
      </div>
      
      <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-6 tracking-tight">
        GameCraft <span className="text-indigo-600">AI</span>
      </h1>
      
      <p className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
        Turn any challenge into an adventure! Enter a topic or problem (like "Ocean Pollution", "Learning Fractions", or "Kindness"), 
        and we'll build a complete educational board game for you.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-lg relative">
        <input
          type="text"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="What problem do you want to solve?"
          disabled={isLoading}
          className="w-full px-8 py-5 text-lg rounded-full border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none shadow-lg transition-all pr-16"
        />
        <button
          type="submit"
          disabled={isLoading || !problem.trim()}
          className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles size={24} />
          )}
        </button>
      </form>

      {isLoading && (
        <div className="mt-8 text-indigo-600 font-semibold animate-pulse">
          Rolling the dice... Drafting rules... Painting the board...
        </div>
      )}
      
      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <span className="text-sm text-slate-400 font-bold uppercase tracking-wider mr-2 self-center">Try:</span>
        {['Climate Change', 'Basic Geometry', 'Healthy Eating', 'Cybersecurity'].map((tag) => (
          <button
            key={tag}
            onClick={() => setProblem(tag)}
            className="px-4 py-2 bg-white rounded-full text-slate-600 text-sm shadow-sm hover:shadow-md hover:text-indigo-600 transition-all border border-slate-200"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InputForm;
