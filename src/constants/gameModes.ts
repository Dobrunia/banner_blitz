import type { GameModeId } from '../types/game';

export const GEOGRAPHY_MODE_IDS = [
  'classic',
  'time',
  'survival',
  'flags',
  'region',
  'capital',
  'learning',
] as const satisfies readonly GameModeId[];

export const ART_MODE_IDS = ['art-guess-artist'] as const satisfies readonly GameModeId[];

export const GEOGRAPHY_MODE_LABELS: Record<(typeof GEOGRAPHY_MODE_IDS)[number], string> = {
  classic: '📚 Классический',
  time: '⏰ На время',
  survival: '❤️ На выживание',
  flags: '🏳️ 4 Флага',
  region: '🌍 Регионы',
  capital: '🏛️ Столицы',
  learning: '📖 Обучение',
};

export const ART_MODE_LABELS: Record<(typeof ART_MODE_IDS)[number], string> = {
  'art-guess-artist': '🎨 Угадай художника',
};

export const MODE_LABELS: Record<GameModeId, string> = {
  ...GEOGRAPHY_MODE_LABELS,
  ...ART_MODE_LABELS,
};
