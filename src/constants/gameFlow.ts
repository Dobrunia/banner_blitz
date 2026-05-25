import type { GameModeId } from '../types/game';

/** Режимы, где ответы можно скрыть до выбора (???). */
export const MODES_WITH_ANSWER_TOGGLE: readonly GameModeId[] = [
  'classic',
  'survival',
  'region',
  'capital',
];

/** После ответа — автопереход 3‑2‑1 (фитиль). Исключения: time, learning. */
export const MODES_WITH_AUTO_COUNTDOWN: readonly GameModeId[] = [
  'classic',
  'survival',
  'flags',
  'region',
  'capital',
  'art-guess-artist',
];

export function usesAnswerToggle(mode: GameModeId): boolean {
  return MODES_WITH_ANSWER_TOGGLE.includes(mode);
}

export function usesAutoCountdown(mode: GameModeId): boolean {
  return MODES_WITH_AUTO_COUNTDOWN.includes(mode);
}
