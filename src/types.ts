export type AppStep = 'WELCOME' | 'PREPARE' | 'SHOOTING' | 'SELECTION' | 'EDIT' | 'FINAL';

export interface CapturedPhoto {
  id: string;
  url: string; // Base64 data URL
  timestamp: number;
}

export interface StickerPreset {
  id: string;
  emoji: string;
  label: string;
  category: 'animal' | 'cute' | 'sparkle' | 'food';
}

export interface ActiveSticker {
  id: string;
  emoji: string;
  x: number; // 0 to 100 (percentage of the frame width)
  y: number; // 0 to 100 (percentage of the frame height)
  scale: number;
  rotation: number; // degrees
}

export interface FrameTemplate {
  id: string;
  name: string;
  bgColor: string; // Tailwind bg class
  hexColor: string; // Hex code for canvas rendering
  textColor: string; // Tailwind text class
  hexTextColor: string; // Hex text code for canvas
  borderColor: string;
  accentColor: string;
  bannerText: string;
  emojiLeft: string;
  emojiRight: string;
  decorations: string[]; // List of preset decorative SVG styles/labels
}
