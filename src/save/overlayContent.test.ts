import { describe, expect, it } from 'vitest';
import { buildOverlayContent } from './overlayContent';
import type { ParsedSave } from './parseSave';

const base: ParsedSave = {
  kind: 'main', playerName: 'Rod', farmName: 'Vale', date: { season: 'fall', day: 12, year: 2 },
  quests: [], skills: { farming: 0, mining: 0, combat: 0, foraging: 0, fishing: 0, luck: 0 },
  fishCaught: [], recipesCooked: [], recipesCrafted: [], basicShipped: [], monstersKilled: {}, mineChestOpened: false,
  perfectionWaivers: 0, mail: [], friends: [],
  obelisks: [], goldClock: false, goldenWalnutsFound: 0, warnings: [],
};

describe('texto do botão flutuante', () => {
  it('lista missões com objetivo e prazo', () => {
    const c = buildOverlayContent({
      ...base,
      quests: [
        { type: 'FishingQuest', title: 'Catch a Pufferfish', description: '', objective: 'Catch Pufferfish', daysLeft: 3 },
        { type: 'Quest', title: 'Introductions', description: '', objective: '' },
      ],
    });
    expect(c.title).toBe('Missões ativas · Vale');
    expect(c.lines[0]).toBe('• Catch a Pufferfish — Catch Pufferfish (3 dias)');
    expect(c.lines[1]).toBe('• Introductions');
    expect(c.lines.at(-1)).toContain('Outono, dia 12 (ano 2)');
  });
  it('avisa quando não há missões', () => {
    expect(buildOverlayContent(base).lines[0]).toBe('Nenhuma missão ativa neste save.');
  });
  it('singular de "dia"', () => {
    const c = buildOverlayContent({ ...base, quests: [{ type: 'Quest', title: 'A', description: '', objective: '', daysLeft: 1 }] });
    expect(c.lines[0]).toBe('• A (1 dia)');
  });
});
