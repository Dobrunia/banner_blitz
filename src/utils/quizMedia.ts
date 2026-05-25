import type { Country } from '../types/country';
import type { QuizMedia } from '../types/quiz-ui';

export function quizMediaFromCountry(country: Country | null): QuizMedia | null {
  if (!country) return null;

  return {
    imageUrl: country.flag_url,
    title: country.name,
    alt: `Изображение: ${country.name}`,
  };
}
