/**
 * Uso: npx tsx tools/importWikiGifts.ts tools/source/<export-de-personagens>.xml
 * Lê um export XML da wiki (Special:Export) com as páginas dos personagens e a página "Gifts"
 * e gera src/data/gifts.json + relatório.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseExport } from '../src/tools/wikiCrops';
import { parseGiftsPage, parseVillagerPage } from '../src/tools/wikiGifts';
import { sourceOf } from '../src/tools/wikiCrops';
import { TASTES, type VillagerGifts } from '../src/utils/gifts';

const input = process.argv[2];
if (!input) {
  console.error('Informe o caminho do XML.');
  process.exit(2);
}

const pages = parseExport(readFileSync(input, 'utf8'));
const giftsPage = pages.find((p) => p.title === 'Gifts');
if (!giftsPage) {
  console.error('Página "Gifts" não encontrada no export.');
  process.exit(1);
}
const uni = parseGiftsPage(giftsPage);
if (!uni) {
  console.error('Não consegui ler os gostos universais da página Gifts.');
  process.exit(1);
}

const villagers: VillagerGifts[] = [];
const rejected: string[] = [];
const warned: string[] = [];
for (const page of pages) {
  if (page.title === 'Gifts' || page.title.includes(':')) continue;
  const r = parseVillagerPage(page);
  if (r.ok) {
    villagers.push(r.value);
    if (r.warnings.length) warned.push(`${page.title}: ${r.warnings.join('; ')}`);
  } else rejected.push(`${r.title}: ${r.reason}`);
}
villagers.sort((a, b) => a.name.localeCompare(b.name));

const out = {
  _licenca:
    'Dados extraídos da Stardew Valley Wiki (Fandom), conteúdo sob CC BY-SA (padrão da Fandom: 3.0). Cada personagem traz a página de origem e o histórico de autores. Este arquivo é uma adaptação e deve continuar sob CC BY-SA.',
  _origem: 'https://stardewvalley.fandom.com/wiki/Stardew_Valley_Wiki',
  _exportadoDe: input.split('/').pop(),
  _aviso: 'Dados de wiki editada por comunidade e em formatos variados: confira antes de publicar.',
  universalSource: sourceOf(giftsPage),
  universal: uni.universal,
  exceptions: uni.exceptions,
  villagers,
};
writeFileSync('src/data/gifts.json', JSON.stringify(out, null, 2) + '\n');

console.log(`${pages.length} páginas lidas; ${villagers.length} personagens; ${rejected.length} sem dados de presentes.\n`);
console.log('Universais:', TASTES.map((t) => `${t}=${uni.universal[t].length}`).join(' '));
console.log('Exceções (itens):', Object.keys(uni.exceptions).length);
console.log('\npersonagem | ' + TASTES.join(' | ') + ' | grupos');
for (const v of villagers) {
  console.log(
    `${v.name} | ${TASTES.map((t) => v.tastes[t].length).join(' | ')} | ${TASTES.map((t) => v.groups[t].length).join('/')}`,
  );
}
console.log('\nAvisos da página Gifts:');
for (const w of uni.warnings) console.log(' - ' + w);
console.log('\nAvisos de personagens:');
for (const w of warned) console.log(' - ' + w);
console.log('\nSem dados (ignoradas):');
console.log(' ' + rejected.map((r) => r.split(':')[0]).join(', '));
