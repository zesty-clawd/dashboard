import React, { useState, useEffect } from 'react';
import { Trophy, Image as ImageIcon, Gift, Star } from 'lucide-react';
import dataService from '../utils/dataService';

const CollectionBookCard = () => {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSticker, setSelectedSticker] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dataService.fetchStickers();
        setStickers(data);
      } catch (err) {
        console.error('Error fetching stickers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const rarityColors = {
    common: 'border-slate-600',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-orange-500'
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-400" size={20} />
          <h2 className="text-xl font-semibold">Collection Book</h2>
        </div>
        <span className="text-xs text-slate-500">
          {stickers.length} stickers collected
        </span>
      </div>

      {loading ? (
        <div className="animate-pulse grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-slate-900 rounded-xl" />
          ))}
        </div>
      ) : stickers.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Gift className="mx-auto mb-2" size={32} />
          <p className="text-sm">No stickers collected yet</p>
          <p className="text-xs mt-1">Complete quests to earn rewards!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {stickers.map((sticker) => (
              <div
                key={sticker.id}
                onClick={() => setSelectedSticker(sticker)}
                className={`aspect-square bg-slate-900 rounded-xl border-2 
                  ${rarityColors.common} 
                  hover:border-orange-500 cursor-pointer 
                  transition-all hover:scale-105 overflow-hidden relative group`}
              >
                <img
                  src={sticker.url || `/stickers/${sticker.filename}`}
                  alt={sticker.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center">
                        <ImageIcon class="text-slate-600" size={24} />
                      </div>
                    `;
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-white text-center px-1">
                    {sticker.name}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Locked slots for future stickers */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={`locked-${i}`}
                className="aspect-square bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-700 
                  flex items-center justify-center text-slate-600"
              >
                <span className="text-xs">?</span>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-2 text-sm text-slate-400 hover:text-white 
            hover:bg-slate-700 rounded-lg transition-all flex items-center justify-center gap-2">
            <Trophy size={14} />
            View full collection
          </button>
        </>
      )}

      {/* Sticker detail modal */}
      {selectedSticker && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSticker(null)}
        >
          <div 
            className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedSticker.name}</h3>
              <button 
                onClick={() => setSelectedSticker(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 mb-4">
              <img
                src={selectedSticker.url || `/stickers/${selectedSticker.filename}`}
                alt={selectedSticker.name}
                className="w-full h-auto max-h-64 object-contain mx-auto"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Star size={16} className="text-yellow-400" />
              <span>Rare Collectible</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionBookCard;