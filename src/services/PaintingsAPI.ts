import paintingsBundle from '../data/paintings.ru.json';
import type { PaintingQuizItem } from '../types/painting';

const REJECTED_ARTIST = /^(unidentified|unknown|anonymous)\b/i;

function isPlayablePainting(item: PaintingQuizItem): boolean {
  const artist = item.artist?.trim();

  if (!artist || !item.imageUrl || !item.title) return false;

  return !REJECTED_ARTIST.test(artist) && !/\bunidentified artist\b/i.test(artist);
}

const paintings = (paintingsBundle as PaintingQuizItem[]).filter(isPlayablePainting);

/** Офлайн-пул для режима «Угадай художника» (вопросы генерируются из этого JSON). */
export const PAINTINGS_POOL_SIZE = paintings.length;

export class PaintingsAPI {
  private ready = paintings.length > 0;

  isReady(): boolean {
    return this.ready;
  }

  async loadPaintings(): Promise<void> {
    if (!this.ready) {
      throw new Error('paintings.ru.json is empty — run npm run build:paintings');
    }
  }

  getPaintings(): PaintingQuizItem[] {
    return [...paintings];
  }

  getUniqueArtists(): string[] {
    return [...new Set(paintings.map((item) => item.artist))];
  }

  getRandomPainting(excludeIds = new Set<string>()): PaintingQuizItem {
    const available = paintings.filter((item) => !excludeIds.has(item.id));

    if (!available.length) {
      throw new Error('No paintings available');
    }

    return available[Math.floor(Math.random() * available.length)];
  }

  getRandomArtists(count: number, excludeArtist: string): string[] {
    const artists = this.getUniqueArtists().filter((name) => name !== excludeArtist);

    if (artists.length < count) {
      throw new Error('Not enough unique artists in paintings bundle');
    }

    const picked = new Set<string>();

    while (picked.size < count) {
      const artist = artists[Math.floor(Math.random() * artists.length)];
      picked.add(artist);
    }

    return [...picked];
  }
}
