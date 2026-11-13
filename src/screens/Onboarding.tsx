import { useEffect, useState } from 'react';
import heroImg from '../assets/hero-farm.jpg';
import { useBackHandler } from '../native/backButton';
import { overlaySupported } from '../native/overlay';
import { INTERESTS, saveOnboarding, type InterestId, type OnboardingState } from '../onboarding/state';
import { DAYS_IN_SEASON, SEASON_ORDER } from '../utils/calendar';
import { nextDay, previousDay, type GameDay } from '../utils/dayOverlay';
import { seasonLabel } from '../utils/villagers';
import { loadDay, saveDay } from './FloatingQuests';

interface Props {
  initial: OnboardingState;
  /** `openFloating`: a pessoa quer configurar o assistente flutuante agora. */
  onFinish: (s: OnboardingState, openFloating: boolean) => void;
}

const STEPS = 4;

export function Onboarding({ initial, onFinish }: Props) {
  const [step, setStep] = useState(0);
  const [farmName, setFarmName] = useState(initial.farmName);
  const [interests, setInterests] = useState<InterestId[]>(initial.interests);
  const [day, setDay] = useState<GameDay>({ season: 'spring', day: 1 });

  useEffect(() => {
    void loadDay().then(setDay);
  }, []);

  // Voltar do Android volta uma tela do onboarding em vez de fechar o app.
  useBackHandler(() => {
    if (step === 0) return false;
    setStep((s) => s - 1);
    return true;
  });

  const finish = (openFloating = false) => {
    const s: OnboardingState = { done: true, farmName: farmName.trim(), interests };
    void saveOnboarding(s);
    saveDay(day);
    onFinish(s, openFloating);
  };

  const toggle = (id: InterestId) => setInterests((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const changeDay = (d: GameDay) => setDay(d);

  return (
    <div className="onb" role="dialog" aria-modal="true" aria-label="Boas-vindas ao Valley Notes">
      <div className="onb-top">
        <div className="onb-dots" aria-label={`Passo ${step + 1} de ${STEPS}`}>
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} className={`onb-dot${i === step ? ' onb-dot--on' : ''}${i < step ? ' onb-dot--done' : ''}`} />
          ))}
        </div>
        {step < STEPS - 1 && (
          <button type="button" className="link onb-skip" onClick={() => finish()}>
            Pular
          </button>
        )}
      </div>

      {step === 0 && (
        <section className="onb-body">
          <img className="onb-hero" src={heroImg} alt="" />
          <h1>Seu caderno do vale</h1>
          <p className="onb-lead">Tudo o que você consulta no meio do jogo, num lugar só e em português.</p>
          <ul className="onb-points">
            <li>
              <span aria-hidden="true">🎁</span>
              <span>O presente certo para cada morador e os aniversários do dia</span>
            </li>
            <li>
              <span aria-hidden="true">🌱</span>
              <span>O que plantar hoje para lucrar mais, receitas, animais e construções</span>
            </li>
            <li>
              <span aria-hidden="true">💬</span>
              <span>Um botão sobre o jogo que mostra o que importa no dia, sem sair dele</span>
            </li>
          </ul>
        </section>
      )}

      {step === 1 && (
        <section className="onb-body">
          <h1>Sua fazenda</h1>
          <p className="onb-lead">Com o dia do jogo, o app mostra festivais, aniversários e o que plantar na data certa.</p>
          <label className="onb-field">
            <span>Nome da fazenda (opcional)</span>
            <input
              className="pet-name"
              value={farmName}
              maxLength={40}
              placeholder="Ex.: Fazenda Girassol"
              onChange={(e) => setFarmName(e.target.value)}
            />
          </label>
          <span className="onb-label">Que dia é no seu jogo?</span>
          <div className="row" role="group" aria-label="Estação">
            {SEASON_ORDER.map((s) => (
              <button key={s} type="button" className="chip" aria-pressed={day.season === s} onClick={() => changeDay({ season: s, day: day.day })}>
                {seasonLabel(s)}
              </button>
            ))}
          </div>
          <div className="day-stepper">
            <button type="button" className="btn" aria-label="Dia anterior" onClick={() => changeDay(previousDay(day))}>
              −
            </button>
            <label>
              <span className="muted small">Dia</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={DAYS_IN_SEASON}
                value={day.day}
                onChange={(e) => changeDay({ season: day.season, day: Math.min(DAYS_IN_SEASON, Math.max(1, Math.round(Number(e.target.value) || 1))) })}
              />
            </label>
            <button type="button" className="btn" aria-label="Próximo dia" onClick={() => changeDay(nextDay(day))}>
              +
            </button>
          </div>
          <p className="muted small">Ainda não começou? Deixe Primavera, dia 1. Dá para mudar depois.</p>
        </section>
      )}

      {step === 2 && (
        <section className="onb-body">
          <h1>O que te interessa?</h1>
          <p className="onb-lead">Escolha quantos quiser. Eles viram atalhos no Início.</p>
          <div className="onb-interests">
            {INTERESTS.map((i) => (
              <button key={i.id} type="button" className="onb-interest" aria-pressed={interests.includes(i.id)} onClick={() => toggle(i.id)}>
                <span className="onb-interest__emoji" aria-hidden="true">
                  {i.emoji}
                </span>
                <span>{i.label}</span>
                <span className="onb-interest__check" aria-hidden="true">
                  {interests.includes(i.id) ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="onb-body">
          <h1>Ajuda sem sair do jogo</h1>
          <p className="onb-lead">
            O <strong>assistente flutuante</strong> é um botão translúcido sobre o Stardew Valley. Tocando nele, você vê o dia: festival,
            aniversários, Carrinho de Viagem e o que plantar.
          </p>
          <ul className="onb-points">
            <li>
              <span aria-hidden="true">🌙</span>
              <span>Dormiu no jogo? Toque em <strong>Dormi</strong> e ele passa para o dia seguinte.</span>
            </li>
            <li>
              <span aria-hidden="true">✋</span>
              <span>Arraste para qualquer canto ou até o ✕ para esconder.</span>
            </li>
            <li>
              <span aria-hidden="true">🔒</span>
              <span>O Android pede a permissão "Exibir sobre outros apps" só quando você ativar.</span>
            </li>
          </ul>
          {!overlaySupported() && <p className="muted small">No navegador o botão não aparece; ele funciona no app Android.</p>}
        </section>
      )}

      <div className="onb-actions">
        {step > 0 && (
          <button type="button" className="btn secondary onb-back" onClick={() => setStep(step - 1)}>
            Voltar
          </button>
        )}
        {step < STEPS - 1 ? (
          <button type="button" className="btn onb-next" onClick={() => setStep(step + 1)}>
            {step === 0 ? 'Começar' : 'Continuar'}
          </button>
        ) : (
          <div className="onb-final">
            <button type="button" className="btn" onClick={() => finish(overlaySupported())}>
              {overlaySupported() ? 'Configurar o assistente' : 'Explorar o app'}
            </button>
            {overlaySupported() && (
              <button type="button" className="link" onClick={() => finish()}>
                Depois, quero explorar o app
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
