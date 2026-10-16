export type SeasonKey = 'spring' | 'summer' | 'fall' | 'winter';

export interface Relative {
  /** Nome como na wiki, em inglês (ex.: "Pierre"). */
  name: string;
  /** Papel como na wiki, em inglês (ex.: "Mother"). Vazio para amigos. */
  role?: string;
}

export interface Villager {
  /** Nome em inglês, igual ao de gifts.json (chave para ligar os dois). */
  name: string;
  birthday: { season: SeasonKey; day: number };
  /** Região em inglês (ex.: "Pelican Town"). */
  location: string;
  /** Endereço em inglês (ex.: "Leah's Cottage"). */
  address: string;
  /** Pode ser cortejado/casar (Bachelor/Bachelorette na wiki). */
  romanceable: boolean;
  family: Relative[];
  friends: Relative[];
  /** true quando o dado veio de correção manual, não da wiki. */
  manual?: boolean;
}

export interface VillagerData {
  villagers: Villager[];
}

const SEASON_PT: Record<SeasonKey, string> = { spring: 'Primavera', summer: 'Verão', fall: 'Outono', winter: 'Inverno' };
export const seasonLabel = (s: SeasonKey): string => SEASON_PT[s];

/** Nomes de exibição em português quando diferem do original. */
const DISPLAY_NAME: Record<string, string> = { Dwarf: 'Anão', Wizard: 'Mago', Witch: 'Bruxa', Grandpa: 'Vovô', Clara: 'Clara' };
export const displayName = (name: string): string => DISPLAY_NAME[name] ?? name;

const LOCATION_PT: Record<string, string> = {
  'Pelican Town': 'Vila Pelicanos',
  'Cindersap Forest': 'Floresta Cindersap',
  'The Mountain': 'A Montanha',
  'The Beach': 'A Praia',
  'Calico Desert': 'Deserto Calico',
  'Ginger Island': 'Ilha Gengibre',
};
export const locationLabel = (s: string): string => LOCATION_PT[s] ?? s;

const ADDRESS_PT: Record<string, string> = {
  "Pierre's General Store": 'Armazém do Pierre',
  '2 River Road': 'Rua do Rio, 2',
  '1 River Road': 'Rua do Rio, 1',
  "Wizard's Tower": 'Torre do Mago',
  "Mayor's Manor": 'Mansão do Prefeito',
  "Linus' Tent": 'Tenda do Linus',
  '2 Willow Lane': 'Travessa do Salgueiro, 2',
  '1 Willow Lane': 'Travessa do Salgueiro, 1',
  "Elliott's Cabin": 'Cabana do Elliott',
  Oasis: 'Oásis',
  "Marnie's Ranch": 'Rancho da Marnie',
  "Leah's Cottage": 'Cabana da Leah',
  '24 Mountain Road': 'Estrada da Montanha, 24',
  "Harvey's Clinic": 'Clínica do Harvey',
  'The Stardrop Saloon': 'Saloon Gota Estelar',
  Blacksmith: 'Ferreiro',
  'The Mines': 'As Minas',
  Treehouse: 'Casa da árvore',
  'Fish Shop': 'Loja de Peixes',
  'The Sewers': 'Os Esgotos',
};
export const addressLabel = (s: string): string => ADDRESS_PT[s] ?? s;

const ROLE_PT: Record<string, string> = {
  lover: 'amante',
  Mother: 'Mãe',
  Father: 'Pai',
  Wife: 'Esposa',
  Husband: 'Marido',
  Daughter: 'Filha',
  Son: 'Filho',
  Sister: 'Irmã',
  Brother: 'Irmão',
  'Half-Brother': 'Meio-irmão',
  'Half-Sister': 'Meia-irmã',
  Grandpa: 'Avô',
  Grandma: 'Avó',
  Grandson: 'Neto',
  Granddaughter: 'Neta',
  Aunt: 'Tia',
  Uncle: 'Tio',
  Nephew: 'Sobrinho',
  Niece: 'Sobrinha',
  'Step-Father': 'Padrasto',
  'Step-Son': 'Enteado',
  'God-Daughter': 'Afilhada',
  'God-Father': 'Padrinho',
  'Ex-Wife': 'Ex-esposa',
  'Late Daughter': 'Filha (falecida)',
  'Late Mother': 'Mãe (falecida)',
};
export const roleLabel = (s: string): string => ROLE_PT[s] ?? s;

/** Slug para nome de arquivo de retrato: "Abigail" -> "abigail". */
export const slug = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
