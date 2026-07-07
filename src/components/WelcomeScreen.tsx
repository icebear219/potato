import React, { useState } from 'react';
import { Camera, Smile, Sparkles, Star } from 'lucide-react';
import { CLASS_NAME_PRESETS } from '../data/presets';
import { playCutePop } from '../utils/audio';

interface WelcomeScreenProps {
  onStart: (className: string, childrenNames: string) => void;
  initialClassName?: string;
  initialChildrenNames?: string;
}

export default function WelcomeScreen({
  onStart,
  initialClassName = '',
  initialChildrenNames = ''
}: WelcomeScreenProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>(
    CLASS_NAME_PRESETS.includes(initialClassName) ? initialClassName : CLASS_NAME_PRESETS[0]
  );
  const [customClassName, setCustomClassName] = useState<string>(
    CLASS_NAME_PRESETS.includes(initialClassName) ? '' : initialClassName
  );
  const [childrenNames, setChildrenNames] = useState<string>(initialChildrenNames);

  const handlePresetSelect = (preset: string) => {
    playCutePop();
    setSelectedPreset(preset);
    setCustomClassName('');
  };

  const handleCustomClassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPreset('');
    setCustomClassName(e.target.value);
  };

  const handleStart = () => {
    playCutePop();
    const finalClassName = customClassName ? customClassName.trim() : selectedPreset;
    onStart(finalClassName || '우리반', childrenNames.trim() || '사랑둥이들');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 text-center" id="welcome-screen-container">
      {/* Floating Sparkling Stars */}
      <div className="absolute top-12 left-12 text-[#FFB74D] animate-float">
        <Star size={36} fill="#FFB74D" />
      </div>
      <div className="absolute top-20 right-16 text-[#F06292] animate-float-slow">
        <Smile size={32} fill="#FFF1F2" className="stroke-[#F06292]" />
      </div>
      <div className="absolute bottom-16 left-16 text-[#81D4FA] animate-float-slow">
        <Sparkles size={28} />
      </div>
      <div className="absolute bottom-24 right-20 text-[#FFD54F] animate-float">
        <Star size={30} fill="#FFF9C4" className="stroke-[#FFD54F]" />
      </div>

      <div className="max-w-xl w-full bg-white rounded-[32px] shadow-2xl border-8 border-[#FFD54F] p-8 relative overflow-hidden ring-8 ring-white">
        {/* Decorative corner circles */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#FFF1F2] rounded-full opacity-60"></div>
        <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-[#E1F5FE] rounded-full opacity-60"></div>

        {/* Logo / Heading */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-[#FFFBEB] rounded-3xl flex items-center justify-center text-[#FFB74D] mb-4 animate-bounce border-4 border-[#FFD54F] shadow-md">
            <Camera size={44} className="stroke-[2.5]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-title text-[#FF8A65] tracking-tight mb-2 drop-shadow-sm" id="app-main-title">
            우리반 네컷 스튜디오 📸
          </h1>
          <p className="text-lg text-[#795548] font-bold">
            친구들과 함께 예쁜 추억 사진을 골라볼까요?
          </p>
        </div>

        {/* Content Box */}
        <div className="space-y-6 text-left">
          {/* Step 1: Class Name */}
          <div className="bg-[#FFFDE7] p-5 rounded-3xl border-2 border-[#FDE68A]">
            <h3 className="text-lg font-bold text-[#795548] mb-3 flex items-center gap-1.5">
              <span>🌈</span> 1. 우리반 이름을 골라주세요!
            </h3>
            
            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {CLASS_NAME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  id={`preset-${preset.split(' ')[0]}`}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`py-2 px-1 text-sm md:text-base font-bold rounded-2xl border-2 transition-all transform hover:scale-105 active:scale-95 ${
                    selectedPreset === preset
                      ? 'bg-[#FFD54F] border-[#FFD54F] text-[#5D4037] shadow-md font-extrabold'
                      : 'bg-white border-[#D7CCC8] text-[#5D4037] hover:bg-[#FFFBEB]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="mt-3">
              <label htmlFor="custom-class-input" className="text-xs font-bold text-[#A1887F] block mb-1">
                직접 이름을 쓰고 싶다면 아래에 적어주세요:
              </label>
              <input
                id="custom-class-input"
                type="text"
                placeholder="예: 예쁜 장미반 🌹"
                value={customClassName}
                onChange={handleCustomClassChange}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#D7CCC8] focus:border-[#FFB74D] focus:outline-none bg-white text-base font-bold placeholder:text-[#D7CCC8] transition-all text-[#5D4037]"
              />
            </div>
          </div>

          {/* Step 2: Children's Names */}
          <div className="bg-[#FFF1F2] p-5 rounded-3xl border-2 border-[#F8BBD0]">
            <h3 className="text-lg font-bold text-[#C2185B] mb-2 flex items-center gap-1.5">
              <span>✏️</span> 2. 사진 찍는 친구들 이름을 적어볼까요?
            </h3>
            <p className="text-xs text-[#E91E63] font-bold mb-3">
              이름을 적어두면 사진 프레임 밑에 예쁘게 인쇄돼요!
            </p>
            <input
              id="children-names-input"
              type="text"
              placeholder="예: 민우, 서연, 지훈 (비워둬도 괜찮아요!)"
              value={childrenNames}
              onChange={(e) => setChildrenNames(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#F8BBD0] focus:border-[#F06292] focus:outline-none bg-white text-base font-bold placeholder:text-[#F8BBD0] transition-all text-[#5D4037]"
            />
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-8">
          <button
            id="start-button"
            type="button"
            onClick={handleStart}
            className="w-full md:w-auto md:px-12 py-4 bg-[#F06292] hover:bg-[#E91E63] text-white font-black text-2xl rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 border-4 border-white animate-pulse-slow"
          >
            📸 사진 촬영 시작하기! 📸
          </button>
        </div>

        <div className="mt-4 text-xs text-[#A1887F] font-bold">
          * 이 프로그램은 어린이들의 소중한 카메라 영상이나 사진을 어떠한 서버로도 전송하지 않고 브라우저에만 안전하게 보관합니다. 🔒
        </div>
      </div>
    </div>
  );
}
