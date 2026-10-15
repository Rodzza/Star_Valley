import type { Crop, CropSource, Season } from '../utils/crops';

/** Página extraída de um export XML do MediaWiki (Special:Export). */
export interface WikiPage {
  title: string;
  timestamp: string;
  contributor: string;
  text: string;
}

export interface ParsedCrop {
  crop: Crop;
  /** Avisos que não impedem o uso, mas pedem conferência humana. */
  warnings: string[];
}

export type ParseOutcome =
  | { ok: true; value: ParsedCrop }
  | { ok: false; title: string; reason: string };

const WIKI_BASE = 'https://stardewvalley.fandom.com/wiki/';

export function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Lê as páginas de um export XML do MediaWiki. */
export function parseExport(xml: string): WikiPage[] {
  const pages: WikiPage[] = [];
  const blocks = xml.split('<page>').slice(1);
  for (const block of blocks) {
    const title = /<title>([\s\S]*?)<\/title>/.exec(block)?.[1];
    const text = /<text[^>]*>([\s\S]*?)<\/text>/.exec(block)?.[1];
    if (title === undefined || text === undefined) continue;
    const timestamp = /<timestamp>([\s\S]*?)<\/timestamp>/.exec(block)?.[1] ?? '';
    const contributor =
      /<contributor>[\s\S]*?<username>([\s\S]*?)<\/username>/.exec(block)?.[1] ??
      /<contributor>[\s\S]*?<ip>([\s\S]*?)<\/ip>/.exec(block)?.[1] ??
      '';
    pages.push({
      title: decodeEntities(title),
      timestamp,
      contributor: decodeEntities(contributor),
      text: decodeEntities(text),
    });
  }
  return pages;
}

const normalizeKey = (k: string) => k.trim().toLowerCase().replace(/[_\s]+/g, ' ');

/**
 * Extrai os parâmetros do primeiro template cujo nome (sem diferenciar maiúsculas/underscores)
 * comece por um dos prefixos. Respeita chaves aninhadas como {{Icon|Pam}} e links [[a|b]].
 */
