import fs from 'node:fs/promises';
import {
  attachLocalImages,
  BUNDLE_FILE,
  isValidArtist,
  writeBundle,
} from './painting-bundle-utils.mjs';

/** Минимум картин в офлайн-бандле для квиза. */
const MIN_TARGET = 150;
const MAX_ITEMS = 200;
const MAX_IDS_PER_QUERY = 200;
const OBJECT_DELAY_MS = 120;
const SEARCH_DELAY_MS = 400;
const RETRY_DELAY_MS = 3000;

const DEPARTMENT_IDS = [
  11, // European Paintings
  21, // Modern Art
  1, // American Decorative Arts — часть живописи
  9, // Drawings and Prints — пропускаем на объекте
];

const SEARCH_TERMS = [
  'european painting',
  'portrait',
  'landscape',
  'still life',
  'impressionism',
  'renaissance',
  'baroque',
  'van gogh',
  'monet',
  'rembrandt',
  'degas',
  'cezanne',
  'vermeer',
  'raphael',
  'michelangelo',
  'leonardo',
  'picasso',
  'renoir',
  'manet',
  'gauguin',
  'matisse',
  'klimt',
  'botticelli',
  'caravaggio',
  'rubens',
  'velazquez',
  'goya',
  'turner',
  'constable',
  'whistler',
  'sargent',
  'hopper',
  'okeeffe',
  'pollock',
  'warhol',
  'bellini',
  'titian',
  'bosch',
  'bruegel',
  'ingres',
  'delacroix',
  'courbet',
  'millet',
  'pissarro',
  'sisley',
  'morisot',
  'toulouse-lautrec',
  'modigliani',
  'chagall',
  'kandinsky',
  'mondrian',
  'dali',
  'magritte',
  'friedrich',
  'watteau',
  'boucher',
  'fragonard',
  'david',
  'greuze',
  'el greco',
  'murillo',
  'zurbaran',
  'hals',
  'vermeer',
  'cuyp',
  'rousseau',
  'signac',
  'seurat',
];

const FETCH_HEADERS = {
  'User-Agent': 'flag-quiz-edu/1.0 (offline art quiz bundle)',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, retries = 5) {
  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, { headers: FETCH_HEADERS });

      if (res.status === 403 || res.status === 429) {
        const wait = RETRY_DELAY_MS * (attempt + 1);
        console.warn(`rate limit ${res.status}, wait ${wait}ms…`);
        await sleep(wait);
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      return res.json();
    } catch (error) {
      lastError = error;
      await sleep(RETRY_DELAY_MS);
    }
  }

  throw lastError ?? new Error(`Failed: ${url}`);
}

function isPaintingRecord(item) {
  const classification = (item.classification ?? '').toLowerCase();
  const department = item.department ?? '';
  const medium = (item.medium ?? '').toLowerCase();

  if (classification.includes('paintings')) return true;
  if (department.includes('Paintings')) return true;
  if (department === 'Modern and Contemporary Art') return true;
  if (
    medium.includes('oil') ||
    medium.includes('canvas') ||
    medium.includes('watercolor') ||
    medium.includes('tempera') ||
    medium.includes('acrylic')
  ) {
    return true;
  }

  return department === 'European Paintings';
}

function isValidTitle(title) {
  const value = title?.trim();

  if (!value || value.length < 4) return false;
  if (/^painting$/i.test(value)) return false;
  if (/^untitled$/i.test(value)) return false;

  return true;
}

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

async function loadExistingBundle() {
  try {
    const raw = await fs.readFile(BUNDLE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function collectObjectIds() {
  const ids = new Set();

  for (const departmentId of DEPARTMENT_IDS) {
    if (departmentId === 9) continue;

    try {
      const url =
        `https://collectionapi.metmuseum.org/public/collection/v1/search` +
        `?hasImages=true&isPublicDomain=true&departmentId=${departmentId}`;

      const data = await fetchJson(url);

      for (const id of data.objectIDs?.slice(0, MAX_IDS_PER_QUERY) ?? []) {
        ids.add(id);
      }

      console.log(`department ${departmentId}: ${data.objectIDs?.length ?? 0} hits`);
      await sleep(SEARCH_DELAY_MS);
    } catch (error) {
      console.warn(`department ${departmentId} failed:`, error.message);
    }
  }

  for (const term of SEARCH_TERMS) {
    try {
      const url =
        `https://collectionapi.metmuseum.org/public/collection/v1/search` +
        `?hasImages=true&isPublicDomain=true&q=${encodeURIComponent(term)}`;

      const data = await fetchJson(url);

      for (const id of data.objectIDs?.slice(0, MAX_IDS_PER_QUERY) ?? []) {
        ids.add(id);
      }

      console.log(`search "${term}": ${data.objectIDs?.length ?? 0} hits`);
      await sleep(SEARCH_DELAY_MS);
    } catch (error) {
      console.warn(`search "${term}" failed:`, error.message);
    }
  }

  return ids;
}

async function main() {
  const existing = await loadExistingBundle();
  const byKey = new Map(existing.map((item) => [item.id, item]));

  console.log(`existing bundle: ${existing.length}`);

  const ids = shuffle([...(await collectObjectIds())]);
  console.log(`candidate object IDs: ${ids.length}`);

  let processed = 0;
  let added = 0;

  for (const id of ids) {
    if (byKey.size >= MAX_ITEMS) break;

    const key = `met-${id}`;
    if (byKey.has(key)) continue;

    try {
      const item = await fetchJson(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
      );

      processed++;

      if (!isPaintingRecord(item)) continue;

      const remoteImageUrl = item.primaryImageSmall || item.primaryImage;
      const title = item.title?.trim();
      const artist = item.artistDisplayName?.trim();

      if (!remoteImageUrl || !title || !artist) continue;
      if (!isValidArtist(artist) || !isValidTitle(title)) continue;

      byKey.set(key, {
        id: key,
        remoteImageUrl,
        title,
        artist,
        date: item.objectDate?.trim() || undefined,
        source: 'met',
      });

      added++;

      if (added % 10 === 0) {
        console.log(`collected ${byKey.size} (${added} new)…`);
      }

      if (byKey.size >= MIN_TARGET && added >= MIN_TARGET - existing.length) {
        // набрали цель — можно остановиться раньше
        if (byKey.size >= MAX_ITEMS) break;
      }
    } catch {
      // skip
    }

    await sleep(OBJECT_DELAY_MS);
  }

  const candidates = [...byKey.values()].slice(0, MAX_ITEMS);
  console.log(
    `met records: ${candidates.length} (processed ${processed}), downloading images…`
  );

  const synced = await attachLocalImages(candidates);
  await writeBundle(synced);

  const artists = new Set(synced.map((item) => item.artist));
  console.log(`Saved ${synced.length} paintings, ${artists.size} unique artists`);

  if (synced.length < MIN_TARGET) {
    console.warn(`⚠️ Less than ${MIN_TARGET}. Re-run later: npm run build:paintings`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
