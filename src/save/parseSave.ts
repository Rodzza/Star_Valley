/**
 * Lê o XML de um save do Stardew Valley (arquivo principal ou SaveGameInfo) e extrai só o que o app usa.
 *
 * Usa regex sobre trechos do texto (sem DOMParser) para ser rápido com saves de vários MB e funcionar
 * igual no celular e nos testes. Tudo é tolerante: o que não for achado vira aviso, não erro.
 *
 * ATENÇÃO: a estrutura foi escrita a partir do conhecimento do formato e ainda precisa ser conferida
 * com um save real (a tela "Perfeição" mostra o que foi lido para facilitar essa conferência).
 */

export type SeasonName = 'spring' | 'summer' | 'fall' | 'winter';
const SEASONS: readonly SeasonName[] = ['spring', 'summer', 'fall', 'winter'];

export interface SaveQuest {
  type: string;
  title: string;
  description: string;
  objective: string;
  daysLeft?: number;
}

export interface SaveFriend {
  name: string;
  points: number;
  status: string;
}

export interface ParsedSave {
  kind: 'main' | 'info';
  playerName: string;
  farmName: string;
  date?: { season: SeasonName; day: number; year: number };
  quests: SaveQuest[];
  skills: { farming: number; mining: number; combat: number; foraging: number; fishing: number; luck: number };
  /** IDs dos peixes pescados (contagem > 0), sem o prefixo "(O)". */
  fishCaught: string[];
  /** IDs das receitas cozinhadas pelo menos uma vez. */
  recipesCooked: string[];
  /** Nomes das receitas de fabricação feitas pelo menos uma vez. */
  recipesCrafted: string[];
  /** IDs dos itens já enviados na caixa de envio (contagem > 0). */
  basicShipped: string[];
  /** Monstros derrotados por nome (stats > specificMonstersKilled). */
  monstersKilled: Record<string, number>;
  /** O baú da mina nível 100 (Gota de estrela) já foi aberto. */
  mineChestOpened: boolean;
  perfectionWaivers: number;
  mail: string[];
  friends: SaveFriend[];
  obelisks: string[];
  goldClock: boolean | null;
  goldenWalnutsFound: number | null;
  /** Coisas que não foram encontradas no arquivo (ajuda a depurar um save diferente do esperado). */
  warnings: string[];
}

export type ParseOutcome = { ok: true; save: ParsedSave } | { ok: false; reason: string };

const decode = (s: string): string =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/** Texto da primeira ocorrência de <name>…</name>. */
export function tag(text: string, name: string): string | undefined {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(text);
  return m?.[1] !== undefined ? decode(m[1].trim()) : undefined;
}

/** Trecho interno da primeira seção <name>…</name> (sem decodificar). */
export function section(text: string, name: string): string | undefined {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(text);
  return m?.[1];
}


/**
 * Conteúdo do primeiro filho DIRETO <name> de um bloco XML (ignora tags homônimas mais fundas,
 * como o <name> dos itens do inventário, que não são o nome do jogador).
 */
export function child(block: string, name: string): string | undefined {
  const re = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s[^>]*?)?)(\/?)>/g;
  let depth = 0;
  let start = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    const closing = m[1] === '/';
    const selfClose = m[4] === '/';
    const tagName = m[2];
    if (!closing) {
      if (selfClose) {
        if (depth === 0 && tagName === name && start < 0) return '';
        continue;
      }
      if (depth === 0 && tagName === name && start < 0) start = re.lastIndex;
      depth++;
    } else {
      depth--;
      if (depth === 0 && start >= 0 && tagName === name) return block.slice(start, m.index);
      if (depth < 0) depth = 0;
    }
  }
  return undefined;
}

const childText = (block: string, name: string): string | undefined => {
  const v = child(block, name);
  return v === undefined ? undefined : decode(v.trim());
};

const num = (s: string | undefined): number | undefined => {
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

/** Entradas <item><key>…</key><value>…</value></item> de um dicionário serializado. */
export function dictEntries(sectionText: string | undefined): Array<{ key: string; value: string }> {
  if (!sectionText) return [];
  const out: Array<{ key: string; value: string }> = [];
  const re = /<item>\s*<key>([\s\S]*?)<\/key>\s*<value>([\s\S]*?)<\/value>\s*<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sectionText)) !== null) {
    out.push({ key: decode((m[1] ?? '').replace(/<[^>]+>/g, '').trim()), value: m[2] ?? '' });
  }
  return out;
}

const firstInt = (value: string): number | undefined => {
  const m = /<(?:int|Points)>\s*(-?\d+)\s*<\//.exec(value) ?? /^\s*(-?\d+)\s*$/.exec(value);
  return m?.[1] !== undefined ? Number(m[1]) : undefined;
};

function parseSeason(raw: string | undefined): SeasonName | undefined {
  if (raw === undefined) return undefined;
  const asNumber = Number(raw);
  if (Number.isInteger(asNumber) && asNumber >= 0 && asNumber < 4) return SEASONS[asNumber];
  const lower = raw.trim().toLowerCase();
  return SEASONS.find((s) => s === lower);
}

function parseQuests(playerBlock: string): SaveQuest[] {
  const log = child(playerBlock, 'questLog');
  if (!log) return [];
  const quests: SaveQuest[] = [];
  const re = /<Quest\b([^>]*)>([\s\S]*?)<\/Quest>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(log)) !== null) {
    const attrs = m[1] ?? '';
    const body = m[2] ?? '';
    const type = /xsi:type="([^"]+)"/.exec(attrs)?.[1] ?? 'Quest';
    const title = tag(body, 'questTitle') ?? tag(body, '_questTitle') ?? '';
    const description = tag(body, 'questDescription') ?? tag(body, '_questDescription') ?? '';
    const objective = tag(body, 'currentObjective') ?? '';
    if (!title && !description) continue;
    const daysLeft = num(tag(body, 'daysLeft'));
    quests.push(daysLeft !== undefined && daysLeft > 0 ? { type, title, description, objective, daysLeft } : { type, title, description, objective });
  }
  return quests;
}

