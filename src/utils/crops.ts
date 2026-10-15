export const SEASON_LENGTH = 28;

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

/** De onde veio o dado (exigido pela atribuição CC BY-SA). */
export interface CropSource {
  title: string;
  url: string;
  historyUrl: string;
  revisedAt: string;
}

export interface Crop {
  name: string;
  seasons: Season[];
  growthDays: number;
  /** Dias entre colheitas de culturas que rebrotam. */
  regrowDays?: number;
  seedPrice: number;
  sellPrice: number;
  yieldPerHarvest?: number;
  source?: CropSource;
  /** Presente quando um valor foi corrigido manualmente. */
  note?: string;
}

export interface CropPlan {
  crop: Crop;
  harvests: number;
  firstHarvestDay: number;
  lastHarvestDay: number;
  /** Receita menos o preço da semente. Sem qualidade, profissões nem fertilizante. */
  profit: number;
  goldPerDay: number;
}

/**
 * Plantar no dia D de uma cultura que leva N dias: primeira colheita no dia D + N.
 * Só conta colheitas até o dia 28 (culturas de uma estação morrem ao virar a estação).
 */
export function planCrop(crop: Crop, plantDay: number): CropPlan | null {
  if (!Number.isInteger(plantDay) || plantDay < 1 || plantDay > SEASON_LENGTH) return null;
  const first = plantDay + crop.growthDays;
  if (first > SEASON_LENGTH) return null;
  const regrow = crop.regrowDays ?? 0;
  const extra = regrow > 0 ? Math.floor((SEASON_LENGTH - first) / regrow) : 0;
  const harvests = 1 + extra;
  const last = first + extra * regrow;
  const revenue = harvests * crop.sellPrice * (crop.yieldPerHarvest ?? 1);
  const profit = revenue - crop.seedPrice;
  return {
    crop,
    harvests,
    firstHarvestDay: first,
    lastHarvestDay: last,
    profit,
    goldPerDay: profit / (last - plantDay),
  };
}

/** Culturas da estação que ainda dão tempo de colher, da mais lucrativa por dia para a menos. */
export function plantableCrops(crops: readonly Crop[], season: Season, plantDay: number): CropPlan[] {
  if (season === 'winter') return [];
  return crops
    .filter((c) => c.seasons.includes(season))
    .map((c) => planCrop(c, plantDay))
    .filter((p): p is CropPlan => p !== null)
    .sort((a, b) => b.goldPerDay - a.goldPerDay);
}
