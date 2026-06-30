# ⚽ Bolão Copa do Mundo 2026

Aplicação web para bolão de palpites da Copa do Mundo 2026, com autenticação Google, controle de acesso por aprovação, grupos de participantes, placar ao vivo, sistema de pontuação com bônus de mata-mata e ranking automático com critério de desempate.

---

## Stack

- **React 19 + TypeScript + Vite**
- **Material UI (MUI v6)** — com suporte a tema claro/escuro
- **Firebase** (plano Spark/free):
  - Authentication (Google OAuth)
  - Firestore (banco em tempo real)
  - Hosting
- **football-data.org** — sincronização de placares ao vivo (opcional)
- **Cloudflare Workers** — proxy para contornar CORS da API de placares (opcional)
- Bandeiras dos países via [FlagKit](https://github.com/madebybowtie/FlagKit) (CDN, sem dependência npm)

---

## 1. Criar o projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um novo projeto (ex: `bolao-copa-2026`)
3. Ative **Authentication → Sign-in method → Google**
4. Ative **Firestore Database** (modo produção)
5. Em **Configurações → Seus apps**, registre um app Web e copie as chaves

---

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o `.env` com as chaves do Firebase Console:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Opcional — sincronização de placares ao vivo (ver seção 7)
VITE_FOOTBALL_DATA_KEY=
VITE_FOOTBALL_DATA_PROXY=
```

---

## 3. Instalar e rodar localmente

```bash
npm install
npm run dev
# Acesse http://localhost:5173
```

---

## 4. Configurar o primeiro admin

1. Faça login com sua conta Google no app — por padrão você entra como `user` (pendente)
2. No Firebase Console → Firestore → coleção `users` → seu documento
3. Altere o campo `role` de `"user"` para `"admin"`

A partir daí, gerencie cargos de outros usuários em **Administração → Usuários**.

### Cargos disponíveis

| Cargo | Permissões |
|---|---|
| `user` | Acesso somente à tela inicial, com mensagem de cadastro pendente. Nenhuma leitura/escrita liberada no Firestore além do próprio documento. |
| `player` | Acesso completo: grupos, partidas, palpites e ranking. |
| `admin` | Tudo do `player` + gestão de grupos, partidas, placares e cargos de usuários. |

Novos cadastros entram como `user` e precisam ser aprovados pelo admin em **Administração → Usuários** (a aba mostra um badge com a contagem de pendentes).

---

## 5. Importar as partidas

1. Acesse **Administração → Partidas** como admin
2. Clique em **"Importar Partidas"** — popula o Firestore com os 104 jogos da Copa 2026 (datas/horários oficiais em UTC-3)

> Execute apenas uma vez. As partidas das fases eliminatórias (oitavas em diante) começam com times "A definir" — edite-os manualmente pela aba Partidas conforme as fases anteriores forem concluídas.

---

## 6. Deploy no Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # selecione seu projeto
npm run build
firebase deploy      # deploy das rules + hosting
```

---

## 7. (Opcional) Sincronização automática de placares ao vivo

O app pode atualizar placares e status das partidas automaticamente via [football-data.org](https://www.football-data.org), sem custo. A sincronização roda **somente no navegador de um usuário com cargo `admin`**, via polling client-side a cada 3 minutos — sem necessidade de Cloud Functions ou plano pago.

### Como funciona
- O hook `useLiveSync` monitora partidas que estão ao vivo ou a até 30 minutos do início
- A cada 3 minutos, busca o placar/status atualizado e grava no Firestore
- A mudança é propagada em tempo real para todos os usuários via `onSnapshot`

### Setup

1. Crie uma conta gratuita em [football-data.org](https://www.football-data.org) e copie seu token
2. A API bloqueia CORS para qualquer domínio que não seja `localhost` — é necessário um proxy:
   - **Em desenvolvimento**: o Vite já tem um proxy configurado (`vite.config.ts`) — basta preencher `VITE_FOOTBALL_DATA_KEY` no `.env`
   - **Em produção**: faça o deploy do Cloudflare Worker incluído em `cloudflare-proxy/`:
     ```bash
     npm install -g wrangler
     cd cloudflare-proxy
     wrangler login
     wrangler secret put FOOTBALL_DATA_KEY   # cole seu token quando solicitado
     wrangler deploy
     ```
     Copie a URL gerada (ex: `https://football-data-proxy.seu-nome.workers.dev`) para `VITE_FOOTBALL_DATA_PROXY` no `.env` e rode `npm run build && firebase deploy` novamente.

> **Limitação conhecida:** o plano gratuito do football-data.org retorna os dados com atraso em relação ao tempo real, o que pode não ser ideal dependendo do uso pretendido. Sem a chave configurada, o app funciona normalmente — os placares passam a depender de atualização manual pelo Admin.

---

## Sistema de pontuação

| Condição | Pontos |
|---|---|
| Placar exato | **10** |
| Diferença de gols correta | **5** |
| Empate correto (sem acertar o placar exato) | **4** |
| Vencedor correto | **2** (+1 para cada lado do placar acertado, até 4) |

Apenas o **maior valor** entre as condições de placar é contabilizado por partida — sem acúmulo entre elas.

### Bônus de mata-mata

A partir das oitavas de final, cada palpite também define **qual equipe se classifica**:

- Se o placar indicar um vencedor (ex: 2×1), a equipe com mais gols é marcada automaticamente como classificada
- Se o placar for empate, o jogador escolhe manualmente quem avança (simulando pênaltis/prorrogação)
- Acertar a equipe classificada vale **+2 pontos**, somados independentemente da pontuação do placar — inclusive quando o placar errou mas a classificação acertou
- Ao encerrar uma partida de mata-mata, o admin também informa qual equipe avançou; esse dado alimenta o recálculo de pontos de todos os palpites do grupo

### Critério de desempate

O ranking de cada grupo ordena por pontuação total e, em caso de empate, por **quantidade de placares exatos acertados** — exibido como um chip ao lado da pontuação de cada participante.

---

## Funcionalidades de interface

- **Tema claro/escuro** com switch no AppBar e na sidebar, preferência persistida em `localStorage`
- **Bandeiras dos 48 países** carregadas via CDN (FlagKit), com fallback neutro para times ainda não definidos ("TBD")
- **Busca por seleção** na tela de Partidas, sem distinção de acentos, cruzando todas as fases
- **Filtro por status** (Agendadas / Ao vivo / Encerradas) nas telas de Partidas, GroupDetail e Admin — partidas encerradas são ordenadas das mais recentes para as mais antigas
- **Aba de fase com auto-avanço**: ao carregar a tela, a aba selecionada pula automaticamente para a primeira fase ainda não totalmente encerrada (some quando o usuário navega manualmente)
- **Bottom navigation mobile** com item dinâmico: usuários comuns veem Início/Grupos/Partidas; admins veem Início/Grupos/Admin
- **Janela de edição de palpites** reativa: o cronômetro reavalia a cada 15 segundos (`useNow`), fechando a edição automaticamente 5 minutos antes do início da partida mesmo sem recarregar a página
- **Visualização dos palpites alheios** liberada somente após o início oficial da partida, incluindo a escolha de classificação na fase de mata-mata

---

## Limites do plano Spark (gratuito)

| Recurso | Limite gratuito |
|---|---|
| Firestore leituras | 50.000/dia |
| Firestore escritas | 20.000/dia |
| Hosting bandwidth | 10 GB/mês |
| Auth | Ilimitado |

Para grupos de até ~50 pessoas, o plano gratuito é suficiente para toda a Copa.

---

## Estrutura do projeto

```
src/
├── components/
│   ├── TeamFlag/            # Bandeira via FlagKit CDN, com fallback "TBD"
│   ├── layout/               # Sidebar + AppBar + bottom navigation (mobile)
│   └── router/                # Guards: RequireAuth, RequirePlayer, RequireAdmin
├── constants/
│   └── teams.ts               # Lista completa dos 48 países (nome + flagCode)
├── data/matches.ts            # 104 jogos da Copa 2026 (calendário oficial)
├── hooks/
│   ├── useNow.ts               # Tick reativo (15s) para janelas de tempo
│   └── useLiveSync.ts          # Polling de placares via football-data.org
├── pages/
│   ├── Login/                  # OAuth Google
│   ├── Dashboard/               # Resumo: grupos, placar ao vivo, status de aprovação
│   ├── Groups/                  # Listar e entrar/sair de grupos
│   ├── GroupDetail/
│   │   ├── Components/
│   │   │   ├── MatchCard/        # Card de palpite, com seletor de classificação
│   │   │   ├── OtherPredictions/  # Palpites alheios (pós-início da partida)
│   │   │   └── RankingTab/        # Ranking com critério de desempate
│   │   └── index.tsx
│   ├── Matches/                  # Calendário completo + busca
│   ├── Profile/                  # Editar nome de exibição
│   └── Admin/                    # Grupos, partidas (placar + classificação), usuários
├── services/
│   ├── firebase.ts
│   └── firestoreService.ts       # Toda a lógica de leitura/escrita + recálculo de pontos
├── store/
│   ├── AuthContext.tsx
│   ├── MatchesContext.tsx
│   └── ThemeContext.tsx          # Tema claro/escuro persistido
├── types/index.ts
└── utils/
    ├── formatters.ts             # normaliseString, getInitialPhase
    └── scoring.ts                  # calculateScore, deriveQualifiedTeam, canEditPrediction

cloudflare-proxy/                 # Worker de proxy CORS para football-data.org (opcional)
├── worker.js
└── wrangler.toml
```

---

## Regras de segurança (Firestore)

As regras em `firestore.rules` aplicam controle de acesso por cargo no nível do servidor, não apenas na interface:

- `user` (pendente): nenhuma leitura/escrita liberada além do próprio documento em `users`
- `player`/`admin`: leitura de grupos, partidas e palpites; escrita restrita aos próprios palpites e participação em grupos
- `admin`: única role com permissão de escrita em grupos, partidas e cargos de outros usuários

Aplique as regras com:

```bash
firebase deploy --only firestore:rules
```
