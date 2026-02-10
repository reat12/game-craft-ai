import React from 'react';
import { CardType } from '../types';

interface CardPreviewProps {
  cardType: CardType;
  index: number;
}

const CardPreview: React.FC<CardPreviewProps> = ({ cardType, index }) => {
  // Generate deterministic colors based on index for variety
  const colors = [
    { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
    { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-800' },
    { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
    { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
  ];
  const theme = colors[index % colors.length];

  return (
    <div className="break-inside-avoid mb-6">
      <h4 className={`font-bold text-lg mb-2 ${theme.text}`}>{cardType.type}</h4>
      <p className="text-slate-600 text-sm mb-4 italic">{cardType.description}</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cardType.examples.map((example, i) => (
          <div 
            key={i}
            className={`aspect-[2.5/3.5] relative rounded-xl border-4 ${theme.border} ${theme.bg} p-4 shadow-md flex flex-col justify-between transform transition hover:-translate-y-1 hover:shadow-lg`}
          >
            <div className={`w-full h-1/2 bg-white/50 rounded-lg mb-2 flex items-center justify-center`}>
              {/* Abstract Icon placeholder */}
              <div className={`w-12 h-12 rounded-full ${theme.border} border-2 opacity-20`} />
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex-grow">
              <p className="text-sm font-medium text-slate-800 leading-snug">{example}</p>
            </div>
            <div className="mt-2 text-center">
              <span className={`text-xs font-bold uppercase tracking-widest opacity-50 ${theme.text}`}>
                {cardType.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardPreview;
