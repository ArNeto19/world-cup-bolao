# ⚽ Bolão Copa do Mundo 2026

Aplicação web para bolão de palpites da Copa do Mundo 2026, com autenticação Google, grupos de participantes, placar em tempo real e ranking automático.

---

## Stack

- **React 19 + TypeScript + Vite**
- **Material UI (MUI v6)**
- **Firebase** (plano Spark/free):
  - Authentication (Google OAuth)
  - Firestore (banco em tempo real)
  - Hosting

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

Preencha o `.env` com as chaves do Firebase Console.

---

## 3. Instalar e rodar localmente

```bash
npm install
npm run dev
# Acesse http://localhost:5173
```

---

## 4. Configurar o primeiro admin

1. Faça login com sua conta Google no app
2. No Firebase Console → Firestore → coleção `users` → seu documento
3. Altere o campo `role` de `"user"` para `"admin"`

A partir daí, gerencie roles de outros usuários em **Administração → Usuários**.

---

## 5. Importar as partidas

1. Acesse **Administração → Partidas** como admin
2. Clique em **"Importar Partidas"** — popula o Firestore com os 104 jogos

> Execute apenas uma vez.

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

## Sistema de pontuação

| Condição | Pontos |
|---|---|
| Placar exato | **10** |
| Diferença de gols correta | **5** |
| Vencedor correto | **2** |
| Empate correto | **2** |

Apenas o **maior valor** alcançado é contabilizado por partida.

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
├── components/layout/     # Sidebar + AppBar
├── data/matches.ts        # 104 jogos da Copa 2026
├── pages/
│   ├── Login/             # OAuth Google
│   ├── Dashboard/         # Resumo: grupos, placar ao vivo
│   ├── Groups/            # Listar e entrar/sair de grupos
│   ├── GroupDetail/       # Palpites + placar ao vivo + ranking
│   ├── Matches/           # Calendário completo
│   ├── Profile/           # Editar nome de exibição
│   └── Admin/             # Grupos, partidas e usuários
├── services/
│   ├── firebase.ts
│   └── firestoreService.ts
├── store/
│   ├── AuthContext.tsx
│   └── MatchesContext.tsx
├── types/index.ts
└── utils/scoring.ts
```
