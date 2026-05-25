import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import QuizRevealAnswersButton from '../components/quiz/QuizRevealAnswersButton.vue';

describe('QuizRevealAnswersButton', () => {
  it('Should emit the next visibility value when enabled', async () => {
    const wrapper = mount(QuizRevealAnswersButton, {
      props: {
        modelValue: false,
        disabled: false,
      },
    });

    await wrapper.get('button').trigger('click');

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
  });

  it('Should disable the hide button while waiting for next question', async () => {
    const wrapper = mount(QuizRevealAnswersButton, {
      props: {
        modelValue: true,
        disabled: true,
      },
    });

    const button = wrapper.get('button');
    await button.trigger('click');

    expect(button.attributes('disabled')).toBeDefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});
