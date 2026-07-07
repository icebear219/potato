import React, { useState } from 'react';
import { Check, Star, ChevronRight, HelpCircle } from 'lucide-react';
import { CapturedPhoto } from '../types';
import { playCutePop } from '../utils/audio';

interface SelectionScreenProps {
  className: string;
  childrenNames: string;
  photos: CapturedPhoto[];
  onPhotosSelected: (selectedPhotos: CapturedPhoto[]) => void;
}

export default function SelectionScreen({
  className,
  childrenNames,
  photos,
  onPhotosSelected
}: SelectionScreenProps) {
  // Store the IDs of chosen photos in order of selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handlePhotoClick = (id: string) => {
    playCutePop();
    if (selectedIds.includes(id)) {
      // Deselect
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      // Select (max 4)
      if (selectedIds.length < 4) {
        setSelectedIds(prev => [...prev, id]);
      } else {
        // If already 4, swap out the first selected or alert?
        // Let's show a friendly message or automatically replace the first one!
        // Replacing the first chosen is a very smooth user experience, or we can just notify.
        // Let's notify with a sweet message at the bottom, but allow swapping:
        // Actually, let's do: remove the oldest and append the new one! It's super intuitive.
        setSelectedIds(prev => [...prev.slice(1), id]);
      }
    }
  };

  const handleNext = () => {
    if (selectedIds.length === 4) {
      playCutePop();
      // Map back to CapturedPhoto objects in the exact selection order!
      const selectedPhotos = selectedIds.map(id => photos.find(p => p.id === id)!);
      onPhotosSelected(selectedPhotos);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center justify-center min-h-[85vh]" id="selection-screen-container">
      
      {/* Banner Instruction */}
      <div className="w-full bg-white border-4 border-[#FDE68A] rounded-[32px] py-4 px-6 mb-6 text-center shadow-md relative overflow-hidden ring-8 ring-white">
        <div className="absolute top-[-10px] left-[-10px] text-[#FFD54F] opacity-40 text-5xl">🎈</div>
        <div className="absolute bottom-[-10px] right-[-10px] text-[#FF8A65] opacity-40 text-5xl">🧸</div>
        
        <span className="inline-block px-3 py-1 bg-[#E1F5FE] text-[#0288D1] font-bold text-xs rounded-full border border-[#81D4FA] mb-1.5">
          4단계: 사진 고르기
        </span>
        <h2 className="text-2xl md:text-3xl font-title text-[#FF8A65] flex items-center justify-center gap-2">
          ⭐ 가장 마음에 드는 사진 4장을 골라봐요! ⭐
        </h2>
        <p className="text-[#795548] font-bold text-sm md:text-base mt-1">
          사진을 누르면 선택돼요! 고른 순서대로 네컷 사진이 채워져요 📸
        </p>
      </div>

      {/* Grid of 5 Captured Photos */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full mb-8">
        {photos.map((photo, index) => {
          const selectedIndex = selectedIds.indexOf(photo.id);
          const isSelected = selectedIndex !== -1;

          return (
            <button
              id={`photo-select-${index}`}
              key={photo.id}
              type="button"
              onClick={() => handlePhotoClick(photo.id)}
              className={`group flex flex-col rounded-[24px] bg-white p-2.5 border-8 transition-all transform hover:scale-[1.03] active:scale-95 text-left relative focus:outline-none cursor-pointer ${
                isSelected
                  ? 'border-[#FFD54F] shadow-xl scale-[1.02] ring-8 ring-white'
                  : 'border-dashed border-[#D7CCC8] hover:border-[#FFD54F]/50 shadow-sm opacity-80'
              }`}
            >
              {/* Image box */}
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#FFFBEB] relative">
                <img
                  src={photo.url}
                  alt={`Taken photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Selection Badge with Order Number */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-10 h-10 bg-[#FFD54F] text-white rounded-full flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
                    {selectedIndex + 1}
                  </div>
                )}
                
                {/* Micro hover icon */}
                {!isSelected && (
                  <div className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-[#A1887F] opacity-0 group-hover:opacity-100 transition-opacity border border-[#D7CCC8]">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Card Title Label */}
              <div className="mt-2.5 text-center w-full">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isSelected ? 'bg-[#FFFDE7] text-[#5D4037] border border-[#FDE68A]' : 'bg-[#FFFBEB] text-[#A1887F]'
                }`}>
                  {index + 1}번째 사진
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Status Bar & Action Button */}
      <div className="w-full max-w-2xl bg-white border-4 border-[#FDE68A] rounded-[24px] p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 ring-8 ring-white">
        
        {/* Status */}
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#FFFDE7] flex items-center justify-center text-[#FFD54F] font-title text-2xl border-2 border-[#FFD54F] shadow-sm">
            {selectedIds.length}
          </div>
          <div>
            <p className="text-base font-bold text-[#5D4037]">
              네컷 사진 장수 채우기
            </p>
            <p className="text-xs text-[#795548] font-bold">
              {selectedIds.length === 4
                ? '🎉 4장을 모두 골랐어요! 다음으로 넘어가볼까요?'
                : `현재 ${selectedIds.length}장 골랐어요. 앞으로 ${4 - selectedIds.length}장 더 선택해주세요!`
              }
            </p>
          </div>
        </div>

        {/* Next Button */}
        <button
          id="go-to-edit"
          type="button"
          onClick={handleNext}
          disabled={selectedIds.length !== 4}
          className={`w-full md:w-auto md:px-8 py-3.5 font-black text-lg rounded-full border-4 shadow-md transition-all transform flex items-center justify-center gap-1.5 ${
            selectedIds.length === 4
              ? 'bg-[#F06292] hover:bg-[#E91E63] border-white text-white hover:-translate-y-0.5 active:translate-y-0 animate-pulse-slow cursor-pointer'
              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>🎨 예쁘게 꾸미러 가기</span>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Easy tip */}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-[#A1887F] font-bold bg-[#FFFDE7] py-1.5 px-4 rounded-full border border-[#FDE68A]">
        <HelpCircle size={14} className="text-[#FFB74D]" />
        <span>마음에 안 드는 사진이 선택되었다면, 그 사진을 다시 누르면 취소돼요!</span>
      </div>
    </div>
  );
}
