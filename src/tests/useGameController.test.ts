import { describe, expect, it } from 'vitest';
import { createGameController } from '../composables/useGameController';
import type { Country } from '../types/country';

describe('useGameController', () => {
  it('Should start on welcome screen until a mode is selected', async () => {
    const controller = createGameController();

    await controller.init();

    expect(controller.gamePhase.value).toBe('welcome');
    expect(controller.currentMode.value).toBeNull();
  });

  it('Should move from answer to result and then to the next question', async () => {
    const controller = createGameController();

    await controller.init();
    await controller.switchMode('classic');
    const firstQuestion = controller.currentQuestion.value;
    const correctAnswer = controller.state.value.correctAnswer as Country;

    controller.answer(correctAnswer);

    expect(controller.gamePhase.value).toBe('result');
    expect(controller.lastResult.value?.isCorrect).toBe(true);

    controller.next();

    expect(controller.gamePhase.value).toBe('question');
    expect(controller.currentQuestion.value?.name).not.toBe(firstQuestion?.name);
  });

  it('Should switch modes and expose region selection phase', async () => {
    const controller = createGameController();

    await controller.init();
    expect(controller.gamePhase.value).toBe('welcome');
    await controller.switchMode('region');

    expect(controller.currentMode.value).toBe('region');
    expect(controller.gamePhase.value).toBe('region-selection');
  });
});
