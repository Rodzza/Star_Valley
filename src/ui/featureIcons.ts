import type { FeatureId } from '../features/registry';
import type { IconName } from './PixelIcon';

export const FEATURE_ICON: Record<FeatureId, IconName> = {
  calendar: 'calendar',
  villagers: 'heart',
  pets: 'heart',
  recipes: 'note',
  skills: 'chest',
  buildings: 'house',
  cropPlanner: 'sprout',
  giftFinder: 'gift',
  saveProgress: 'chest',
  floatingQuests: 'scroll',
  cloudSync: 'cloud',
  unlimitedFarms: 'house',
  customNotes: 'note',
};
