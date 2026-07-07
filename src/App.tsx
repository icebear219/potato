import React, { useState, useEffect } from 'react';
import { Sparkles, Camera, Heart, Smile } from 'lucide-react';
import { AppStep, CapturedPhoto, FrameTemplate, ActiveSticker } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import PrepareScreen from './components/PrepareScreen';
import ShootingScreen from './components/ShootingScreen';
import SelectionScreen from './components/SelectionScreen';
import EditScreen from './components/EditScreen';
import FinalScreen from './components/FinalScreen';

export default function App() {
  const [step, setStep] = useState<AppStep>('WELCOME');
  const [className, setClassName] = useState<string>('');
  const [childrenNames, setChildrenNames] = useState<string>('');
  
  // Camera stream state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Photos state
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<CapturedPhoto[]>([]);

  // Frame and sticker state
  const [selectedFrame, setSelectedFrame] = useState<FrameTemplate | null>(null);
  const [activeStickers, setActiveStickers] = useState<ActiveSticker[]>([]);
  const [customTexts, setCustomTexts] = useState<{ banner: string; names: string; date: string }>({
    banner: '',
    names: '',
    date: ''
  });

  // Stop the camera helper
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Camera track ${track.label} stopped.`);
      });
      setCameraStream(null);
    }
  };

  // Safe cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  // Step 1: Welcome starts
  const handleStartApp = (nameOfClass: string, namesOfChildren: string) => {
    setClassName(nameOfClass);
    setChildrenNames(namesOfChildren);
    setStep('PREPARE');
  };

  // Step 2: Camera ready
  const handleCameraReady = (stream: MediaStream, deviceId: string) => {
    setCameraStream(stream);
    setSelectedDeviceId(deviceId);
    setStep('SHOOTING');
  };

  // Step 3: Shooting completed (5 photos captured)
  const handleShootingComplete = (photos: CapturedPhoto[]) => {
    setCapturedPhotos(photos);
    // Automatically turn off camera as it is no longer needed!
    stopCamera();
    setStep('SELECTION');
  };

  // Step 4: 4 photos selected
  const handlePhotosSelected = (photos: CapturedPhoto[]) => {
    setSelectedPhotos(photos);
    setStep('EDIT');
  };

  // Step 5: Editing complete
  const handleEditComplete = (
    frame: FrameTemplate,
    stickers: ActiveSticker[],
    texts: { banner: string; names: string; date: string }
  ) => {
    setSelectedFrame(frame);
    setActiveStickers(stickers);
    setCustomTexts(texts);
    setStep('FINAL');
  };

  // Reset entire application to start over
  const handleReset = () => {
    stopCamera();
    setStep('WELCOME');
    setCapturedPhotos([]);
    setSelectedPhotos([]);
    setSelectedFrame(null);
    setActiveStickers([]);
    setCustomTexts({ banner: '', names: '', date: '' });
  };

  const handleBackToWelcome = () => {
    stopCamera();
    setStep('WELCOME');
  };

  const handleBackToSelection = () => {
    setStep('SELECTION');
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] text-[#5D4037] flex flex-col justify-between select-none relative pb-8 overflow-x-hidden font-sans">
      
      {/* Playful polka dots background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 bg-[radial-gradient(#FF8A65_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

      {/* Polish Header */}
      <header className="h-[110px] md:h-[100px] flex flex-col md:flex-row items-center justify-between px-6 md:px-12 border-b-4 border-[#FDE68A] bg-white relative z-10 py-3 md:py-0 gap-2 md:gap-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[#FFB74D] rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl shadow-lg border-2 border-white">
            📸
          </div>
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#FF8A65] font-title leading-tight">
              우리반 네컷
            </h1>
          </div>
        </div>
        
        {/* Step indicator badge with theme-matching blue highlight */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-[#E1F5FE] rounded-full border-2 border-[#81D4FA] font-bold text-[#0288D1] shadow-xs text-xs md:text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0288D1] animate-pulse"></span>
          <span>
            {step === 'WELCOME' && '입장 완료 🎈'}
            {step === 'PREPARE' && '준비 단계 🎬'}
            {step === 'SHOOTING' && '촬영 진행 중 ⚡'}
            {step === 'SELECTION' && '사진 선택 중 🌟'}
            {step === 'EDIT' && '디자인 꾸미기 🎨'}
            {step === 'FINAL' && '대성공! 🏆'}
          </span>
        </div>
      </header>

      {/* Main Screen Router */}
      <main className="flex-1 w-full flex items-center justify-center relative z-10 py-4">
        {step === 'WELCOME' && (
          <WelcomeScreen
            onStart={handleStartApp}
            initialClassName={className}
            initialChildrenNames={childrenNames}
          />
        )}

        {step === 'PREPARE' && (
          <PrepareScreen
            className={className}
            childrenNames={childrenNames}
            onCameraReady={handleCameraReady}
            onBack={handleBackToWelcome}
          />
        )}

        {step === 'SHOOTING' && (
          <ShootingScreen
            className={className}
            childrenNames={childrenNames}
            stream={cameraStream!}
            deviceId={selectedDeviceId}
            onShootingComplete={handleShootingComplete}
          />
        )}

        {step === 'SELECTION' && (
          <SelectionScreen
            className={className}
            childrenNames={childrenNames}
            photos={capturedPhotos}
            onPhotosSelected={handlePhotosSelected}
          />
        )}

        {step === 'EDIT' && (
          <EditScreen
            className={className}
            childrenNames={childrenNames}
            selectedPhotos={selectedPhotos}
            onBackToSelection={handleBackToSelection}
            onComplete={handleEditComplete}
          />
        )}

        {step === 'FINAL' && (
          <FinalScreen
            selectedFrame={selectedFrame!}
            stickers={activeStickers}
            customTexts={customTexts}
            selectedPhotos={selectedPhotos}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Friendly footer */}
      <footer className="w-full text-center py-4 border-t-4 border-amber-100 bg-amber-50/20 relative z-10 mt-6">
        <p className="text-xs text-amber-700 font-bold flex items-center justify-center gap-1.5">
          <Smile size={14} className="text-amber-500" />
          <span>우리반 네컷 스튜디오 • 전국 모든 유치원과 어린이집 친구들의 소중한 꿈을 응원합니다 🎈👶</span>
        </p>
      </footer>
    </div>
  );
}

