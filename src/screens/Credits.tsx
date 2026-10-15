import data from '../data/crops.json';
import giftData from '../data/gifts.json';
import type { Crop, CropSource } from '../utils/crops';

const crops = data.crops as Crop[];
const giftPages: Array<{ name: string; source: CropSource }> = [
  { name: 'Gifts (gostos universais)', source: giftData.universalSource as CropSource },
  ...(giftData.villagers as Array<{ name: string; source: CropSource }>),
];

export function Credits() {
  return (
    <>
      <h1>Fontes e licenças</h1>

      <h2>Dados de cultivo</h2>
      <p>
        Os dados de cultivo (estação, dias de crescimento, preços) foram extraídos da{' '}
        <a className="link-inline" href="https://stardewvalley.fandom.com/wiki/Stardew_Valley_Wiki" target="_blank" rel="noopener noreferrer">
          Stardew Valley Wiki
        </a>{' '}
        e de seus colaboradores, e estão disponíveis sob a licença{' '}
        <a className="link-inline" href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">
          Creative Commons Atribuição-CompartilhaIgual (CC BY-SA 3.0)
        </a>
        . Os valores foram reorganizados e alguns campos foram interpretados a partir do texto das páginas. Esse
        conjunto de dados continua sob a mesma licença.
      </p>
      <p className="muted">
        Cada página abaixo tem o histórico de edições, onde estão todos os autores. Valores da wiki podem conter erros.
      </p>

      <h2>Páginas usadas</h2>
      <ul className="plain">
        {crops.map((c) =>
          c.source ? (
            <li key={c.name}>
              <a className="link-inline" href={c.source.url} target="_blank" rel="noopener noreferrer">
                {c.name}
              </a>{' '}
              <span className="muted">
                (versão de {c.source.revisedAt.slice(0, 10)},{' '}
                <a className="link-inline" href={c.source.historyUrl} target="_blank" rel="noopener noreferrer">
                  autores
                </a>
                )
              </span>
            </li>
          ) : null,
        )}
      </ul>

      <h2>Dados de presentes</h2>
      <p>
        Os gostos de presentes de cada morador vêm das páginas abaixo da mesma wiki, sob a mesma licença CC BY-SA 3.0, e
        foram reorganizados por este app. Esse conjunto também continua sob CC BY-SA.
      </p>
      <ul className="plain">
        {giftPages.map((g) => (
          <li key={g.name}>
            <a className="link-inline" href={g.source.url} target="_blank" rel="noopener noreferrer">
              {g.name}
            </a>{' '}
            <span className="muted">
              (versão de {g.source.revisedAt.slice(0, 10)},{' '}
              <a className="link-inline" href={g.source.historyUrl} target="_blank" rel="noopener noreferrer">
                autores
              </a>
              )
            </span>
          </li>
        ))}
      </ul>

      <h2>Perfeição pelo save</h2>
      <p>
        As listas de itens e as regras de pontuação da Perfeição vêm do projeto de código aberto{' '}
        <a className="link-inline" href="https://github.com/MouseyPounds/stardew-checkup" target="_blank" rel="noopener noreferrer">
          Stardew Checkup
        </a>
        , de MouseyPounds, licença MIT. Copyright (c) 2017 MouseyPounds. O texto completo da licença acompanha o app
        (arquivo THIRD_PARTY_LICENSES.md).
      </p>

      <h2>Aviso</h2>
      <p className="muted">
        Este app é independente e não tem ligação com ConcernedApe nem é aprovado por ele. Stardew Valley e seu conteúdo
        pertencem aos seus donos.
      </p>
    </>
  );
}