function parseFriends(playerBlock: string): SaveFriend[] {
  return dictEntries(child(playerBlock, 'friendshipData')).map(({ key, value }) => ({
    name: key,
    points: num(tag(value, 'Points')) ?? 0,
    status: tag(value, 'Status') ?? '',
  }));
}

export function parseSave(xml: string): ParseOutcome {
  const text = xml.replace(/^﻿/, '');
  const isMain = /<SaveGame[\s>]/.test(text.slice(0, 2000));
  const isInfo = /<Farmer[\s>]/.test(text.slice(0, 2000));
  if (!isMain && !isInfo) {
    return { ok: false, reason: 'Isto não parece um arquivo de save do Stardew Valley (esperava XML com <SaveGame> ou <Farmer>).' };
  }

  const warnings: string[] = [];
  const player = isMain ? (section(text, 'player') ?? '') : (section(text, 'Farmer') ?? '');
  if (!player) return { ok: false, reason: 'Não encontrei o jogador dentro do save.' };

  const seasonRaw = tag(text, 'currentSeason') ?? tag(text, 'seasonForSaveGame') ?? tag(text, 'season');
  const season = parseSeason(seasonRaw);
  const day = num(tag(text, 'dayOfMonth') ?? tag(text, 'dayOfMonthForSaveGame'));
  const year = num(tag(text, 'year') ?? tag(text, 'yearForSaveGame'));
  const date = season && day && year ? { season, day, year } : undefined;
  if (!date) warnings.push('data do jogo não encontrada');

  const playerName = childText(player, 'name') ?? '';
  const farmName = childText(player, 'farmName') ?? '';
  if (!playerName) warnings.push('nome do jogador não encontrado');

  const level = (n: string): number => num(childText(player, n)) ?? 0;
  const skills = {
    farming: level('farmingLevel'),
    mining: level('miningLevel'),
    combat: level('combatLevel'),
    foraging: level('foragingLevel'),
    fishing: level('fishingLevel'),
    luck: level('luckLevel'),
  };

  const stripPrefix = (k: string) => k.replace(/^\([A-Z]+\)/, '');
  const positive = (entries: Array<{ key: string; value: string }>, fix: (k: string) => string = stripPrefix) =>
    entries.filter((e) => (firstInt(e.value) ?? 0) > 0).map((e) => fix(e.key));
  const fishCaught = positive(dictEntries(child(player, 'fishCaught')));
  if (dictEntries(child(player, 'fishCaught')).length === 0) warnings.push('peixes pescados: seção vazia ou ausente');
  const recipesCooked = positive(dictEntries(child(player, 'recipesCooked')));
  const recipesCrafted = positive(dictEntries(child(player, 'craftingRecipes')), (k) => k);
  const basicShipped = positive(dictEntries(child(player, 'basicShipped')));
  const stats = child(player, 'stats');
  const monstersKilled: Record<string, number> = {};
  for (const e of dictEntries(stats ? child(stats, 'specificMonstersKilled') : undefined)) {
    const n = firstInt(e.value);
    if (n) monstersKilled[e.key] = n;
  }
  const mineChestOpened = dictEntries(child(player, 'chestConsumedMineLevels')).some(
    (e) => e.key === '100' && /true/i.test(e.value),
  );
  const mail = [...(child(player, 'mailReceived') ?? '').matchAll(/<string>([\s\S]*?)<\/string>/g)].map((x) => decode((x[1] ?? '').trim()));
  const friends = parseFriends(player);
  const quests = parseQuests(player);

  let obelisks: string[] = [];
  let goldClock: boolean | null = null;
  let walnuts: number | null = null;
  let waivers = 0;
  if (isMain) {
    const types = [...text.matchAll(/<buildingType>\s*([^<]+?)\s*<\/buildingType>/g)].map((x) => x[1] ?? '');
    obelisks = [...new Set(types.filter((t) => /^(Earth|Water|Desert|Island) Obelisk$/.test(t)))];
    goldClock = types.includes('Gold Clock');
    if (types.length === 0) warnings.push('nenhuma construção encontrada (obeliscos e Relógio de Ouro não puderam ser lidos)');
    const w = /<(?:goldenWalnutsFound|GoldenWalnutsFound)>\s*(\d+)\s*</.exec(text);
    walnuts = w?.[1] !== undefined ? Number(w[1]) : null;
    waivers = num(tag(text, 'perfectionWaivers')) ?? 0;
    if (walnuts === null) warnings.push('nozes douradas encontradas: não achei no arquivo');
  } else {
    warnings.push('arquivo SaveGameInfo: obeliscos, Relógio de Ouro e nozes douradas só existem no arquivo principal do save');
  }

  return {
    ok: true,
    save: {
      kind: isMain ? 'main' : 'info',
      playerName,
      farmName,
      ...(date ? { date } : {}),
      quests,
      skills,
      fishCaught,
      recipesCooked,
      recipesCrafted,
      basicShipped,
      monstersKilled,
      mineChestOpened,
      perfectionWaivers: waivers,
      mail,
      friends,
      obelisks,
      goldClock,
      goldenWalnutsFound: walnuts,
      warnings,
    },
  };
}
