# Valley Tracker (esqueleto)

Companheiro de Stardew Valley para Android: React + Vite + Capacitor.

## Regras de monetização (já implementadas)
- **Grátis:** calendário e moradores.
- **Anúncio:** *Planejador de plantio*. 1 anúncio libera a função até a meia-noite (horário local). Limite de **5 anúncios por dia no total**.
- **Pro:** Presente certo, Perfeição pelo save, Assistente flutuante, Sincronização, Fazendas ilimitadas, Notas e sem anúncios.
- Para mudar uma função de plano, edite `access` em `src/features/registry.ts`.

## Rodar
```bash
npm install
npm test            # regras de liberação, contraste do tema e planejador
npm run dev         # navegador (anúncio e compra são simulados)
```

## Gerar o APK (no seu computador, com Android Studio)
Primeira vez:
```bash
npm install
npm run build
npx cap add android
npm run android:config -- --test     # coloca o App ID de TESTE do AdMob no AndroidManifest
npx cap sync android
npx cap open android
```
Nas vezes seguintes, depois de mudar o código: `npm run android:sync` e rode pelo Android Studio.
Troque `appId` em `capacitor.config.ts` pelo ID definitivo do seu app **antes** de rodar `cap add android`
(mudar depois exige refazer a pasta `android`).

### Anúncios reais (AdMob)
1. No AdMob: crie a conta, **Apps › Adicionar app** (Android) e depois uma unidade de anúncio do tipo **Premiado**.
2. Copie `.env.example` para `.env.production` e preencha:
   - `VITE_ADMOB_REWARDED_ID` = ID da unidade (`ca-app-pub-…/…`);
   - `ADMOB_APP_ID` = ID do app (`ca-app-pub-…~…`).
3. `npm run android:config` (sem `--test`) grava o App ID no AndroidManifest; `npm run android:sync` gera o app.
   O build de produção usa o ID real e o `npm run dev`/builds sem ID usam sempre anúncios de TESTE
   (ID malformado também cai em teste, para nunca publicar com ID quebrado).
4. **Nunca clique nos seus próprios anúncios reais.** Para testar no seu aparelho, cadastre-o em AdMob › Configurações › Dispositivos de teste.
5. Usuários da Europa/Reino Unido exigem o formulário de consentimento (UMP) do AdMob; configure em AdMob › Privacidade e mensagens.

### Perfeição pelo save e botão flutuante
- **Android 13+ bloqueia apps de ler `Android/data`** (onde o Stardew guarda o save), então o app não lê o save sozinho:
  o usuário copia o arquivo do save para outra pasta e importa pela tela (um `<input type=file>`, sem permissão especial).
  O texto do paywall já diz isso. Se um dia quiser leitura automática, o caminho é o Shizuku (o usuário instala e ativa
  por depuração sem fio a cada reinicialização), que é pesado de pedir a um jogador.
- O parser (`src/save/parseSave.ts`) usa os mesmos caminhos do XML que o Stardew Checkup (open source, MIT), e a Perfeição
  usa as listas e regras dele (`src/data/perfectionLists.json`, `src/save/perfection.ts`; licença em `THIRD_PARTY_LICENSES.md`).
  Mesmo assim **ainda não foi testado com um save real**: importe um save seu e compare com a Sala de Nozes do Sr. Qi no jogo.
  A tela lista o que não foi achado no arquivo. Os campos das missões (`questTitle` etc.) não aparecem no Checkup e vêm da minha memória do formato.
- O botão flutuante é um plugin Android local em `plugins/valley-native` (Java, sem Kotlin). O `cap sync` o descobre sozinho.
  Ele usa `SYSTEM_ALERT_WINDOW` e um serviço em primeiro plano do tipo `specialUse`. **Foi escrito sem poder compilar
  (o ambiente de desenvolvimento não tem o SDK do Android)**: se o Android Studio apontar erro, mande a mensagem.
- No Google Play Console, ao publicar: declare o uso da permissão "Exibir sobre outros apps" e o tipo de serviço em primeiro
  plano `specialUse` (Conteúdo do app › Permissões do serviço em primeiro plano), explicando que o botão é ativado pelo usuário.

## O que falta antes de publicar
1. **Compras reais:** `src/monetization/billing.ts` é simulação. Integre o Google Play Billing (ex.: RevenueCat) e crie os produtos `pro_monthly` (assinatura mensal, R$ 4,99) e `pro_lifetime` (compra única, R$ 29,99). O Pro deve ser reconfirmado com a loja ao abrir o app.
2. **IDs reais do AdMob:** veja "Anúncios reais" acima.
3. **Dados do jogo:** `src/data/crops.json` é gerado do export da wiki (veja "Dados e licença" abaixo) e `src/data/gifts.json` (presentes) é gerado do export dos personagens; nenhum dos dois foi conferido no jogo. Nomes de itens estão em inglês.
4. **Teste no aparelho:** o plugin nativo e o parser do save nunca rodaram num Android de verdade. Teste o botão flutuante com o jogo aberto e a importação de um save real.
5. **Anti-fraude simples:** o contador de anúncios fica no aparelho, então mudar a hora do celular pode burlá-lo. Para um app pequeno costuma ser aceitável.
6. **Privacidade e termos:** publique uma política de privacidade que mencione anúncios e dados coletados.

## Dados e licença
`src/data/crops.json` vem do export XML da Stardew Valley Wiki (Fandom), conteúdo sob **CC BY-SA**. Por isso:
- o app mostra a tela **Fontes e licenças**, com link para cada página usada e para o histórico de autores;
- o conjunto de dados continua sob CC BY-SA e deve ser publicado com essa licença;
- imagens e arte do jogo **não** entram no app.

Regenerar os dados (exporte as páginas em `stardewvalley.fandom.com/wiki/Special:Export`):
```bash
npx tsx tools/importWikiCrops.ts tools/source/<arquivo>.xml
```
O relatório lista as culturas recusadas e o motivo (ex.: preço da semente ausente na wiki). Para corrigir um valor
conferido no jogo, edite `tools/overrides.json` e rode o comando de novo:
```json
{ "Blueberry": { "sellPrice": 50, "note": "conferido na loja do jogo" } }
```

Presentes (exporte as páginas dos personagens e a página `Gifts`):
```bash
npx tsx tools/importWikiGifts.ts tools/source/<arquivo>.xml
```
As páginas dos personagens têm formatos diferentes; o parser tenta todos e o relatório mostra quantos itens saíram em cada
gosto, avisos e páginas sem dados. Grupos ("All Eggs"...) não viram itens. Gostos universais e exceções vêm da página `Gifts`.

## Testar no celular sem computador
- **Prévia no navegador:** `VITE_PREVIEW=true npx vite build --base=./ --outDir dist-preview` gera uma versão web com anúncios e compra simulados.
- **APK na nuvem:** envie o projeto para um repositório do GitHub e rode a ação "APK de teste" (aba Actions › Run workflow).
  Ao terminar, baixe o artefato `valley-tracker-apk`, extraia o zip e instale o `app-debug.apk` (permita instalar de fontes
  desconhecidas). Troque `appId` em `capacitor.config.ts` por um ID seu antes de publicar na Play Store.
