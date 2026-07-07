import { FrameTemplate, StickerPreset } from '../types';

export const FRAME_TEMPLATES: FrameTemplate[] = [
  {
    id: 'yellow-sunshine',
    name: '햇살 노랑반 ☀️',
    bgColor: 'bg-yellow-100',
    hexColor: '#FEF9C3',
    textColor: 'text-amber-800',
    hexTextColor: '#92400E',
    borderColor: 'border-yellow-200',
    accentColor: 'bg-amber-400',
    bannerText: '햇살 가득 우리반 ☀️',
    emojiLeft: '☀️',
    emojiRight: '🌻',
    decorations: ['sun', 'cloud', 'sparkle']
  },
  {
    id: 'pink-love',
    name: '달콤 사랑반 🍓',
    bgColor: 'bg-pink-100',
    hexColor: '#FCE7F3',
    textColor: 'text-pink-800',
    hexTextColor: '#9D174D',
    borderColor: 'border-pink-200',
    accentColor: 'bg-pink-400',
    bannerText: '사랑 듬뿍 우리반 💖',
    emojiLeft: '🌸',
    emojiRight: '💖',
    decorations: ['heart', 'strawberry', 'ribbon']
  },
  {
    id: 'green-sprout',
    name: '초록 새싹반 🌱',
    bgColor: 'bg-emerald-100',
    hexColor: '#D1FAE5',
    textColor: 'text-emerald-800',
    hexTextColor: '#065F46',
    borderColor: 'border-emerald-200',
    accentColor: 'bg-emerald-400',
    bannerText: '쑥쑥 자라는 새싹반 🌱',
    emojiLeft: '🌱',
    emojiRight: '🍀',
    decorations: ['leaf', 'sprout', 'clover']
  },
  {
    id: 'blue-ocean',
    name: '푸른 바다반 🐳',
    bgColor: 'bg-sky-100',
    hexColor: '#E0F2FE',
    textColor: 'text-sky-800',
    hexTextColor: '#075985',
    borderColor: 'border-sky-200',
    accentColor: 'bg-sky-400',
    bannerText: '퐁당 푸른 바다반 🐳',
    emojiLeft: '🐳',
    emojiRight: '🐚',
    decorations: ['bubble', 'fish', 'waves']
  },
  {
    id: 'purple-dream',
    name: '반짝 은하반 🌠',
    bgColor: 'bg-purple-100',
    hexColor: '#F3E8FF',
    textColor: 'text-purple-800',
    hexTextColor: '#6B21A8',
    borderColor: 'border-purple-200',
    accentColor: 'bg-purple-400',
    bannerText: '꿈꾸는 우주 은하반 🌠',
    emojiLeft: '🌌',
    emojiRight: '✨',
    decorations: ['star', 'moon', 'rocket']
  },
  {
    id: 'orange-safari',
    name: '해피 주황반 🦁',
    bgColor: 'bg-orange-100',
    hexColor: '#FFEDD5',
    textColor: 'text-orange-800',
    hexTextColor: '#9A3412',
    borderColor: 'border-orange-200',
    accentColor: 'bg-orange-400',
    bannerText: '신나는 해피 주황반 🦁',
    emojiLeft: '🦁',
    emojiRight: '🎈',
    decorations: ['paw', 'tree', 'balloon']
  }
];

export const STICKER_PRESETS: StickerPreset[] = [
  // Animals
  { id: 'st-cat', emoji: '🐱', label: '야옹이', category: 'animal' },
  { id: 'st-dog', emoji: '🐶', label: '멍멍이', category: 'animal' },
  { id: 'st-bear', emoji: '🐻', label: '곰돌이', category: 'animal' },
  { id: 'st-rabbit', emoji: '🐰', label: '토끼', category: 'animal' },
  { id: 'st-tiger', emoji: '🐯', label: '호랑이', category: 'animal' },
  { id: 'st-frog', emoji: '🐸', label: '개구리', category: 'animal' },
  { id: 'st-panda', emoji: '🐼', label: '판다', category: 'animal' },
  { id: 'st-lion', emoji: '🦁', label: '사자', category: 'animal' },
  { id: 'st-dino', emoji: '🦖', label: '공룡', category: 'animal' },

  // Sparkles & Deco
  { id: 'st-heart', emoji: '💖', label: '하트', category: 'sparkle' },
  { id: 'st-star', emoji: '⭐', label: '별', category: 'sparkle' },
  { id: 'st-sparkles', emoji: '✨', label: '반짝이', category: 'sparkle' },
  { id: 'st-rainbow', emoji: '🌈', label: '무지개', category: 'sparkle' },
  { id: 'st-balloon', emoji: '🎈', label: '풍선', category: 'sparkle' },
  { id: 'st-ribbon', emoji: '🎀', label: '리본', category: 'sparkle' },
  { id: 'st-clover', emoji: '🍀', label: '클로버', category: 'sparkle' },
  { id: 'st-flower', emoji: '🌸', label: '꽃', category: 'sparkle' },
  { id: 'st-sun', emoji: '🌻', label: '해바라기', category: 'sparkle' },

  // Cute Stuff
  { id: 'st-crown', emoji: '👑', label: '왕관', category: 'cute' },
  { id: 'st-glasses', emoji: '🕶️', label: '안경', category: 'cute' },
  { id: 'st-cap', emoji: '🎓', label: '학사모', category: 'cute' },
  { id: 'st-palette', emoji: '🎨', label: '팔레트', category: 'cute' },
  { id: 'st-music', emoji: '🎵', label: '음표', category: 'cute' },
  { id: 'st-magic', emoji: '🪄', label: '요술봉', category: 'cute' },

  // Food
  { id: 'st-candy', emoji: '🍭', label: '사탕', category: 'food' },
  { id: 'st-icecream', emoji: '🍦', label: '아이스크림', category: 'food' },
  { id: 'st-cookie', emoji: '🍪', label: '쿠키', category: 'food' },
  { id: 'st-pizza', emoji: '🍕', label: '피자', category: 'food' },
  { id: 'st-cake', emoji: '🍰', label: '케이크', category: 'food' },
  { id: 'st-melon', emoji: '🍉', label: '수박', category: 'food' }
];

export const CLASS_NAME_PRESETS = [
  '햇살반 ☀️',
  '새싹반 🌱',
  '꽃잎반 🌸',
  '하늘반 ☁️',
  '바다반 🐳',
  '은하수반 🌠',
  '숲속반 🌳',
  '딸기반 🍓',
  '사랑반 💖'
];
