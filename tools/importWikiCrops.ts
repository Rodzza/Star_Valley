/**
 * Uso: npx tsx tools/importWikiCrops.ts tools/source/<export>.xml
 * Lê um export XML da wiki (Special:Export) e gera src/data/crops.json + relatório.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { applyOverrides, parseCropPage, parseExport, type CropOverride } from '../src/tools/wikiCrops';

const input = process.argv[2];
if (!input) {
  console.error('Informe o caminho do XML.');
  process.exit(2);
}

const pages = parseExport(readFileSync(input, 'utf8'));
const ok: ReturnType<typeof parseCropPage>[] = [];
const rejected: string[] = [];
const crops = [];

for (const page of pages) {
  const r = parseCropPage(page);
  if (r.ok) {
    ok.push(r);
    crops.push(r.value.crop);
  } else rejected.push(`${r.title}: ${r.reason}`);
}

const overridesPath = 'tools/overrides.json';
const overrides: Record<string, CropOverride> = existsSync(overridesPath)
  ? (JSON.parse(readFileSync(overridesPath, 'utf8')) as Record<string, CropOverride>)
  : {};
const finalCrops = applyOverrides(crops, overrides).sort((a, b) => a.name.localeCompare(b.name));

const out = {
  _licenca:
    'Dados extraídos da Stardew Valley Wiki (Fandom), conteúdo sob CC BY-SA (padrão da Fandom: 3.0). Cada item traz a página de origem e o histórico de autores. Este arquivo é uma adaptação e deve continuar sob CC BY-SA.',
  _origem: 'https://stardewvalley.fandom.com/wiki/Stardew_Valley_Wiki',
  _exportadoDe: input.split('/').pop(),
  _aviso: 'Dados de wiki editada por comunidade: confira valores suspeitos antes de publicar.',
  crops: finalCrops,
};
writeFileSync('src/data/crops.json', JSON.stringify(out, null, 2) + '\n');

console.log(`${pages.length} páginas lidas; ${finalCrops.length} culturas completas (${Object.keys(overrides).length} correções manuais); ${rejected.length} recusadas.\n`);
console.log('nome | estações | dias | rebrota | semente | venda | avisos');
for (const r of ok) {
  if (!r.ok) continue;
  const c = r.value.crop;
  console.log(
    `${c.name} | ${c.seasons.join('/')} | ${c.growthDays} | ${c.regrowDays ?? '-'} | ${c.seedPrice} | ${c.sellPrice} | ${r.value.warnings.join('; ') || '-'}`,
  );
}
console.log('\nRecusadas:');
for (const line of rejected) console.log(' - ' + line);
