import type { Country } from '../types/country';
import type { PaintingQuizItem } from '../types/painting';
import type { QuizMedia } from '../types/quiz-ui';

export function quizMediaFromCountry(country: Country | null): QuizMedia | null {
  if (!country) return null;

  return {
    imageUrl: country.flag_url,
    title: country.name,
    alt: `Изображение: ${country.name}`,
  };
}

export function quizMediaFromPainting(painting: PaintingQuizItem | null): QuizMedia | null {
  if (!painting) return null;

  return {
    imageUrl: painting.imageUrl,
    title: painting.title,
    alt: `Картина: ${painting.title}`,
  };
}
