import { extractTemplate, type WikiPage } from './wikiCrops';
import type { Relative, SeasonKey, Villager } from '../utils/villagers';

const SEASONS: readonly SeasonKey[] = ['spring', 'summer', 'fall', 'winter'];

/** "[[File:Pierre Icon.png|20px|link=]] [[Pierre]] (Husband)<br/>..." -> [{name:'Pierre', role:'Husband'}] */
export function parseRelatives(value: string | undefined): Relative[] {
  if (!value) return [];
  const out: Relative[] = [];
  for (const part of value.split(/<br\s*\/?>/i)) {
    const clean = part.replace(/\[\[File:[^\]]*\]\]/gi, '').trim();
    if (!clean) continue;
    const link = /\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/.exec(clean);
    const name = (link?.[1] ?? clean.replace(/\(.*\)/, '')).trim();
    const role = /\(([^)]*)\)/.exec(clean.replace(/\[\[[^\]]*\]\]/g, ''))?.[1]?.trim();
    if (name) out.push(role ? { name, role } : { name });
  }
  return out;
}

export type VillagerOutcome = { ok: true; value: Villager; warnings: string[] } | { ok: false; title: string; reason: string };

export function parseVillagerInfo(page: WikiPage): VillagerOutcome {
  const t = extractTemplate(page.text, ['starbox villager']);
  if (!t) return { ok: false, title: page.title, reason: 'sem caixa de informações (Starbox villager)' };
  const warnings: string[] = [];

  const m = /^(Spring|Summer|Fall|Winter)\s+(\d{1,2})$/i.exec((t.birthday ?? '').trim());
  if (!m) return { ok: false, title: page.title, reason: `aniversário ilegível: "${t.birthday ?? ''}"` };
  const season = (m[1] as string).toLowerCase() as SeasonKey;
  const day = Number(m[2]);
  if (!SEASONS.includes(season) || day < 1 || day > 28) {
    return { ok: false, title: page.title, reason: `aniversário impossível: "${t.birthday}" (dia deve ser 1–28)` };
  }

  const location = (t.location ?? '').trim();
  const address = (t.address ?? '').trim();
  if (!location) warnings.push('sem região');
  if (!address) warnings.push('sem endereço');

  const marriage = (t.marriage ?? '').trim().toLowerCase();
  return {
    ok: true,
    warnings,
    value: {
      name: page.title,
      birthday: { season, day },
      location,
      address,
      romanceable: marriage === 'bachelor' || marriage === 'bachelorette',
      family: parseRelatives(t.family),
      friends: parseRelatives(t.friends),
    },
  };
}
