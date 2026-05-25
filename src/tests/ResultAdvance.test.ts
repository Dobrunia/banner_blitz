import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuizResultAdvance from '../components/quiz/QuizResultAdvance.vue';

describe('QuizResultAdvance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Should auto-advance after three seconds when countdown is enabled', async () => {
    const wrapper = mount(QuizResultAdvance, {
      props: { active: true, autoCountdown: true },
    });

    vi.advanceTimersByTime(3000);

    expect(wrapper.emitted('next')).toHaveLength(1);
  });

  it('Should not auto-advance in pause mode', async () => {
    const wrapper = mount(QuizResultAdvance, {
      props: { active: true, autoCountdown: false },
    });

    vi.advanceTimersByTime(5000);

    expect(wrapper.emitted('next')).toBeUndefined();
    expect(wrapper.text()).toContain('Пауза');
  });
});
