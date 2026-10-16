/**
 * Uso: npx tsx tools/importWikiVillagers.ts tools/source/<export-de-personagens>.xml
 * Lê a caixa de informações (Starbox villager) de cada personagem e gera src/data/villagers.json.
 * Dados que a wiki traz errados ou que faltam são corrigidos em tools/villagerOverrides.json (marcados manual).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseExport } from '../src/tools/wikiCrops';
import { parseVillagerInfo } from '../src/tools/wikiVillagers';
import type { Villager } from '../src/utils/villagers';

const input = process.argv[2];
if (!input) {
  console.error('Informe o caminho do XML.');
  process.exit(2);
}
const gifts = JSON.parse(readFileSync('src/data/gifts.json', 'utf8')) as { villagers: { name: string }[] };
const wanted = new Set(gifts.villagers.map((v) => v.name));
const overrides = JSON.parse(readFileSync('tools/villagerOverrides.json', 'utf8')) as Record<string, Partial<Villager>>;

const found = new Map<string, Villager>();
const problems: string[] = [];
for (const page of parseExport(readFileSync(input, 'utf8'))) {
  if (!wanted.has(page.title)) continue;
  let r = parseVillagerInfo(page);
  const fix = overrides[page.title]?.birthday;
  if (!r.ok && fix) {
    // A wiki trouxe um aniversário impossível: troca só a data e reaproveita o resto da página.
    const season = fix.season[0]?.toUpperCase() + fix.season.slice(1);
    problems.push(`${page.title}: ${r.reason} -> aniversário corrigido à mão (${season} ${fix.day})`);
    r = parseVillagerInfo({ ...page, text: page.text.replace(/\|\s*birthday\s*=.*/, `|birthday = ${season} ${fix.day}`) });
  }
  if (r.ok) {
    found.set(page.title, r.value);
    if (r.warnings.length) problems.push(`${page.title}: ${r.warnings.join('; ')}`);
  } else problems.push(`${page.title}: REJEITADO — ${r.reason}`);
}
for (const [name, o] of Object.entries(overrides)) {
  const base = found.get(name);
  found.set(name, { ...(base ?? ({ name, family: [], friends: [], romanceable: false, location: '', address: '' } as unknown as Villager)), ...o, name, manual: true });
}
const villagers = [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(
  'src/data/villagers.json',
  JSON.stringify(
    {
      _licenca:
        'Dados extraídos da Stardew Valley Wiki (Fandom), conteúdo sob CC BY-SA (padrão da Fandom: 3.0). Adaptação; deve continuar sob CC BY-SA. Entradas com "manual": true foram corrigidas/complementadas à mão.',
      _origem: 'https://stardewvalley.fandom.com/wiki/Stardew_Valley_Wiki',
      _exportadoDe: input.split('/').pop(),
      villagers,
    },
    null,
    2,
  ) + '\n',
);
console.log(`${villagers.length} moradores gravados.`);
if (problems.length) console.log('Atenção:\n' + problems.map((p) => '  - ' + p).join('\n'));