export function extractTemplate(text: string, namePrefixes: readonly string[]): Record<string, string> | null {
  const open = /\{\{\s*([^|{}\n]+?)\s*(?=[|}\n])/g;
  let m: RegExpExecArray | null;
  while ((m = open.exec(text)) !== null) {
    const name = normalizeKey(m[1] ?? '');
    if (!namePrefixes.some((p) => name.startsWith(p))) continue;

    let depth = 0;
    let end = -1;
    for (let i = m.index; i < text.length - 1; i++) {
      const pair = text.slice(i, i + 2);
      if (pair === '{{') {
        depth++;
        i++;
      } else if (pair === '}}') {
        depth--;
        i++;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end < 0) return null;

    const body = text.slice(m.index + 2, end - 2);
    const params: Record<string, string> = {};
    let cur = '';
    let brace = 0;
    let bracket = 0;
    const parts: string[] = [];
    for (let i = 0; i < body.length; i++) {
      const c = body[i] as string;
      const two = body.slice(i, i + 2);
      if (two === '{{') { brace++; cur += two; i++; continue; }
      if (two === '}}') { brace--; cur += two; i++; continue; }
      if (two === '[[') { bracket++; cur += two; i++; continue; }
      if (two === ']]') { bracket--; cur += two; i++; continue; }
      if (c === '|' && brace === 0 && bracket === 0) { parts.push(cur); cur = ''; continue; }
      cur += c;
    }
    parts.push(cur);
    for (const part of parts.slice(1)) {
      const eq = part.indexOf('=');
      if (eq < 0) continue;
      params[normalizeKey(part.slice(0, eq))] = part.slice(eq + 1).trim();
    }
    return params;
  }
  return null;
}

const SEASONS: readonly Season[] = ['spring', 'summer', 'fall', 'winter'];

function parseSeasons(value: string | undefined, text: string): Season[] {
  const fromParam = (value ?? '').toLowerCase().replace(/autumn/g, 'fall');
  const found = SEASONS.filter((s) => fromParam.includes(s));
  if (found.length > 0) return found;
  const cats = [...text.matchAll(/\[\[Category:\s*(Spring|Summer|Fall|Winter) crops\s*\]\]/gi)].map((c) =>
    (c[1] as string).toLowerCase(),
  );
  return SEASONS.filter((s) => cats.includes(s));
}

const firstInt = (s: string | undefined, re: RegExp): number | undefined => {
  const m = s ? re.exec(s) : null;
  return m?.[1] !== undefined ? Number(m[1]) : undefined;
};

function proseOf(text: string): string {
  // Texto corrido da página, sem o bloco do template.
  return text.replace(/\{\{[\s\S]*?\}\}/g, ' ').replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1');
}

/**
 * Dias entre colheitas de culturas que rebrotam. "after N days" só vale no campo Growth
 * (no texto corrido ele aparece em frases como "matura após 7 dias").
 */
export function regrowFrom(growthText: string, prose: string): number[] {
  const found: number[] = [];
  const add = (re: RegExp, text: string) => {
    for (const m of text.matchAll(re)) if (m[1] !== undefined) found.push(Number(m[1]));
  };
  add(/after\s+(\d+)(?:st|nd|rd|th)?\s*days?/gi, growthText);
  add(/every\s+(\d+)(?:st|nd|rd|th)?\s*days?/gi, growthText);
  add(/(\d+)\s*days?\s+to\s+regrow/gi, prose);
  add(/every\s+(\d+)(?:st|nd|rd|th)?\s*days?/gi, prose);
  const daily = /every\s?day|everyday|daily/i;
  const keepsDaily = /(?:keeps?|continues?|continuing)\s+(?:to\s+)?produc\w*\s+(?:the\s+\w+\s+)?(?:every\s?day|everyday|daily)/i;
  if (found.length === 0 && (daily.test(growthText) || keepsDaily.test(prose))) found.push(1);
  return found;
}

export function sourceOf(page: WikiPage): CropSource {
  const slug = encodeURIComponent(page.title.replace(/ /g, '_'));
  return {
    title: page.title,
    url: `${WIKI_BASE}${slug}`,
    historyUrl: `${WIKI_BASE}${slug}?action=history`,
    revisedAt: page.timestamp,
  };
}

/** Converte uma página de cultura em `Crop`. Recusa (com motivo) quando faltam dados essenciais. */
export function parseCropPage(page: WikiPage): ParseOutcome {
  const fail = (reason: string): ParseOutcome => ({ ok: false, title: page.title, reason });
  if (page.title.includes(':')) return fail('não é página de item (namespace)');

  const t = extractTemplate(page.text, ['infobox crop', 'starbox crop']);
  if (!t) return fail('sem infobox de cultura');

  const prose = proseOf(page.text);
  const warnings: string[] = [];

  const seasons = parseSeasons(t.season, page.text);
  if (seasons.length === 0) return fail('estação não encontrada');

  const growthText = t.growth ?? '';
  const growthDays =
    firstInt(growthText, /(\d+)\s*days?/i) ??
    firstInt(t['seed description'], /takes?\s+(\d+)\s+days?/i) ??
    firstInt(prose, /takes?\s+(\d+)\s+days?\s+to\s+(?:mature|grow|produce|ripen)/i) ??
    firstInt(prose, /(\d+)\s+days?\s+to\s+(?:mature|grow)/i);
  if (growthDays === undefined) return fail('dias de crescimento não encontrados');

  const regrowCandidates = regrowFrom(growthText, prose);
  const regrowDays = regrowCandidates[0];
  if (new Set(regrowCandidates).size > 1) {
    warnings.push(`rebrota conflitante na página (${[...new Set(regrowCandidates)].join(' ou ')} dias): usei ${regrowDays}`);
  }

  const sellPrice =
    firstInt(t['crop pierre sell'], /Price\|(\d+)/i) ??
    firstInt(t['crop pierre sell'], /(\d+)\s*g/i) ??
    firstInt(t.sellvalue, /(\d+)/);
  if (sellPrice === undefined) return fail('preço de venda não encontrado');

  const seedPrice = firstInt(t['seed pierre buy'], /(\d+)\s*g/i) ?? firstInt(t['seed pierre buy'], /(\d+)/);
  if (seedPrice === undefined) return fail('preço da semente (Pierre) ausente na wiki');

  if (growthDays > 28) warnings.push(`crescimento de ${growthDays} dias passa de uma estação`);
  if (sellPrice < seedPrice && regrowDays === undefined) warnings.push('preço de venda menor que o da semente');
  if (seasons.length > 1) warnings.push('várias estações: o planejador usa só o fim de cada estação');
  if (!t['crop pierre sell']) warnings.push('preço de venda veio de campo diferente do padrão');

  const crop: Crop = {
    name: (t.name || t.crop || page.title).trim(),
    seasons,
    growthDays,
    seedPrice,
    sellPrice,
    source: sourceOf(page),
  };
  if (regrowDays !== undefined) crop.regrowDays = regrowDays;
  return { ok: true, value: { crop, warnings } };
}

export interface CropOverride {
  seedPrice?: number;
  sellPrice?: number;
  growthDays?: number;
  regrowDays?: number;
  yieldPerHarvest?: number;
  /** Explique de onde veio a correção (ex.: "conferido na loja do jogo"). */
  note: string;
}

/** Aplica correções manuais por nome de cultura, sem alterar a lista original. */
export function applyOverrides(crops: readonly Crop[], overrides: Readonly<Record<string, CropOverride>>): Crop[] {
  return crops.map((c) => {
    const o = overrides[c.name];
    if (!o) return c;
    const { note, ...fields } = o;
    return { ...c, ...fields, note };
  });
}
