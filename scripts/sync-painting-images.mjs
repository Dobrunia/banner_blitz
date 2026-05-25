import fs from 'node:fs/promises';
import {
  attachLocalImages,
  BUNDLE_FILE,
  writeBundle,
} from './painting-bundle-utils.mjs';

async function main() {
  const raw = await fs.readFile(BUNDLE_FILE, 'utf-8');
  const items = JSON.parse(raw);

  console.log(`bundle: ${items.length} items`);
  const synced = await attachLocalImages(items);

  await writeBundle(synced);
  console.log(`saved ${synced.length} → ${BUNDLE_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
