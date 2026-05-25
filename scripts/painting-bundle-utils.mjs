import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PAINTINGS_DIR = path.join(__dirname, '..', 'public', 'paintings');
export const BUNDLE_FILE = path.join(__dirname, '..', 'src', 'data', 'paintings.ru.json');

const REJECTED_ARTIST_PATTERNS = [
  /^unidentified\b/i,
  /^unknown\b/i,
  /^anonymous\b/i,
  /\bunidentified artist\b/i,
  /\bunknown artist\b/i,
  /\bartist unknown\b/i,
];

export function isValidArtist(artist) {
  const name = artist?.trim();

  if (!name) return false;

  return !REJECTED_ARTIST_PATTERNS.some((pattern) => pattern.test(name));
}

export function imageExtension(remoteUrl) {
  try {
    const ext = path.extname(new URL(remoteUrl).pathname);
    return ext && ext.length <= 5 ? ext : '.jpg';
  } catch {
    return '.jpg';
  }
}

export function localImagePath(id, remoteUrl) {
  return `/paintings/${id}${imageExtension(remoteUrl)}`;
}

export async function downloadImage(url, destPath) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Image download failed: ${res.status} ${url}`);
  }

  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, Buffer.from(await res.arrayBuffer()));
}

export async function attachLocalImages(items) {
  await fs.mkdir(PAINTINGS_DIR, { recursive: true });

  const result = [];

  for (const item of items) {
    if (!isValidArtist(item.artist)) {
      console.log(`skip artist: ${item.id} — ${item.artist}`);
      continue;
    }

    const remoteUrl =
      item.imageUrl?.startsWith('http') ? item.imageUrl : item.remoteImageUrl ?? null;

    if (!remoteUrl) {
      const localPath = item.imageUrl?.startsWith('/paintings/') ? item.imageUrl : null;

      if (!localPath) continue;

      const filePath = path.join(PAINTINGS_DIR, path.basename(localPath));
      const exists = await fs.stat(filePath).then(() => true).catch(() => false);

      if (exists) {
        result.push(item);
      }

      continue;
    }

    const imageUrl = localImagePath(item.id, remoteUrl);
    const filePath = path.join(PAINTINGS_DIR, path.basename(imageUrl));

    try {
      const exists = await fs.stat(filePath).then(() => true).catch(() => false);

      if (!exists) {
        console.log(`download ${item.id}…`);
        await downloadImage(remoteUrl, filePath);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      result.push({
        id: item.id,
        imageUrl,
        title: item.title,
        artist: item.artist,
        date: item.date,
        source: item.source,
      });
    } catch (error) {
      console.warn(`skip image ${item.id}:`, error.message);
    }
  }

  return result;
}

export async function writeBundle(items) {
  await fs.mkdir(path.dirname(BUNDLE_FILE), { recursive: true });
  await fs.writeFile(BUNDLE_FILE, JSON.stringify(items, null, 2), 'utf-8');
}
