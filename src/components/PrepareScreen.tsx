import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, ChevronLeft, AlertCircle, Sparkles } from 'lucide-react';
import { playCutePop } from '../utils/audio';

interface PrepareScreenProps {
  className: string;
  childrenNames: string;
  onCameraReady: (stream: MediaStream, deviceId: string) => void;
  onBack: () => void;
}

export default function PrepareScreen({
  className,
  childrenNames,
  onCameraReady,
  onBack
}: PrepareScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 1. Request camera access and enumerate devices
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: 'user' },
          audio: false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);
        setPermissionState('granted');
        setErrorMessage('');

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Fetch other video inputs
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        // Default select if not already set
        if (!selectedDeviceId && videoDevices.length > 0) {
          // Look for front camera or first device
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setPermissionState('denied');
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage('카메라 사용 권한이 거부되었어요. 브라우저 주소창 왼쪽의 자물쇠 버튼을 눌러 카메라 권한을 허용해 주세요!');
        } else {
          setErrorMessage('카메라를 찾을 수 없거나 이미 사용 중이에요. 연결 상태를 확인하고 다른 프로그램을 꺼주세요!');
        }
      }
    }

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId]);

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playCutePop();
    setSelectedDeviceId(e.target.value);
  };

  const handleStartShooting = () => {
    if (stream && selectedDeviceId) {
      playCutePop();
      onCameraReady(stream, selectedDeviceId);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-4" id="prepare-screen-container">
      {/* Back Button */}
      <button
        id="back-to-welcome"
        type="button"
        onClick={() => { playCutePop(); onBack(); }}
        className="self-start mb-4 flex items-center gap-1 py-2.5 px-5 bg-white hover:bg-[#FFFBEB] text-[#5D4037] font-bold rounded-2xl border-2 border-[#FDE68A] transition-all active:scale-95 text-base shadow-sm"
      >
        <ChevronLeft size={18} className="text-[#FF8A65] stroke-[3]" />
        처음으로 돌아가기
      </button>

      <div className="w-full max-w-2xl bg-white rounded-[32px] border-8 border-[#FFD54F] shadow-2xl p-6 md:p-8 relative overflow-hidden ring-8 ring-white">
        {/* Sky Background Deco */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#FFD54F]"></div>
        
        {/* Info Header */}
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-1.5 bg-[#E1F5FE] text-[#0288D1] font-bold text-sm rounded-full border border-[#81D4FA] mb-2">
            🎈 {className}의 {childrenNames} 친구들!
          </span>
          <h2 className="text-3xl font-title text-[#5D4037] flex items-center justify-center gap-2">
            📷 카메라 준비 완료하기
          </h2>
          <p className="text-[#A1887F] font-bold text-sm md:text-base mt-1">
            렌즈를 보고 멋진 하트나 브이(V) 포즈를 지어볼까요? ✌️💖
          </p>
        </div>

        {/* Video Box (TV Frame) */}
        <div className="relative bg-slate-900 rounded-[24px] border-8 border-[#FFD54F] aspect-video overflow-hidden shadow-inner flex items-center justify-center">
          {permissionState === 'granted' && (
            <video
              id="camera-preview-video"
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]" // Mirror mode for natural layout
            />
          )}

          {permissionState === 'prompt' && !errorMessage && (
            <div className="text-center text-white p-6">
              <RefreshCw className="w-12 h-12 mx-auto mb-3 animate-spin text-[#81D4FA]" />
              <p className="text-lg font-bold">카메라 권한을 확인하고 있어요...</p>
              <p className="text-xs text-slate-300 mt-2">화면에 뜨는 허용 창을 꼭 눌러주세요!</p>
            </div>
          )}

          {permissionState === 'denied' && (
            <div className="text-center text-rose-100 p-6 max-w-md">
              <AlertCircle className="w-14 h-14 mx-auto mb-3 text-rose-400" />
              <p className="text-lg font-bold text-rose-300">카메라를 켤 수 없어요 😢</p>
              <p className="text-sm mt-2 font-medium leading-relaxed">{errorMessage}</p>
              <button
                id="retry-camera"
                type="button"
                onClick={() => setSelectedDeviceId(prev => prev + ' ')} // Force trigger reload
                className="mt-4 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
              >
                다시 시도하기 🔄
              </button>
            </div>
          )}

          {/* Sparkly Floating Sticker overlay for preview fun */}
          {permissionState === 'granted' && (
            <div className="absolute top-3 right-3 bg-[#FFD54F] text-[#5D4037] font-bold py-1.5 px-3.5 text-xs rounded-full flex items-center gap-1.5 animate-pulse shadow-md border border-white">
              <Sparkles size={12} className="text-[#FF8A65]" />
              거울 모드가 켜져 있어요!
            </div>
          )}
        </div>

        {/* Device Settings */}
        {permissionState === 'granted' && devices.length > 1 && (
          <div className="mt-4 flex flex-col md:flex-row items-center gap-2 justify-between bg-[#E1F5FE] p-3 rounded-2xl border border-[#81D4FA]">
            <label htmlFor="camera-select" className="text-sm font-bold text-[#0288D1] flex items-center gap-1">
              <span>🔄</span> 사용할 카메라를 바꿀 수 있어요:
            </label>
            <select
              id="camera-select"
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              className="px-3 py-1.5 rounded-xl border border-[#81D4FA] bg-white font-bold text-sm text-[#0288D1] focus:outline-none focus:border-[#0288D1] max-w-xs cursor-pointer"
            >
              {devices.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `카메라 ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Start Button */}
        <div className="mt-6 text-center">
          <button
            id="ready-start-shooting"
            type="button"
            onClick={handleStartShooting}
            disabled={permissionState !== 'granted'}
            className={`w-full py-4 font-black text-2xl rounded-full border-4 shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 ${
              permissionState === 'granted'
                ? 'bg-[#F06292] hover:bg-[#E91E63] border-white text-white animate-pulse-slow'
                : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
            }`}
          >
            📸 준비 완료! 사진 찍으러 가기! 📸
          </button>
          <p className="text-xs text-[#795548] font-bold mt-2">
            * 3, 2, 1 카운터 이후에 찰칵! 총 5장을 연속으로 찍을 거예요!
          </p>
        </div>
      </div>
    </div>
  );
}
