import { describe, expect, it } from 'vitest';
import { applyOverrides, extractTemplate, parseCropPage, parseExport, regrowFrom, type WikiPage } from './wikiCrops';

const page = (title: string, text: string): WikiPage => ({
  title,
  text,
  timestamp: '2026-03-29T23:52:11Z',
  contributor: 'Alguém',
});

describe('extractTemplate', () => {
  it('lê parâmetros com templates e links aninhados', () => {
    const t = extractTemplate(
      '{{Infobox crops\n|Name = Garlic\n|energy = {{energy|+20}}<br>{{energy|+28}}\n|season = [[Spring]]\n}}\ntexto',
      ['infobox crop'],
    );
    expect(t).toMatchObject({ name: 'Garlic', season: '[[Spring]]' });
    expect(t?.energy).toContain('{{energy|+20}}');
  });

  it('aceita Infobox_crops (underscore) e parâmetros na mesma linha', () => {
    const t = extractTemplate('{{Infobox_crops|Name = Coffee Bean|growth = 10 days|season = Spring and Summer}}', [
      'infobox crop',
    ]);
    expect(t).toMatchObject({ name: 'Coffee Bean', growth: '10 days' });
  });

  it('devolve null quando não há o template', () => {
    expect(extractTemplate('{{Stub}} texto', ['infobox crop'])).toBeNull();
  });
});

describe('regrowFrom', () => {
  it('lê "after N days" só do campo Growth', () => {
    expect(regrowFrom('13 Days (Keeps producing 3-4 after 4 days)', '')).toEqual([4]);
    expect(regrowFrom('', 'Eles maturam after 7 days.')).toEqual([]);
  });

  it('lê "every Nth day" e "N days to regrow" do texto', () => {
    expect(regrowFrom('', 'keep producing the fruit every 5th day.')).toEqual([5]);
    expect(regrowFrom('', 'It takes 6 days to grow and 3 days to regrow.')).toEqual([3]);
  });

  it('só considera rebrota diária com frase explícita', () => {
    expect(regrowFrom('11 Days (Keeps producing everyday)', '')).toEqual([1]);
    expect(regrowFrom('12 Days', 'Regue every day para crescer.')).toEqual([]);
  });
});

describe('parseCropPage', () => {
  it('converte uma página com infobox completo', () => {
    const r = parseCropPage(
      page(
        'Rhubarb',
        '{{Infobox_crops\n|Name = Rhubarb\n|Growth = 13 Days\n|Season = Spring\n|Crop Pierre Sell = No Star: 220g, Silver: 275g\n|Seed Pierre Buy = Desert Store 100g\n}}\nTexto.',
      ),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.crop).toMatchObject({
      name: 'Rhubarb',
      seasons: ['spring'],
      growthDays: 13,
      seedPrice: 100,
      sellPrice: 220,
    });
    expect(r.value.crop.source?.url).toBe('https://stardewvalley.fandom.com/wiki/Rhubarb');
    expect(r.value.crop.source?.historyUrl).toContain('action=history');
  });

  it('entende o preço no formato {{Price|N}} e crescimento no texto da semente', () => {
    const r = parseCropPage(
      page(
        'Melon',
        '{{Infobox crops\n|Name = Melon\n|Season = Summer\n|Seed Description = Plant these. Takes 12 days to mature.\n|Crop Pierre Sell = {{Price|250}}\n|Seed Pierre Buy = 80g\n}}',
      ),
    );
    expect(r.ok && r.value.crop).toMatchObject({ growthDays: 12, sellPrice: 250, seedPrice: 80 });
  });

  it('recusa, com motivo, quando falta o preço da semente (não inventa valor)', () => {
    const r = parseCropPage(
      page('Parsnip', '{{Starbox crop|crop=Parsnip|season=Spring|sellvalue=35}}\nTakes 4 days to mature.'),
    );
    expect(r).toEqual({ ok: false, title: 'Parsnip', reason: 'preço da semente (Pierre) ausente na wiki' });
  });

  it('recusa páginas de categoria e stubs', () => {
    expect(parseCropPage(page('Category:Spring crops', '[[Category:Crops]]')).ok).toBe(false);
    expect(parseCropPage(page('Pineapple', '{{Stub}} texto')).ok).toBe(false);
  });

  it('avisa quando a página se contradiz sobre a rebrota', () => {
    const r = parseCropPage(
      page(
        'Grape',
        "{{Infobox crops\n|Name = Grape\n|Growth = 10 Days (Keeps producing every 3 days)\n|Season = Fall\n|Crop Pierre Sell = 80g\n|Seed Pierre Buy = 60g\n}}\nThey keep producing the fruit every 4th day.",
      ),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.crop.regrowDays).toBe(3);
    expect(r.value.warnings.join(' ')).toContain('conflitante');
  });

  it('não acusa venda < semente em culturas que rebrotam', () => {
    const r = parseCropPage(
      page(
        'Corn',
        '{{Infobox crops\n|Name = Corn\n|Growth = 14 Days (Keeps producing after 4 days)\n|Season = Summer/Fall\n|Crop Pierre Sell = No Star: 55g\n|Seed Pierre Buy = 150g\n}}',
      ),
    );
    expect(r.ok && r.value.warnings.some((w) => w.includes('menor'))).toBe(false);
  });
});

describe('parseExport', () => {
  it('lê título, autor, data e decodifica entidades', () => {
    const xml =
      '<mediawiki><page><title>Fish &amp; Chips</title><revision><timestamp>2026-01-02T03:04:05Z</timestamp><contributor><username>Ana</username></contributor><text xml:space="preserve">{{A}} &lt;b&gt;</text></revision></page></mediawiki>';
    expect(parseExport(xml)).toEqual([
      { title: 'Fish & Chips', timestamp: '2026-01-02T03:04:05Z', contributor: 'Ana', text: '{{A}} <b>' },
    ]);
  });
});

describe('applyOverrides', () => {
  it('corrige só a cultura nomeada e registra a nota', () => {
    const base = [
      { name: 'A', seasons: ['spring' as const], growthDays: 5, seedPrice: 10, sellPrice: 20 },
      { name: 'B', seasons: ['spring' as const], growthDays: 5, seedPrice: 10, sellPrice: 20 },
    ];
    const out = applyOverrides(base, { A: { sellPrice: 50, note: 'conferido no jogo' } });
    expect(out[0]).toMatchObject({ sellPrice: 50, note: 'conferido no jogo' });
    expect(out[1]).toEqual(base[1]);
    expect(base[0]?.sellPrice).toBe(20);
  });
});
