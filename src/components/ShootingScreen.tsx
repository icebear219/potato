import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Smile, Sparkles } from 'lucide-react';
import { CapturedPhoto } from '../types';
import { playCountdownBeep, playCameraShutter, playSuccessChime } from '../utils/audio';

interface ShootingScreenProps {
  className: string;
  childrenNames: string;
  stream: MediaStream;
  deviceId: string;
  onShootingComplete: (photos: CapturedPhoto[]) => void;
}

export default function ShootingScreen({
  className,
  childrenNames,
  stream,
  deviceId,
  onShootingComplete
}: ShootingScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | 'SMILE' | 'START'>(3);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isPreviewingCaptured, setIsPreviewingCaptured] = useState<boolean>(false);
  const [lastCapturedPhoto, setLastCapturedPhoto] = useState<string | null>(null);
  const [shootingStarted, setShootingStarted] = useState<boolean>(false);

  // Set stream to video ref on mount
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Start the automatic shooting process after a small 2-second delay for preparation
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    let active = true;

    async function runShootingLoop() {
      // 1. Preparation phase
      setCountdown('START');
      await sleep(2000);
      if (!active) return;

      for (let i = 0; i < 5; i++) {
        setCurrentPhotoIndex(i);
        setIsPreviewingCaptured(false);
        setLastCapturedPhoto(null);

        // 3... 2... 1... Countdown
        for (let count = 3; count >= 1; count--) {
          setCountdown(count);
          playCountdownBeep(600, 0.15);
          await sleep(1000);
          if (!active) return;
        }

        // SMILE!
        setCountdown('SMILE');
        playCountdownBeep(900, 0.3); // High pitcher beep for smile
        await sleep(500);
        if (!active) return;

        // Take Picture (Flash + Shutter sound)
        capturePhoto(i);
        if (!active) return;

        // Show captured preview for 2.5 seconds
        await sleep(2500);
        if (!active) return;
      }

      // Finish shooting!
      playSuccessChime();
      await sleep(800);
      onShootingComplete(photosRef.current);
    }

    setShootingStarted(true);
    runShootingLoop();

    return () => {
      active = false;
      clearInterval(countdownInterval);
    };
  }, []);

  // Use a ref to always get the freshest photos array inside the async loop
  const photosRef = useRef<CapturedPhoto[]>([]);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const capturePhoto = (index: number) => {
    const video = videoRef.current;
    if (!video) return;

    // Play Shutter Sound
    playCameraShutter();

    // Trigger Flash Effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    try {
      // Create off-screen canvas for capturing
      const canvas = document.createElement('canvas');
      // High-res output dimensions in 4:3 aspect ratio
      canvas.width = 960;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // 1. Mirroring setup so captured image matches video preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        // 2. Perform center crop of video stream into 4:3 frame
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const targetAspect = 4 / 3;
        const sourceAspect = videoWidth / videoHeight;

        let sx = 0;
        let sy = 0;
        let sWidth = videoWidth;
        let sHeight = videoHeight;

        if (sourceAspect > targetAspect) {
          // Source is wider (e.g., 16:9) -> crop the horizontal edges
          sWidth = videoHeight * targetAspect;
          sx = (videoWidth - sWidth) / 2;
        } else if (sourceAspect < targetAspect) {
          // Source is taller -> crop vertical edges
          sHeight = videoWidth / targetAspect;
          sy = (videoHeight - sHeight) / 2;
        }

        ctx.drawImage(
          video,
          sx,
          sy,
          sWidth,
          sHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        
        const newPhoto: CapturedPhoto = {
          id: `photo-${Date.now()}-${index}`,
          url: dataUrl,
          timestamp: Date.now()
        };

        setPhotos(prev => [...prev, newPhoto]);
        setLastCapturedPhoto(dataUrl);
        setIsPreviewingCaptured(true);
      }
    } catch (err) {
      console.error('Failed to capture photo:', err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col items-center justify-center min-h-[85vh] relative" id="shooting-screen-container">
      {/* Top Banner */}
      <div className="w-full max-w-4xl bg-white border-4 border-[#FDE68A] rounded-3xl py-3.5 px-6 mb-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce">📸</span>
          <span className="font-title text-[#FF8A65] text-xl md:text-2xl leading-none">
            {className} 친구들! 이쁘게 찰칵!
          </span>
        </div>
        <div className="bg-[#E1F5FE] text-[#0288D1] border-2 border-[#81D4FA] px-4 py-1.5 rounded-full font-bold text-sm md:text-base">
          촬영 중: <span className="text-[#0288D1] font-extrabold text-lg">{Math.min(currentPhotoIndex + 1, 5)}</span> / 5 장
        </div>
      </div>

      {/* Main Grid: Camera Preview & Film Strip */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left/Middle: Live Camera Feed with Overlay */}
        <div className="lg:col-span-3 bg-white rounded-[32px] border-8 border-[#FFD54F] p-4 shadow-xl relative overflow-hidden flex flex-col justify-between ring-8 ring-white">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#FFD54F]"></div>
          
          <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border-4 border-[#FFFBEB] flex items-center justify-center">
            
            {/* Live Camera (Mirrored) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] transition-all duration-300 ${
                isPreviewingCaptured ? 'opacity-30 blur-sm' : 'opacity-100'
              }`}
            />

            {/* White Flash Effect Overlay */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white z-50 animate-fade-out" />
            )}

            {/* Countdown Overlay */}
            {!isPreviewingCaptured && countdown === 'START' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-30 text-white">
                <div className="text-center p-6 rounded-3xl bg-[#FFB74D] border-4 border-white text-white shadow-2xl scale-110 animate-bounce">
                  <p className="text-3xl font-title">곧 촬영을 시작해요!</p>
                  <p className="text-base font-bold mt-1">준비하시고~ 렌즈를 보세요! 🍿</p>
                </div>
              </div>
            )}

            {!isPreviewingCaptured && typeof countdown === 'number' && countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center z-30 select-none pointer-events-none">
                <div className="relative">
                  {/* Huge bouncy countdown circle */}
                  <div className="w-36 h-36 md:w-48 md:h-48 bg-[#FFB74D] border-8 border-white text-white rounded-full flex items-center justify-center shadow-2xl animate-ping opacity-25 absolute -inset-0" />
                  <div className="w-36 h-36 md:w-48 md:h-48 bg-gradient-to-br from-[#FFB74D] to-[#FF8A65] border-8 border-white text-white rounded-full flex items-center justify-center shadow-2xl relative transform scale-100 transition-transform font-title text-8xl md:text-9xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
                    {countdown}
                  </div>
                </div>
              </div>
            )}

            {!isPreviewingCaptured && countdown === 'SMILE' && (
              <div className="absolute inset-0 flex items-center justify-center z-30 select-none pointer-events-none animate-bounce">
                <div className="bg-[#F06292] border-8 border-white text-white py-4 px-10 rounded-[30px] shadow-2xl font-title text-5xl md:text-6xl drop-shadow-md flex items-center gap-2">
                  <span>김치~🧀</span>
                </div>
              </div>
            )}

            {/* Post-Capture Instant Preview Overlay */}
            {isPreviewingCaptured && lastCapturedPhoto && (
              <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/20 p-4">
                <div className="bg-white rounded-[30px] p-3 border-8 border-[#FFD54F] shadow-2xl max-w-sm w-full transform rotate-1 animate-float relative">
                  {/* Confetti decoration */}
                  <div className="absolute -top-4 -left-4 text-3xl animate-bounce">✨</div>
                  <div className="absolute -bottom-4 -right-4 text-3xl animate-bounce">🎉</div>
                  
                  <img
                    src={lastCapturedPhoto}
                    alt="Captured preview"
                    className="w-full h-auto aspect-[4/3] object-cover rounded-2xl border-4 border-[#FFFBEB]"
                  />
                  
                  <div className="text-center mt-3 bg-[#E1F5FE] text-[#0288D1] border border-[#81D4FA] font-bold py-1.5 px-4 rounded-full text-base">
                    {currentPhotoIndex + 1}번째 사진 찍기 성공! 💚
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shooting Guide / Interaction Line */}
          <div className="mt-4 bg-[#FFFBEB] p-3 rounded-2xl border-2 border-[#FDE68A] text-center">
            <p className="text-[#5D4037] font-bold text-base flex items-center justify-center gap-2">
              <Smile className="text-[#FFB74D] fill-[#FFF9C4]" />
              <span>카메라 렌즈 🔴 를 바라보면 눈이 예쁘게 나와요!</span>
            </p>
          </div>
        </div>

        {/* Right: Vertical Film Strip of Captured Photos */}
        <div className="bg-[#5D4037] rounded-[32px] p-5 text-white flex flex-col justify-between shadow-xl border-4 border-white/10 min-h-[300px]">
          <div>
            <h3 className="font-title text-[#FFD54F] text-lg text-center mb-3 flex items-center justify-center gap-1.5 border-b border-white/10 pb-2">
              📸 내 사진 필름
            </h3>
            
            {/* Film Frames slots */}
            <div className="grid grid-cols-5 lg:grid-cols-1 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
              {[0, 1, 2, 3, 4].map((idx) => {
                const captured = photos[idx];
                const isActive = currentPhotoIndex === idx && !isPreviewingCaptured;
                
                return (
                  <div
                    key={idx}
                    className={`aspect-[4/3] rounded-xl border-2 overflow-hidden relative bg-black/20 flex items-center justify-center transition-all ${
                      captured
                        ? 'border-[#FFD54F] shadow-md transform rotate-[-1deg]'
                        : isActive
                        ? 'border-[#FFB74D] ring-4 ring-[#FFB74D]/50 scale-105'
                        : 'border-white/10'
                    }`}
                  >
                    {captured ? (
                      <img
                        src={captured.url}
                        alt={`Slot ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-xs text-white/40 font-bold flex flex-col items-center">
                        <span className="text-lg mb-1">{isActive ? '📸' : '⏳'}</span>
                        <span>{idx + 1}번</span>
                      </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-1 left-1 bg-black/60 text-[10px] font-bold text-white px-1.5 rounded">
                      {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-4 border-t border-white/10 pt-3">
            <span className="inline-block animate-pulse w-2.5 h-2.5 bg-[#FF8A65] rounded-full mr-1.5"></span>
            <span className="text-xs text-white/40 font-bold uppercase tracking-wider">AUTO-REC SYSTEM</span>
          </div>
        </div>

      </div>
    </div>
  );
}
