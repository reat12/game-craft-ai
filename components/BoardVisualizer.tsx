import React, { useState, useRef } from 'react';
import { GameDesign } from '../types';
import { editBoardImage, generateProBoardImage, generateVeoVideo, checkPaidApiKey, requestPaidApiKey } from '../services/geminiService';
import { Wand2, ImagePlus, Clapperboard, Loader2, Star, Upload } from 'lucide-react';

interface BoardVisualizerProps {
  design: GameDesign;
  imageUrl: string | null;
  loadingImage: boolean;
  onUpdateImage: (newUrl: string) => void;
}

const BoardVisualizer: React.FC<BoardVisualizerProps> = ({ design, imageUrl, loadingImage, onUpdateImage }) => {
  // Local states for tools
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [proSize, setProSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isProLoading, setIsProLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = async () => {
    if (!imageUrl || !editPrompt.trim()) return;
    setIsEditing(true);
    try {
      const newImage = await editBoardImage(imageUrl, editPrompt);
      if (newImage) {
        onUpdateImage(newImage);
        setEditPrompt('');
      }
    } catch (error) {
      alert("Failed to edit image. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleProGen = async () => {
    if (!(await checkPaidApiKey())) {
       await requestPaidApiKey();
       return;
    }

    setIsProLoading(true);
    try {
      const newImage = await generateProBoardImage(design.boardDesign, design.title, proSize);
      if (newImage) onUpdateImage(newImage);
    } catch (error) {
      alert("Failed to generate high-quality image.");
    } finally {
      setIsProLoading(false);
    }
  };

  const handleVeo = async (base64Data: string) => {
    if (!(await checkPaidApiKey())) {
       await requestPaidApiKey();
       return;
    }

    setIsVideoLoading(true);
    setVideoUrl(null);
    try {
      const vidUrl = await generateVeoVideo(base64Data);
      setVideoUrl(vidUrl);
    } catch (error) {
      alert("Failed to generate video.");
    } finally {
      setIsVideoLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
           handleVeo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center justify-between">
        <div className="flex items-center"><span className="mr-2">🗺️</span> Game Board</div>
      </h3>
      
      {/* Main Image Display */}
      <div className="aspect-square w-full bg-slate-50 rounded-xl overflow-hidden border-2 border-slate-100 relative mb-6 group">
        {loadingImage || isEditing || isProLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50 z-10">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm font-medium animate-pulse">
              {isEditing ? "Refining with Nano Banana..." : isProLoading ? "Generating Pro Quality..." : "Painting the board..."}
            </p>
          </div>
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Board Game Board" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-slate-400 mb-2">Visual generation unavailable</p>
            <div className="grid grid-cols-4 gap-2 opacity-20 w-full max-w-xs">
                {[...Array(16)].map((_, i) => (
                    <div key={i} className={`aspect-square rounded ${i % 2 === 0 ? 'bg-indigo-400' : 'bg-slate-400'}`}></div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Tools Section */}
      <div className="space-y-4 mb-6">
        
        {/* Edit Image */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Edit Board (Gemini 2.5 Flash)</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g. Add a volcano in the center..."
                    className="flex-grow px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-200 outline-none"
                    disabled={!imageUrl || loadingImage}
                />
                <button 
                    onClick={handleEdit}
                    disabled={!imageUrl || !editPrompt || isEditing || loadingImage}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Edit with AI"
                >
                    <Wand2 size={18} />
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Pro Gen */}
             <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" /> Pro Generation
                </label>
                <div className="flex gap-2">
                    <select 
                        value={proSize} 
                        onChange={(e) => setProSize(e.target.value as any)}
                        className="px-2 py-2 text-sm rounded-lg border border-slate-300 bg-white outline-none"
                    >
                        <option value="1K">1K</option>
                        <option value="2K">2K</option>
                        <option value="4K">4K</option>
                    </select>
                    <button 
                        onClick={handleProGen}
                        disabled={isProLoading}
                        className="flex-grow bg-slate-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-900 transition-colors disabled:opacity-50"
                    >
                       Regenerate
                    </button>
                </div>
             </div>

             {/* Veo Video */}
             <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
                 <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Clapperboard size={12} className="text-pink-500" /> Veo Animation
                </label>
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload} 
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isVideoLoading}
                        className="bg-white text-slate-700 border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-100 text-sm flex items-center justify-center gap-2 flex-1"
                        title="Upload Photo to Animate"
                    >
                       <Upload size={16} /> 
                    </button>
                    <button 
                        onClick={() => imageUrl && handleVeo(imageUrl)}
                        disabled={!imageUrl || isVideoLoading}
                        className="bg-pink-600 text-white px-3 py-2 rounded-lg hover:bg-pink-700 text-sm flex-1 disabled:opacity-50"
                    >
                       {isVideoLoading ? <Loader2 size={16} className="animate-spin mx-auto"/> : "Animate"}
                    </button>
                </div>
             </div>
        </div>
      </div>
      
      {/* Video Result */}
      {videoUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border-4 border-pink-200 shadow-lg bg-black">
              <video controls autoPlay loop className="w-full">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
              </video>
              <div className="bg-pink-50 p-2 text-center text-pink-800 text-xs font-bold uppercase tracking-wider">
                  Generated with Veo 3.1
              </div>
          </div>
      )}

      {/* Description */}
      <div className="space-y-4 mt-6">
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <h4 className="font-bold text-indigo-900 mb-2 text-sm uppercase tracking-wide">Visual Description</h4>
            <p className="text-slate-700 text-sm leading-relaxed">{design.boardDesign}</p>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Board Spaces (Tiles)</h4>
          <div className="grid grid-cols-1 gap-2">
            {design.tileTypes.map((tile, idx) => (
              <div key={idx} className="flex items-center p-2 rounded-lg bg-white border border-slate-100 shadow-sm">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0 mr-3"
                  style={{ backgroundColor: tile.color }}
                />
                <div>
                  <span className="block font-bold text-slate-800 text-sm">{tile.name}</span>
                  <span className="block text-xs text-slate-500">{tile.effect}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardVisualizer;
