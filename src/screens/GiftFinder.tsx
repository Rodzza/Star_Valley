import { useMemo, useState } from 'react';
import data from '../data/gifts.json';
import { TASTE_LABEL, allButOne, lovedByAll, type GiftData } from '../utils/gifts';

const gifts = data as unknown as GiftData;
const MAX = 3;

export function GiftFinder() {
  const [picked, setPicked] = useState<string[]>([]);

  const villagers = useMemo(() => gifts.villagers.filter((v) => picked.includes(v.name)), [picked]);
  const universalLove = useMemo(() => new Set(gifts.universal.love.map((e) => e.name)), []);
  const result = useMemo(() => lovedByAll(gifts, villagers), [villagers]);
  const near = useMemo(() => (result.length === 0 ? allButOne(gifts, villagers) : []), [result, villagers]);

  const toggle = (name: string) =>
    setPicked((cur) => (cur.includes(name) ? cur.filter((n) => n !== name) : cur.length < MAX ? [...cur, name] : cur));

  const groupsLoved = villagers.flatMap((v) => v.groups.love.map((g) => `${v.name}: ${g}`));

  return (
    <>
      <h1>Presente certo</h1>
      <p>Escolha até {MAX} moradores e veja os itens que todos eles amam.</p>

      <h2>
        Moradores ({picked.length}/{MAX})
      </h2>
      <div className="row" role="group" aria-label="Moradores">
        {gifts.villagers.map((v) => {
          const on = picked.includes(v.name);
          const full = !on && picked.length >= MAX;
          return (
            <button key={v.name} className="chip" aria-pressed={on} disabled={full} onClick={() => toggle(v.name)}>
              {v.name}
            </button>
          );
        })}
      </div>

      {villagers.length === 0 && <p className="muted">Toque nos nomes acima para começar.</p>}

      {villagers.length > 0 && (
        <>
          <h2>{villagers.length === 1 ? `${villagers[0]?.name} ama` : 'Todos amam'}</h2>
          {result.length === 0 ? (
            <p className="muted">Nenhum item da lista é amado por todos os escolhidos.</p>
          ) : (
            <ul className="plain">
              {result.map((item) => (
                <li key={item}>
                  {item} {universalLove.has(item) && <span className="muted">(amado por todos)</span>}
                </li>
              ))}
            </ul>
          )}

          {near.length > 0 && (
            <>
              <h2>Quase: todos menos um</h2>
              <ul className="plain">
                {near.map((n) => (
                  <li key={n.item}>
                    {n.item}{' '}
                    <span className="muted">
                      ({n.others.map((o) => `${o.villager}: ${o.taste === 'unknown' ? 'sem dado' : TASTE_LABEL[o.taste].toLowerCase()}`).join(', ')})
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {groupsLoved.length > 0 && (
            <div className="notice" role="note">
              <strong>Grupos que não entram na lista</strong>
              {groupsLoved.join(' · ')}
            </div>
          )}
        </>
      )}

      <div className="notice" role="note">
        <strong>Sobre os dados</strong>
        Gostos vindos da Stardew Valley Wiki (CC BY-SA), em inglês e ainda não conferidos no jogo. Itens de categorias
        inteiras (como "todos os ovos") não são listados. Veja os créditos em Fontes e licenças.
      </div>
    </>
  );
}
