import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CountriesAPI } from '../services/CountriesAPI';
import { TimeMode } from '../game-modes/flags/TimeMode';
import type { Country } from '../types/country';

describe('TimeMode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Should pause the timer while waiting for the next question', async () => {
    const api = new CountriesAPI();
    await api.loadCountries();
    const mode = new TimeMode(api, 30);

    await mode.startGame();
    await mode.beginGame();

    const timeBeforeAnswer = mode.getTimeLeft();
    const correct = mode.getState().correctAnswer as Country;

    mode.answerQuestion(correct);
    expect(mode.getState().currentState).toBe('Result');

    vi.advanceTimersByTime(5000);
    expect(mode.getTimeLeft()).toBe(timeBeforeAnswer);

    mode.nextQuestion();
    vi.advanceTimersByTime(1000);
    expect(mode.getTimeLeft()).toBe(timeBeforeAnswer - 1);
  });
});
