import { describe, expect, it } from 'vitest';
import { ClassicMode } from '../game-modes/flags/ClassicMode';
import type { CountriesAPI } from '../services/CountriesAPI';
import type { Country } from '../types/country';

const countries: Country[] = [
  country('Россия'),
  country('США'),
  country('Франция'),
  country('Япония'),
];

describe('ClassicMode', () => {
  it('Should increment correct score when answer matches', async () => {
    const mode = new ClassicMode(createCountriesAPI(countries));

    await mode.startGame();
    const correctAnswer = mode.getState().correctAnswer;

    expect(correctAnswer).not.toBeNull();
    const result = mode.answerQuestion(correctAnswer as Country);

    expect(result?.isCorrect).toBe(true);
    expect(mode.getGameStats().score.correct).toBe(1);
    expect(mode.getGameStats().score.total).toBe(1);
  });

  it('Should ignore a second answer for the same question', async () => {
    const mode = new ClassicMode(createCountriesAPI(countries));

    await mode.startGame();
    const correctAnswer = mode.getState().correctAnswer as Country;

    mode.answerQuestion(correctAnswer);
    const secondResult = mode.answerQuestion(correctAnswer);

    expect(secondResult).toBeNull();
    expect(mode.getGameStats().score.total).toBe(1);
  });
});

function createCountriesAPI(items: Country[]): CountriesAPI {
  return {
    async loadCountries() {
      return items;
    },
    getRandomCountry() {
      return items[0];
    },
    getRandomCountries(count: number, exclude: Country | null = null) {
      return items.filter((item) => item.name !== exclude?.name).slice(0, count);
    },
    getCountries() {
      return items;
    },
    isReady() {
      return true;
    },
  } as CountriesAPI;
}

function country(name: string): Country {
  return {
    name,
    region: 'Европа',
    flag_url: `/flags/${name}.png`,
    flag_svg: `/flags/${name}.png`,
    flag_file: `${name}.png`,
    code: name.slice(0, 2).toUpperCase(),
    capital: `${name} Capital`,
    language: 'Test',
    population: '1',
  };
}
