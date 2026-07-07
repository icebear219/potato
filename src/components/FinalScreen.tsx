import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Printer, Star, Heart } from 'lucide-react';
import { CapturedPhoto, FrameTemplate, ActiveSticker } from '../types';
import { playCutePop, playSuccessChime } from '../utils/audio';

interface FinalScreenProps {
  selectedFrame: FrameTemplate;
  stickers: ActiveSticker[];
  customTexts: { banner: string; names: string; date: string };
  selectedPhotos: CapturedPhoto[];
  onReset: () => void;
}

export default function FinalScreen({
  selectedFrame,
  stickers,
  customTexts,
  selectedPhotos,
  onReset
}: FinalScreenProps) {
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let active = true;

    async function renderCompositeImage() {
      try {
        setIsLoading(true);
        setError('');

        // Create heavy resolution canvas (perfect for printing!)
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 1880;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context could not be created');

        // Async image loader helper
        const loadImage = (url: string): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
          });
        };

        // Load all 4 selected photos
        const loadedPhotos = await Promise.all(selectedPhotos.map(p => loadImage(p.url)));
        
        if (!active) return;

        // 1. Draw solid background with frame template's color
        ctx.fillStyle = selectedFrame.hexColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw 4 photos with classic instant print borders
        const photoWidth = 560;
        const photoHeight = 420;
        const startX = 40;
        const gap = 24;

        loadedPhotos.forEach((img, idx) => {
          const startY = 40 + idx * (photoHeight + gap);

          // Draw the white paper border background for that retro look
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(startX - 6, startY - 6, photoWidth + 12, photoHeight + 12);

          // Draw actual photo inside
          ctx.drawImage(img, startX, startY, photoWidth, photoHeight);
        });

        // 3. Draw Bottom Captions / Typography
        const bottomY = 1750;

        // Banner text (e.g. "햇살 가득 우리반")
        ctx.fillStyle = selectedFrame.hexTextColor;
        ctx.font = 'bold 36px "Jua", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const bannerString = `${selectedFrame.emojiLeft} ${customTexts.banner} ${selectedFrame.emojiRight}`;
        ctx.fillText(bannerString, canvas.width / 2, bottomY);

        // Class children names (e.g., "민우, 서연, 지훈")
        ctx.fillStyle = '#374151'; // Dark charcoal
        ctx.font = 'bold 24px "Gaegu", sans-serif';
        const namesString = customTexts.names ? `🧸 ${customTexts.names}` : '우리의 이쁜 우정';
        ctx.fillText(namesString, canvas.width / 2, bottomY + 54);

        // Date (e.g., "2026.07.07")
        ctx.fillStyle = '#6B7280'; // Slate Gray
        ctx.font = '18px "Gaegu", sans-serif';
        const dateString = `📅 ${customTexts.date}`;
        ctx.fillText(dateString, canvas.width / 2, bottomY + 92);

        // 4. Draw overlays active stickers
        stickers.forEach(st => {
          // Translate preview percentage positions into high-res canvas positions
          const stickerCanvasX = (st.x / 100) * canvas.width;
          const stickerCanvasY = (st.y / 100) * canvas.height;

          ctx.save();
          ctx.translate(stickerCanvasX, stickerCanvasY);
          ctx.rotate((st.rotation * Math.PI) / 180);
          
          // Scaled sticker size relative to base canvas size (70px)
          const targetStickerSize = 70 * st.scale;
          ctx.font = `${targetStickerSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          ctx.fillText(st.emoji, 0, 0);
          ctx.restore();
        });

        // Export data URL as high quality PNG
        const outputDataUrl = canvas.toDataURL('image/png');
        setRenderedImageUrl(outputDataUrl);
        setIsLoading(false);
        playSuccessChime();
      } catch (err: any) {
        console.error('Image generation error:', err);
        setError('사진을 하나로 만드는 데 문제가 생겼어요 😢');
        setIsLoading(false);
      }
    }

    renderCompositeImage();

    return () => {
      active = false;
    };
  }, [selectedFrame, stickers, customTexts, selectedPhotos]);

  const handlePrint = () => {
    playCutePop();
    if (!renderedImageUrl) return;

    // Create a temporary window containing just the high-res image and call print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${customTexts.banner || '우리반네컷'}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
              img { max-height: 98vh; max-width: 100%; object-fit: contain; }
              @media print {
                body { margin: 0; }
                img { max-height: 100vh; width: auto; page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <img src="${renderedImageUrl}" onload="window.print();window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert('팝업 차단이 켜져 있는 것 같아요. 팝업 허용을 해주시면 바로 인쇄할 수 있어요! 대신 아래 다운로드 단추를 눌러 저장한 다음 인쇄할 수도 있어요 🎈');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center justify-center min-h-[85vh]" id="final-screen-container">
      
      {/* Decorative stars */}
      <div className="absolute top-16 left-12 text-[#FFD54F] animate-float hidden md:block">
        <Star size={36} fill="#FFD54F" />
      </div>
      <div className="absolute top-24 right-12 text-[#FF8A65] animate-float-slow hidden md:block">
        <Heart size={32} fill="#FF8A65" />
      </div>

      {isLoading ? (
        /* Cute loading printer box */
        <div className="bg-white rounded-[32px] border-8 border-[#FFD54F] p-10 max-w-sm w-full text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center ring-8 ring-white">
          <div className="w-24 h-24 bg-[#FFFDE7] rounded-full flex items-center justify-center mb-6 border-4 border-[#FFD54F] animate-bounce">
            <span className="text-5xl">🖨️</span>
          </div>
          <h2 className="text-2xl font-title text-[#5D4037] mb-2">
            찰칵찰칵 인쇄 중...
          </h2>
          <p className="text-sm text-[#795548] font-bold leading-relaxed mb-6">
            {customTexts.banner} 사진을 예쁜 종이에 정성껏 인쇄하고 있어요. 잠시만 기다려주세요! 🎨
          </p>
          <div className="w-full bg-[#FFFBEB] h-3 rounded-full overflow-hidden border border-[#D7CCC8]">
            <div className="bg-[#FFD54F] h-full animate-[shimmer_1.5s_infinite]" style={{ width: '70%', backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '200% 100%' }}></div>
          </div>
        </div>
      ) : error ? (
        /* Error Screen */
        <div className="bg-white rounded-[32px] border-8 border-rose-200 p-8 text-center max-w-md shadow-2xl ring-8 ring-white">
          <span className="text-5xl">😢</span>
          <h2 className="text-2xl font-title text-rose-950 mt-4 mb-2">어머나! 에러가 났어요</h2>
          <p className="text-sm font-bold text-rose-700 leading-relaxed mb-6">{error}</p>
          <button
            id="error-reset"
            type="button"
            onClick={onReset}
            className="px-6 py-2.5 bg-[#FFD54F] hover:bg-[#FFC107] text-[#5D4037] font-bold rounded-2xl shadow-md transition-all active:scale-95 border-2 border-white"
          >
            처음부터 다시 시도하기 🔄
          </button>
        </div>
      ) : (
        /* Image output display */
        <div className="w-full max-w-3xl bg-white rounded-[32px] border-8 border-[#FFD54F] shadow-2xl p-6 md:p-8 relative overflow-hidden flex flex-col items-center ring-8 ring-white">
          {/* Confetti design banner */}
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-1.5 bg-[#FFFDE7] text-[#5D4037] border border-[#FDE68A] font-bold text-xs rounded-full mb-2.5 shadow-sm">
              🎉 세상에 단 하나뿐인 우리반 네컷!
            </div>
            <h2 className="text-3xl font-title text-[#FF8A65] flex items-center justify-center gap-1.5">
              ✨ 와아! 예쁜 네컷 사진 완성! ✨
            </h2>
            <p className="text-[#795548] font-bold text-sm md:text-base mt-1">
              아래 저장 단추를 눌러 컴퓨터에 소중히 간직해 보아요 💖
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full items-stretch">
            
            {/* Left: Beautiful scrolling printed strip rendering (md:col-span-5) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="bg-[#FFFBEB] p-4 rounded-3xl border border-[#D7CCC8] shadow-inner flex justify-center max-h-[500px] overflow-y-auto w-full">
                {renderedImageUrl && (
                  <img
                    id="four-cut-output-img"
                    src={renderedImageUrl}
                    alt="Completed four-cut strip"
                    className="w-[200px] h-auto rounded-xl shadow-lg border-4 border-white transform rotate-[1deg]"
                  />
                )}
              </div>
              <p className="text-[11px] text-[#A1887F] font-bold mt-2 text-center">
                * 필름 모양을 아래위로 밀어 전체 모습을 볼 수 있어요.
              </p>
            </div>

            {/* Right: Actions and Fun feedback (md:col-span-7) */}
            <div className="md:col-span-7 flex flex-col justify-between py-2 space-y-6">
              
              {/* Kids Info Panel */}
              <div className="bg-[#FFFBEB] border-2 border-[#FDE68A] p-5 rounded-3xl space-y-3 shadow-sm">
                <h4 className="font-bold text-[#5D4037] text-lg flex items-center gap-1">
                  <span>💌</span> 소중한 사진 우체통
                </h4>
                <ul className="space-y-2 text-sm text-[#795548] font-semibold text-left">
                  <li className="flex items-center gap-2">
                    <span className="text-base">🎒</span>
                    <span>우리반: <strong className="text-[#5D4037]">{customTexts.banner}</strong></span>
                  </li>
                  {customTexts.names && (
                    <li className="flex items-center gap-2">
                      <span className="text-base">🧒</span>
                      <span>찍은 친구들: <strong className="text-[#5D4037]">{customTexts.names}</strong></span>
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <span className="text-base">📅</span>
                    <span>추억 쌓은 날: <strong className="text-[#5D4037]">{customTexts.date}</strong></span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons list */}
              <div className="space-y-3">
                {/* Download Button */}
                {renderedImageUrl && (
                  <a
                    id="download-four-cut"
                    href={renderedImageUrl}
                    download={`${customTexts.banner || '우리반네컷'}.png`}
                    onClick={() => playCutePop()}
                    className="w-full py-4 px-6 bg-[#F06292] hover:bg-[#E91E63] text-white font-black text-xl rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 border-b-4 border-[#C2185B] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download size={22} className="stroke-[2.5]" />
                    컴퓨터에 사진 저장하기!
                  </a>
                )}

                {/* Print Button */}
                <button
                  id="print-four-cut"
                  type="button"
                  onClick={handlePrint}
                  className="w-full py-3.5 px-6 bg-white hover:bg-[#FFFBEB] text-[#5D4037] font-black text-lg rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 border-2 border-[#FDE68A] border-b-4 border-b-[#FFD54F] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer size={20} className="text-[#FF8A65]" />
                  종이로 인쇄하기 (프린터)
                </button>
              </div>

              {/* Start Over Button */}
              <div className="border-t-4 border-[#FDE68A] pt-5 text-center">
                <button
                  id="start-over"
                  type="button"
                  onClick={() => { playCutePop(); onReset(); }}
                  className="w-full md:w-auto py-3 px-8 bg-[#FFD54F] hover:bg-[#FFC107] text-[#5D4037] font-black text-lg rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 border-4 border-white flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RefreshCw size={18} className="animate-spin-slow" />
                  새로운 사진 또 찍기! 🔄
                </button>
                <p className="text-[11px] text-[#A1887F] font-bold mt-2">
                  * 다른 친구들도 차례차례 이쁜 사진을 찍어보아요!
                </p>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
