import { TASTES, normalizeItem, type GiftData, type GiftEntry, type Taste, type VillagerGifts } from '../utils/gifts';
import { sourceOf, type WikiPage } from './wikiCrops';

/** As páginas de personagens da wiki têm vários formatos; este parser tenta todos e relata o que não leu. */

type Piece =
  | { kind: 'item'; name: string; note?: string }
  | { kind: 'group'; label: string }
  | { kind: 'universal'; taste: Taste };

const LABEL_TASTE: Record<string, Taste> = {
  love: 'love', loves: 'love', loved: 'love',
  like: 'like', likes: 'like', liked: 'like',
  neutral: 'neutral', neutrals: 'neutral',
  dislike: 'dislike', dislikes: 'dislike', disliked: 'dislike',
  hate: 'hate', hates: 'hate', hated: 'hate',
};

/** "'''Loved:'''", "Hated gifts", "Love" -> taste. */
export function tasteFromLabel(label: string): Taste | null {
  const clean = label.replace(/'+|:/g, '').trim().toLowerCase().replace(/\s+gifts?$/, '');
  return LABEL_TASTE[clean] ?? null;
}

/** Divide por vírgulas fora de parênteses, colchetes e chaves. */
export function splitTopLevel(s: string): string[] {
  const parts: string[] = [];
  let cur = '';
  let paren = 0;
  let link = 0;
  let brace = 0;
  for (let i = 0; i < s.length; i++) {
    const two = s.slice(i, i + 2);
    if (two === '[[') { link++; cur += two; i++; continue; }
    if (two === ']]') { link--; cur += two; i++; continue; }
    if (two === '{{') { brace++; cur += two; i++; continue; }
    if (two === '}}') { brace--; cur += two; i++; continue; }
    const c = s[i] as string;
    if (c === '(') paren++;
    if (c === ')') paren = Math.max(0, paren - 1);
    if (c === ',' && paren === 0 && link <= 0 && brace <= 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  parts.push(cur);
  return parts;
}

const stripMarkup = (s: string): string =>
  s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/'{2,}/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const trimPunct = (s: string): string => s.replace(/^[\s.;:*]+|[\s.;:,]+$/g, '');

const UNIVERSAL_WORD: Record<string, Taste> = {
  loves: 'love', likes: 'like', neutrals: 'neutral', neutral: 'neutral', dislikes: 'dislike', hates: 'hate',
};

/** Categorias do jogo que a wiki escreve sem "All": não são itens que dê para presentear. */
const CATEGORY_NAMES = new Set([
  'trees', 'artisan goods', 'house items', 'fishing items', 'geodes', 'seeds', 'farm items', 'ore and bars',
  'essences', 'artifacts', 'monster loot', 'totems', 'furniture', 'fish', 'eggs', 'bombs', 'minerals', 'flowers',
  'fruit', 'fruits', 'vegetables', 'milk', 'cooking', 'forage', 'gems', 'construction materials', 'secret woods',
  'trash', 'garbage', 'resources', 'crafting items', 'basic fertilizer',
]);

export function parsePiece(raw: string): Piece | null {
  let text = raw.replace(/<br\s*\/?>/gi, ' ').replace(/&nbsp;/g, ' ').trim();
  text = text
    .replace(/<blockquote>[\s\S]*?<\/blockquote>/gi, ' ')
    .replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, '$1') // link externo -> texto
    .replace(/^[\s*]+/, '')
    .replace(/'{2,}/g, '')
    .trim();
  if (!text) return null;

  // {{item|Nome|...}} (também {{Item|...}})
  const tpl = /\{\{\s*item\s*\|\s*([^|}]+)/i.exec(text);

  let note: string | undefined;
  const paren = /\(([^)]*)\)/.exec(text);
  if (paren) {
    note = stripMarkup(paren[1] ?? '') || undefined;
    text = text.replace(/\([^)]*\)/g, ' ').trim();
  }

  if (/^all\b/i.test(text)) {
    const label = trimPunct(stripMarkup(text));
    const uni = /universal\s+(\w+)/i.exec(label);
    const taste = uni?.[1] ? UNIVERSAL_WORD[uni[1].toLowerCase()] : undefined;
    if (taste) return { kind: 'universal', taste };
    return { kind: 'group', label: note ? `${label} (${note})` : label };
  }

  let name: string | undefined;
  if (tpl?.[1]) name = tpl[1];
  else {
    const link = /\[\[([^\]|#]+)/.exec(text);
    name = link?.[1] ?? stripMarkup(text);
  }
  name = trimPunct(name.replace(/\{\{|\}\}/g, ''));
  if (!name || name.length > 40 || /[|{}=<>]/.test(name)) return null;
  if (CATEGORY_NAMES.has(name.toLowerCase())) return { kind: 'group', label: name };
  return note ? { kind: 'item', name, note } : { kind: 'item', name };
}

interface Marker {
  line: number;
  taste: Taste | null;
  /** "table": cabeçalho dentro de tabela (termina em `|}`); "heading": título `== ... ==`. */
  kind: 'table' | 'heading';
  label: string;
}

const HEADING = /^(=+)\s*(.*?)\s*=+\s*$/;
const TABLE_HEAD = /^!\s*colspan\s*=\s*"?2"?\s*\|\s*(.+?)\s*$/i;

function markers(lines: readonly string[], labelToTaste: (l: string) => Taste | null): Marker[] {
  const out: Marker[] = [];
  lines.forEach((raw, line) => {
    const l = raw.trim();
    const h = HEADING.exec(l);
    if (h) return void out.push({ line, taste: labelToTaste(h[2] ?? ''), kind: 'heading', label: h[2] ?? '' });
    const t = TABLE_HEAD.exec(l);
    if (t) out.push({ line, taste: labelToTaste(t[1] ?? ''), kind: 'table', label: t[1] ?? '' });
  });
  return out;
}

function bodies(lines: readonly string[], ms: readonly Marker[]): Array<{ marker: Marker; body: string[] }> {
  return ms.map((m, i) => {
    let end = ms[i + 1]?.line ?? lines.length;
    if (m.kind === 'table') {
      for (let j = m.line + 1; j < end; j++) {
        if ((lines[j] as string).trim() === '|}') { end = j; break; }
      }
    }
    return { marker: m, body: lines.slice(m.line + 1, end) };
  });
}

/** Remove atributos de célula: `style="..." |conteúdo` -> `conteúdo`. */
function cellContent(line: string): string {
  const s = line.replace(/^\|\s?/, '');
  const m = /^[^|[\]{}]*=[^|[\]{}]*\|(?!\|)(.*)$/.exec(s);
  return (m ? (m[1] ?? '') : s).trim();
}

/** Linhas de tabela -> lista de linhas, cada uma com suas células (linhas começando com `|`). */
function tableRows(body: readonly string[]): { header: string[]; rows: string[][] }[] {
  const groups: { header: string[]; rows: string[][] }[] = [];
  let header: string[] = [];
  let current: string[] | null = null;
  let rows: string[][] = [];
  const flush = () => {
    if (current && current.length) rows.push(current);
    current = null;
  };
  const closeTable = () => {
    flush();
    if (rows.length || header.length) groups.push({ header, rows });
    header = [];
    rows = [];
  };
  for (const raw of body) {
    const l = raw.trim();
    if (l.startsWith('{|')) { closeTable(); continue; }
    if (l === '|}') { closeTable(); continue; }
    if (l.startsWith('|-')) { flush(); current = []; continue; }
    if (l.startsWith('!')) {
      const content = l.replace(/^!\s?/, '').replace(/^[^|[\]{}]*=[^|[\]{}]*\|(?!\|)/, '').trim();
      if (current) current.push(content); // tabelas que usam `!` também nas células de dados
      else header.push(content);
      continue;
    }
    if (l.startsWith('|')) {
      if (!current) current = [];
      current.push(cellContent(l));
    }
  }
  closeTable();
  return groups;
}

export interface TasteLists {
  items: GiftEntry[];
  groups: string[];
  /** A seção diz "All Universal X" (segue o gosto universal). */
  universal: Taste[];
}

const empty = (): TasteLists => ({ items: [], groups: [], universal: [] });

function addPiece(into: TasteLists, p: Piece | null): void {
  if (!p) return;
  if (p.kind === 'item') into.items.push(p.note ? { name: p.name, note: p.note } : { name: p.name });
  else if (p.kind === 'group') into.groups.push(p.label);
  else into.universal.push(p.taste);
}

const isQuote = (l: string) => /^(\*?\s*)?(''+)?["“]/.test(l) || /^\{\{\s*quote/i.test(l) || /^\{\{\s*collapse/i.test(l) || l.startsWith('<div');

/** Coluna com o nome do item: "Name" tem prioridade; senão "Item"/"Item Group". */
function itemColumn(header: readonly string[]): number {
  const clean = header.map((h) => stripMarkup(h).toLowerCase());
  const name = clean.findIndex((h) => h === 'name');
  if (name >= 0) return name;
  return clean.findIndex((h) => /^items?( group)?$/.test(h));
}

/** Lê o corpo de uma seção de gosto de um personagem. */
export function parseTasteBody(body: readonly string[]): TasteLists {
  const out = empty();
  const rowMode = body.some((l) => l.trim().startsWith('!') && /\b(item|name)\b/i.test(l));
  if (rowMode) {
    for (const g of tableRows(body)) {
      const idx = itemColumn(g.header);
      if (idx < 0) continue;
      for (const row of g.rows) {
        const cell = row[idx];
        if (cell === undefined) continue;
        for (const part of splitTopLevel(cell)) addPiece(out, parsePiece(part));
      }
    }
    return out;
  }
  for (const raw of body) {
    let l = raw.replace(/<blockquote>[\s\S]*?<\/blockquote>/gi, ' ').trim();
    if (!l || l.startsWith('!') || l.startsWith('{|') || l.startsWith('}}')) continue;
    if (l.startsWith('|')) {
      // Célula de tabela: só vale se já começa com um link/bullet de item (ex.: `|[[Driftwood]] (8+ hearts only)`).
      l = cellContent(l);
      if (!/^(\*|\[\[(?!File:|Category:))/.test(l)) continue;
    } else if (isQuote(l)) {
      // Falas seguidas de <br> e da lista na mesma linha: ''"Fala"'' <br>[[Item]], ...
      const br = /<br\s*\/?>/i.exec(l);
      if (!br || l.startsWith('{{') || l.startsWith('<div')) continue;
      l = l.slice(br.index + br[0].length).trim();
    }
    if (l.startsWith('[[File:') || l.startsWith('[[Category')) continue;
    if (/^\{\{(?!\s*item)/i.test(l)) continue;
    for (const part of splitTopLevel(l)) addPiece(out, parsePiece(part));
  }
  return out;
}

export type VillagerOutcome =
  | { ok: true; value: VillagerGifts; warnings: string[] }
  | { ok: false; title: string; reason: string };

const emptyTastes = <T>(f: () => T): Record<Taste, T> => ({
  love: f(), like: f(), neutral: f(), dislike: f(), hate: f(),
});

export function parseVillagerPage(page: WikiPage): VillagerOutcome {
  const fail = (reason: string): VillagerOutcome => ({ ok: false, title: page.title, reason });
  const lines = page.text.split('\n');
  const found = bodies(lines, markers(lines, tasteFromLabel));

  const tastes = emptyTastes<GiftEntry[]>(() => []);
  const groups = emptyTastes<string[]>(() => []);
  const seen = new Set<Taste>();
  const warnings: string[] = [];

  for (const { marker, body } of found) {
    const t = marker.taste;
    if (!t || seen.has(t)) continue;
    seen.add(t);
    const lists = parseTasteBody(body);
    tastes[t] = dedupe(lists.items);
    groups[t] = [...new Set(lists.groups)];
    // "All Universal X" em outra seção que não X é incomum: avisar.
    for (const u of lists.universal) if (u !== t) warnings.push(`seção ${t} cita gosto universal "${u}"`);
  }

  if (seen.size === 0) return fail('sem seções de gosto de presentes');
  const missing = TASTES.filter((t) => !seen.has(t));
  if (!seen.has('love')) return fail('sem seção de itens amados');
  if (missing.length > 0) warnings.push(`seções ausentes: ${missing.join(', ')}`);
  if (tastes.love.length === 0 && groups.love.length === 0) warnings.push('lista de amados vazia');

  return { ok: true, value: { name: page.title, source: sourceOf(page), tastes, groups }, warnings };
}

function dedupe(items: readonly GiftEntry[]): GiftEntry[] {
  const seenNames = new Set<string>();
  const out: GiftEntry[] = [];
  for (const e of items) {
    const k = normalizeItem(e.name);
    if (seenNames.has(k)) continue;
    seenNames.add(k);
    out.push(e);
  }
  return out;
}

// ---------- página "Gifts": gostos universais e exceções ----------

const UNIVERSAL_LABEL = /^universal\s+(loves|likes|neutrals?|dislikes|hates)$/i;
const universalTaste = (label: string): Taste | null => {
  const m = UNIVERSAL_LABEL.exec(label.replace(/'+/g, '').trim());
  return m?.[1] ? (UNIVERSAL_WORD[m[1].toLowerCase()] ?? null) : null;
};

const VERB: Array<[RegExp, Taste]> = [
  [/\bdislikes?\b/i, 'dislike'],
  [/\bhates?\b/i, 'hate'],
  [/\bloves?\b/i, 'love'],
  [/\blikes?\b/i, 'like'],
  [/\bis neutral\b|\bneutral\b/i, 'neutral'],
];

/** "{{Icon|Elliott}} and {{Icon|Leo}} love this.<br/>{{Icon|Harvey}} likes this." -> [(Elliott,love),(Leo,love),(Harvey,like)] */
export function parseExceptions(cell: string): { villager: string; taste: Taste }[] {
  const out: { villager: string; taste: Taste }[] = [];
  for (const clause of cell.split(/<br\s*\/?>/i)) {
    const names = [...clause.matchAll(/\{\{\s*icon\s*\|\s*([^|}]+)/gi)].map((m) => (m[1] as string).trim());
    if (names.length === 0) continue;
    const afterIcons = clause.replace(/\{\{[^}]*\}\}/g, ' ');
    const verb = VERB.find(([re]) => re.test(afterIcons));
    if (!verb) continue;
    for (const n of names) out.push({ villager: n, taste: verb[1] });
  }
  return out;
}

export interface UniversalParse {
  universal: Record<Taste, GiftEntry[]>;
  exceptions: GiftData['exceptions'];
  warnings: string[];
}

export function parseGiftsPage(page: WikiPage): UniversalParse | null {
  const lines = page.text.split('\n');
  const found = bodies(lines, markers(lines, universalTaste));
  const universal = emptyTastes<GiftEntry[]>(() => []);
  const exceptions: GiftData['exceptions'] = {};
  const warnings: string[] = [];
  let any = false;

  for (const { marker, body } of found) {
    const t = marker.taste;
    if (!t) continue;
    any = true;
    for (const g of tableRows(body)) {
      const itemIdx = g.header.findIndex((h) => /^items?$/i.test(h.replace(/'+/g, '').trim()));
      const excIdx = g.header.findIndex((h) => /exception/i.test(h));
      if (itemIdx < 0) continue;
      for (const row of g.rows) {
        const cell = row[itemIdx];
        if (cell === undefined) continue;
        const p = parsePiece(cell);
        if (!p || p.kind !== 'item') {
          warnings.push(`${t}: célula de item não lida: ${cell.slice(0, 60)}`);
          continue;
        }
        universal[t].push(p.note ? { name: p.name, note: p.note } : { name: p.name });
        const exc = excIdx >= 0 ? row[excIdx] : undefined;
        if (exc) {
          const parsed = parseExceptions(exc);
          if (parsed.length === 0) warnings.push(`${p.name}: exceção não lida: ${exc.slice(0, 80)}`);
          const key = normalizeItem(p.name);
          for (const e of parsed) (exceptions[key] ??= {})[e.villager] = e.taste;
          if (/dislikes all others|loves all/i.test(exc)) warnings.push(`${p.name}: exceção composta: ${exc.slice(0, 80)}`);
        }
      }
    }
  }
  return any ? { universal, exceptions, warnings } : null;
}
