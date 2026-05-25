import { describe, expect, it } from 'vitest';
import { PaintingArtistMode } from '../game-modes/art/PaintingArtistMode';
import { PaintingsAPI } from '../services/PaintingsAPI';

describe('PaintingArtistMode', () => {
  it('Should provide offline pool of at least 150 paintings with known artists', async () => {
    const api = new PaintingsAPI();
    await api.loadPaintings();

    expect(api.getPaintings().length).toBeGreaterThanOrEqual(150);
    expect(api.getUniqueArtists().length).toBeGreaterThanOrEqual(40);
  });

  it('Should show painting image and four artist options', async () => {
    const api = new PaintingsAPI();
    await api.loadPaintings();

    const mode = new PaintingArtistMode(api);
    await mode.startGame();

    const state = mode.getState();

    expect(state.quizMedia?.imageUrl).toMatch(/^\/paintings\//);
    expect(state.options).toHaveLength(4);
    expect(state.correctAnswer).toBeTruthy();
    expect(state.options).toContain(state.correctAnswer);
  });
});
