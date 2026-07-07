import React, { useState, useRef, useEffect } from 'react';
import { Palette, Heart, Type, Trash2, ArrowLeft, Check, Sparkles, RotateCw, RotateCcw, Plus, Minus, X } from 'lucide-react';
import { CapturedPhoto, FrameTemplate, ActiveSticker, StickerPreset } from '../types';
import { FRAME_TEMPLATES, STICKER_PRESETS } from '../data/presets';
import { playCutePop } from '../utils/audio';

interface EditScreenProps {
  className: string;
  childrenNames: string;
  selectedPhotos: CapturedPhoto[];
  onBackToSelection: () => void;
  onComplete: (selectedFrame: FrameTemplate, stickers: ActiveSticker[], customTexts: { banner: string; names: string; date: string }) => void;
}

type EditTab = 'FRAME' | 'STICKERS' | 'TEXT';

export default function EditScreen({
  className,
  childrenNames,
  selectedPhotos,
  onBackToSelection,
  onComplete
}: EditScreenProps) {
  const [activeTab, setActiveTab] = useState<EditTab>('FRAME');
  const [selectedFrame, setSelectedFrame] = useState<FrameTemplate>(FRAME_TEMPLATES[0]);
  
  // Custom texts
  const [bannerText, setBannerText] = useState<string>(FRAME_TEMPLATES[0].bannerText);
  const [namesText, setNamesText] = useState<string>(childrenNames);
  
  // Get current date formatted like "YYYY.MM.DD"
  const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };
  const [dateText, setDateText] = useState<string>(getFormattedDate());

  // Sticker state
  const [stickers, setStickers] = useState<ActiveSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [stickerCategory, setStickerCategory] = useState<'all' | 'animal' | 'sparkle' | 'cute' | 'food'>('all');

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const stripContainerRef = useRef<HTMLDivElement | null>(null);

  // Automatically update the default banner text when changing frame template,
  // unless user has already edited it.
  const prevFrameIdRef = useRef<string>(selectedFrame.id);
  useEffect(() => {
    if (prevFrameIdRef.current !== selectedFrame.id) {
      setBannerText(selectedFrame.bannerText);
      prevFrameIdRef.current = selectedFrame.id;
    }
  }, [selectedFrame]);

  // Click outside sticker to deselect
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      // If clicked outside the preview area, deselect the active sticker
      if (stripContainerRef.current && !stripContainerRef.current.contains(e.target as Node)) {
        setSelectedStickerId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Spawn a sticker in the center of the viewport/strip container
  const handleAddSticker = (emoji: string) => {
    playCutePop();
    const newSticker: ActiveSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      emoji,
      x: 50, // Center horizontally (percentage)
      y: 40, // Around top-middle vertically (percentage)
      scale: 1.2,
      rotation: 0
    };
    setStickers(prev => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  // Sticker modifications
  const handleScaleChange = (id: string, factor: number) => {
    playCutePop();
    setStickers(prev =>
      prev.map(st => (st.id === id ? { ...st, scale: Math.max(0.5, Math.min(3.0, st.scale + factor)) } : st))
    );
  };

  const handleRotationChange = (id: string, angle: number) => {
    playCutePop();
    setStickers(prev =>
      prev.map(st => (st.id === id ? { ...st, rotation: (st.rotation + angle) % 360 } : st))
    );
  };

  const handleDeleteSticker = (id: string) => {
    playCutePop();
    setStickers(prev => prev.filter(st => st.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  const handleClearAllStickers = () => {
    playCutePop();
    if (window.confirm('붙인 스티커를 모두 지울까요? 🧹')) {
      setStickers([]);
      setSelectedStickerId(null);
    }
  };

  // Drag and drop event handlers (unified for mouse & touch)
  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation(); // Prevent container selection
    setSelectedStickerId(id);
    setDraggingId(id);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const stickerEl = document.getElementById(`active-st-${id}`);
    if (stickerEl) {
      const rect = stickerEl.getBoundingClientRect();
      // Store where on the emoji they clicked
      dragStartOffset.current = {
        x: clientX - (rect.left + rect.width / 2),
        y: clientY - (rect.top + rect.height / 2)
      };
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingId || !stripContainerRef.current) return;

    // Prevent screen scroll on touch-move inside the dragging container
    if ('touches' in e) {
      if (e.cancelable) e.preventDefault();
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const containerRect = stripContainerRef.current.getBoundingClientRect();

    // Account for mouse offset on the sticker itself
    const relativeX = clientX - containerRect.left - dragStartOffset.current.x;
    const relativeY = clientY - containerRect.top - dragStartOffset.current.y;

    // Convert to percentage
    let xPercent = (relativeX / containerRect.width) * 100;
    let yPercent = (relativeY / containerRect.height) * 100;

    // Clamp values so stickers stay within the bounds of the strip
    xPercent = Math.max(0, Math.min(100, xPercent));
    yPercent = Math.max(0, Math.min(100, yPercent));

    setStickers(prev =>
      prev.map(st => (st.id === draggingId ? { ...st, x: xPercent, y: yPercent } : st))
    );
  };

  const handleStopDrag = () => {
    setDraggingId(null);
  };

  const handleComplete = () => {
    playCutePop();
    onComplete(selectedFrame, stickers, {
      banner: bannerText.trim() || selectedFrame.bannerText,
      names: namesText.trim(),
      date: dateText.trim() || getFormattedDate()
    });
  };

  // Filtered sticker list
  const filteredStickers = STICKER_PRESETS.filter(st => {
    if (stickerCategory === 'all') return true;
    return st.category === stickerCategory;
  });

  return (
    <div
      className="w-full max-w-6xl mx-auto px-4 py-4 flex flex-col items-center min-h-[85vh]"
      id="edit-screen-container"
      onMouseMove={handleDragMove}
      onTouchMove={handleDragMove}
      onMouseUp={handleStopDrag}
      onTouchEnd={handleStopDrag}
    >
      
      {/* Top action bar */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          id="back-to-selection"
          type="button"
          onClick={() => { playCutePop(); onBackToSelection(); }}
          className="flex items-center gap-1.5 py-2.5 px-5 bg-white hover:bg-[#FFFBEB] text-[#5D4037] font-bold rounded-2xl border-2 border-[#FDE68A] transition-all active:scale-95 text-sm md:text-base shadow-sm"
        >
          <ArrowLeft size={16} className="text-[#FF8A65] stroke-[3]" />
          사진 다시 고르기
        </button>

        <button
          id="complete-editing"
          type="button"
          onClick={handleComplete}
          className="flex items-center gap-2 py-3 px-8 bg-[#F06292] hover:bg-[#E91E63] text-white font-black text-xl rounded-full border-4 border-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 animate-pulse-slow cursor-pointer"
        >
          <Check size={20} className="stroke-[3]" />
          네컷 완성하기!
        </button>
      </div>

      {/* Main Designer Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left/Middle: Vertical Photostrip Preview Area (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-center mb-2.5">
            <span className="text-xs font-bold bg-[#FFFDE7] text-[#5D4037] border border-[#FDE68A] px-3.5 py-1.5 rounded-full animate-bounce inline-block shadow-sm">
              👉 스티커를 마우스나 손가락으로 드래그해 옮겨요!
            </span>
          </div>

          {/* Vertical Four-Cut Wrapper */}
          <div className="bg-white p-6 rounded-[32px] border-8 border-[#FFD54F] max-w-sm w-full flex justify-center shadow-xl ring-8 ring-white">
            <div
              id="four-cut-strip-preview"
              ref={stripContainerRef}
              className={`w-[290px] ${selectedFrame.bgColor} border-8 ${selectedFrame.borderColor} rounded-[20px] shadow-2xl p-4 flex flex-col items-center relative select-none overflow-hidden`}
              style={{ minHeight: '820px' }}
            >
              {/* Top Banner Deco */}
              <div className="w-full text-center py-2 px-1 mb-3 bg-white/40 rounded-xl border border-white/50 backdrop-blur-xs flex items-center justify-center gap-1">
                <span className="text-xs animate-pulse">✨</span>
                <span className={`font-title text-xs ${selectedFrame.textColor}`}>
                  우리의 행복한 추억
                </span>
                <span className="text-xs animate-pulse">✨</span>
              </div>

              {/* 4 Photo slots */}
              <div className="flex flex-col gap-3 w-full">
                {selectedPhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-100 border-4 border-white shadow-md relative"
                  >
                    <img
                      src={photo.url}
                      alt={`Selected photo ${idx + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    
                    {/* Tiny index badge in corner of printed pic */}
                    <div className="absolute top-1 left-1 w-5 h-5 bg-black/45 rounded-md flex items-center justify-center text-[10px] font-bold text-white">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Strip Decoration Box */}
              <div className="mt-4 mb-2 w-full flex flex-col items-center text-center px-1">
                {/* Emojis & Class name banner */}
                <div className="flex items-center justify-center gap-1.5 w-full">
                  <span className="text-xl animate-float">{selectedFrame.emojiLeft}</span>
                  <span className={`font-title text-lg md:text-xl tracking-wide truncate ${selectedFrame.textColor}`}>
                    {bannerText}
                  </span>
                  <span className="text-xl animate-float-slow">{selectedFrame.emojiRight}</span>
                </div>

                {/* Friend names and Date */}
                <p className="text-xs font-extrabold text-slate-700/80 mt-1.5 max-w-full truncate px-1">
                  {namesText ? `🧸 ${namesText}` : '우리의 이쁜 우정'}
                </p>
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 mt-1">
                  <span>📅</span>
                  <span>{dateText}</span>
                </div>
              </div>

              {/* Overlay active stickers */}
              {stickers.map((st) => {
                const isSelected = selectedStickerId === st.id;
                return (
                  <div
                    key={st.id}
                    id={`active-st-${st.id}`}
                    onMouseDown={(e) => handleStartDrag(e, st.id)}
                    onTouchStart={(e) => handleStartDrag(e, st.id)}
                    className={`absolute cursor-grab active:cursor-grabbing select-none touch-none ${
                      isSelected ? 'z-50' : 'z-20'
                    }`}
                    style={{
                      left: `${st.x}%`,
                      top: `${st.y}%`,
                      transform: `translate(-50%, -50%) scale(${st.scale}) rotate(${st.rotation}deg)`,
                      fontSize: '2rem',
                    }}
                  >
                    <span className="select-none pointer-events-none inline-block drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
                      {st.emoji}
                    </span>

                    {/* Miniature Sticker controls when clicked */}
                    {isSelected && (
                      <div className="absolute top-[-44px] left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-white flex items-center gap-1 py-1 px-1.5 rounded-lg shadow-xl border border-slate-700 text-xs z-50 pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRotationChange(st.id, -15); }}
                          title="왼쪽 회전"
                          className="hover:bg-slate-700 p-1 rounded transition-colors"
                        >
                          <RotateCcw size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRotationChange(st.id, 15); }}
                          title="오른쪽 회전"
                          className="hover:bg-slate-700 p-1 rounded transition-colors"
                        >
                          <RotateCw size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleScaleChange(st.id, -0.15); }}
                          title="축소"
                          className="hover:bg-slate-700 p-0.5 rounded transition-colors font-bold text-[10px]"
                        >
                          <Minus size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleScaleChange(st.id, 0.15); }}
                          title="확대"
                          className="hover:bg-slate-700 p-0.5 rounded transition-colors font-bold text-[10px]"
                        >
                          <Plus size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteSticker(st.id); }}
                          title="지우기"
                          className="hover:bg-rose-600 p-1 rounded transition-colors text-rose-300 hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Designer Control Cabinets (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4 bg-white rounded-[32px] border-8 border-[#FFD54F] p-5 shadow-lg ring-8 ring-white">
          
          {/* Tab Navigation buttons */}
          <div className="flex gap-2 border-b-4 border-[#FDE68A] pb-3">
            <button
              id="tab-btn-frame"
              type="button"
              onClick={() => { playCutePop(); setActiveTab('FRAME'); }}
              className={`flex-1 py-3 px-2 rounded-2xl font-title text-base md:text-lg flex items-center justify-center gap-1 border-2 transition-all transform hover:scale-[1.02] active:scale-95 ${
                activeTab === 'FRAME'
                  ? 'bg-[#FFD54F] border-[#FFD54F] text-[#5D4037] font-extrabold shadow-md'
                  : 'bg-white border-[#D7CCC8] text-[#5D4037] hover:bg-[#FFFBEB]'
              }`}
            >
              <Palette size={16} />
              <span>🖼️ 프레임 디자인</span>
            </button>

            <button
              id="tab-btn-stickers"
              type="button"
              onClick={() => { playCutePop(); setActiveTab('STICKERS'); }}
              className={`flex-1 py-3 px-2 rounded-2xl font-title text-base md:text-lg flex items-center justify-center gap-1 border-2 transition-all transform hover:scale-[1.02] active:scale-95 ${
                activeTab === 'STICKERS'
                  ? 'bg-[#FFD54F] border-[#FFD54F] text-[#5D4037] font-extrabold shadow-md'
                  : 'bg-white border-[#D7CCC8] text-[#5D4037] hover:bg-[#FFFBEB]'
              }`}
            >
              <Heart size={16} />
              <span>🧸 스티커 꾸미기</span>
            </button>

            <button
              id="tab-btn-text"
              type="button"
              onClick={() => { playCutePop(); setActiveTab('TEXT'); }}
              className={`flex-1 py-3 px-2 rounded-2xl font-title text-base md:text-lg flex items-center justify-center gap-1 border-2 transition-all transform hover:scale-[1.02] active:scale-95 ${
                activeTab === 'TEXT'
                  ? 'bg-[#FFD54F] border-[#FFD54F] text-[#5D4037] font-extrabold shadow-md'
                  : 'bg-white border-[#D7CCC8] text-[#5D4037] hover:bg-[#FFFBEB]'
              }`}
            >
              <Type size={16} />
              <span>✍️ 글씨 바꾸기</span>
            </button>
          </div>

          {/* TAB 1 CONTENT: FRAME SELECTOR */}
          {activeTab === 'FRAME' && (
            <div className="space-y-4 animate-fade-in" id="panel-frame-selector">
              <h3 className="text-lg font-bold text-[#5D4037] flex items-center gap-1">
                <span>🎨</span> 마음에 드는 우리반 색깔 프레임을 골라보세요!
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {FRAME_TEMPLATES.map((tmpl) => {
                  const isSelected = tmpl.id === selectedFrame.id;
                  return (
                    <button
                      id={`frame-option-${tmpl.id}`}
                      key={tmpl.id}
                      type="button"
                      onClick={() => { playCutePop(); setSelectedFrame(tmpl); }}
                      className={`p-4 rounded-2xl border-4 flex flex-col items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'border-[#FFD54F] shadow-md ring-4 ring-[#FFF9C4]'
                          : 'border-slate-100 hover:border-[#FFD54F]/50'
                      } ${tmpl.bgColor}`}
                    >
                      {/* Mini preview card */}
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-slate-300 text-2xl">
                        {tmpl.emojiLeft}
                      </div>
                      
                      <div className="text-center">
                        <p className={`font-title text-base ${tmpl.textColor}`}>{tmpl.name}</p>
                        <p className="text-[10px] text-[#A1887F] font-bold">인쇄: {tmpl.bannerText.split(' ')[0]}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: STICKER STUDIO */}
          {activeTab === 'STICKERS' && (
            <div className="space-y-4 animate-fade-in" id="panel-sticker-selector">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#5D4037] flex items-center gap-1">
                  <span>🧸</span> 예쁜 스티커를 골라 사진을 꾸며보세요!
                </h3>
                {stickers.length > 0 && (
                  <button
                    id="clear-all-stickers"
                    type="button"
                    onClick={handleClearAllStickers}
                    className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all active:scale-95"
                  >
                    <Trash2 size={12} />
                    모두 지우기
                  </button>
                )}
              </div>

              {/* Sticker Category Pills */}
              <div className="flex flex-wrap gap-1.5 border-b border-[#FDE68A] pb-2">
                {[
                  { id: 'all', label: '전체 🌟' },
                  { id: 'animal', label: '동물친구 🦁' },
                  { id: 'sparkle', label: '꾸미기 ⭐' },
                  { id: 'cute', label: '소품 👑' },
                  { id: 'food', label: '냠냠간식 🍪' }
                ].map((cat) => (
                  <button
                    id={`cat-btn-${cat.id}`}
                    key={cat.id}
                    type="button"
                    onClick={() => { playCutePop(); setStickerCategory(cat.id as any); }}
                    className={`py-1.5 px-3 rounded-full text-xs font-bold border transition-all ${
                      stickerCategory === cat.id
                        ? 'bg-[#FFD54F] border-[#FFD54F] text-[#5D4037] font-extrabold shadow-sm'
                        : 'bg-white border-[#D7CCC8] text-[#5D4037] hover:bg-[#FFFBEB]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Stickers list grid */}
              <div className="grid grid-cols-6 gap-2 max-h-[250px] overflow-y-auto pr-1 py-1 bg-[#FFFBEB] p-2.5 rounded-2xl border border-[#FDE68A]">
                {filteredStickers.map((preset) => (
                  <button
                    id={`sticker-preset-${preset.id}`}
                    key={preset.id}
                    type="button"
                    onClick={() => handleAddSticker(preset.emoji)}
                    className="aspect-square bg-white hover:bg-[#FFFDE7] border-2 border-[#FDE68A] rounded-xl flex items-center justify-center text-3xl shadow-sm hover:shadow-md transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                    title={preset.label}
                  >
                    <span className="select-none pointer-events-none">{preset.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3 CONTENT: TEXT EDITOR */}
          {activeTab === 'TEXT' && (
            <div className="space-y-4 animate-fade-in" id="panel-text-selector">
              <h3 className="text-lg font-bold text-[#5D4037] flex items-center gap-1">
                <span>✍️</span> 하단 문구를 마음대로 수정할 수 있어요!
              </h3>

              <div className="space-y-4">
                {/* Banner Text */}
                <div className="space-y-1 text-left">
                  <label htmlFor="edit-banner-input" className="text-sm font-bold text-[#795548] block">
                    🎀 우리반 대표 이름 (또는 꾸밈 문구):
                  </label>
                  <input
                    id="edit-banner-input"
                    type="text"
                    maxLength={15}
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#D7CCC8] focus:border-[#FFB74D] focus:outline-none bg-white text-base font-bold text-[#5D4037]"
                    placeholder="예: 햇살 가득 우리반 ☀️"
                  />
                  <p className="text-[10px] text-[#A1887F] font-bold">최대 15자까지 쓸 수 있어요.</p>
                </div>

                {/* Subtext (Names) */}
                <div className="space-y-1 text-left">
                  <label htmlFor="edit-names-input" className="text-sm font-bold text-[#795548] block">
                    🧑‍🤝‍🧑 함께 찍은 친구들 이름:
                  </label>
                  <input
                    id="edit-names-input"
                    type="text"
                    maxLength={30}
                    value={namesText}
                    onChange={(e) => setNamesText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#D7CCC8] focus:border-[#FFB74D] focus:outline-none bg-white text-base font-bold text-[#5D4037]"
                    placeholder="예: 지훈, 수아, 예린"
                  />
                  <p className="text-[10px] text-[#A1887F] font-bold">프레임 아래쪽에 작고 이쁘게 출력돼요.</p>
                </div>

                {/* Date */}
                <div className="space-y-1 text-left">
                  <label htmlFor="edit-date-input" className="text-sm font-bold text-[#795548] block">
                    📅 찍은 날짜:
                  </label>
                  <input
                    id="edit-date-input"
                    type="text"
                    maxLength={12}
                    value={dateText}
                    onChange={(e) => setDateText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#D7CCC8] focus:border-[#FFB74D] focus:outline-none bg-white text-base font-bold text-[#5D4037]"
                    placeholder="예: 2026.07.07"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
