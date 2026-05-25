import fs from 'node:fs/promises';
import { BUNDLE_FILE, isValidArtist } from './painting-bundle-utils.mjs';

const MIN_PAINTINGS = 150;
const MIN_ARTISTS = 40;

async function main() {
  const items = JSON.parse(await fs.readFile(BUNDLE_FILE, 'utf-8'));
  const artists = new Set(items.map((item) => item.artist));
  const localImages = items.filter((item) => item.imageUrl?.startsWith('/paintings/'));
  const badArtists = items.filter((item) => !isValidArtist(item.artist));

  console.log(`paintings: ${items.length}`);
  console.log(`artists: ${artists.size}`);
  console.log(`local images: ${localImages.length}`);
  console.log(`invalid artists: ${badArtists.length}`);

  if (items.length < MIN_PAINTINGS) {
    throw new Error(`Need at least ${MIN_PAINTINGS} paintings`);
  }

  if (artists.size < MIN_ARTISTS) {
    throw new Error(`Need at least ${MIN_ARTISTS} unique artists`);
  }

  if (badArtists.length > 0) {
    throw new Error('Bundle contains rejected artist names');
  }

  console.log('OK');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
