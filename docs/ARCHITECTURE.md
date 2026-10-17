# Arquitetura: mapa detalhado

Detalhamento do "Mapa do Projeto" do `CLAUDE.md`. As regras de negócio e de UI ficam no
`CLAUDE.md` e em `docs/design.md`; aqui só está o que cada arquivo faz.

## Rotas (`app/`)

O `Stack` raiz (`app/_layout.tsx`) contém as abas e as telas acima delas.

| Rota | Arquivo | Papel |
|---|---|---|
| `/` | `app/(tabs)/index.tsx` | Aba Workout: carrossel de rotinas (‹ nome ⋮ › e pontinhos; a rotina mostrada lista seus workouts abaixo), `+` de New Routine no cabeçalho e o FAB Start Empty Workout |
| `/exercises` | `app/(tabs)/exercises.tsx` | Aba Exercises: busca + cards de categoria (5 categorias + Custom) |
| `/profile` | `app/(tabs)/profile.tsx` | Aba Profile: botão de Settings, perfil, estatísticas, gráfico de FG%, últimas 5 sessões |
| — | `app/(tabs)/_layout.tsx` | Abas (`js-top-tabs` com a barra embaixo, swipe entre abas, `ResumeBanner`) |
| `/active-workout` | `app/active-workout.tsx` | Treino em andamento (timer, cards de exercício, Finish) |
| `/add-exercise` | `app/add-exercise.tsx` | Modal de escolha de exercício (`?to=template` adiciona ao rascunho) |
| `/add-to-routine` | `app/add-to-routine.tsx` | Modal: escolhe um workout (ou cria um) e o modo do arremesso |
| `/edit-workout` | `app/edit-workout.tsx` | Editor de template (`?routineId=` cria, `?workoutId=` edita) |
| `/edit-exercise` | `app/edit-exercise.tsx` | Formulário de exercício custom (sem parâmetro cria, `?exerciseId=` edita) |
| `/edit-profile` | `app/edit-profile.tsx` | Formulário do perfil (nome e foto) |
| `/tactical-board` | `app/tactical-board.tsx` | Editor da prancheta tática (`?sessionExerciseId=` ou `?draftKey=`) |
| `/history` | `app/history.tsx` | Histórico completo por mês (o "See all" do Profile) |
| `/settings` | `app/settings.tsx` | Configurações (aberta pelo botão no topo do Profile): seção Appearance (System / Light / Dark) e seção de idioma (`ChipRow` cada), versão do app no rodapé |
| `/session/[id]` | `app/session/[id].tsx` | Detalhe somente leitura de uma sessão finalizada |
| `/workout-summary/[id]` | `app/workout-summary/[id].tsx` | Resumo exibido depois do Finish |
| `/exercise/[id]` | `app/exercise/[id].tsx` | Detalhe do exercício (mídia, descrição, "Your stats", menu ⋮ se custom) |
| `/category/[key]` | `app/category/[key].tsx` | Exercícios de uma categoria (ou `custom`) |

## `src/domain/`: regras puras, sem banco

| Arquivo | Papel |
|---|---|
| `types.ts` | Listas de enums (categorias, `trackingType`, `targetMode`, status) |
| `validation.ts` | Validações que retornam `{ ok, reason }` |
| `errors.ts` | `DomainError`, lançado pelos repositórios |
| `fg.ts` | FG% de um set e sua faixa (`fgBand`: bom > 60, ruim < 40) |
| `summary.ts` | Resumos de exercício e de sessão |
| `exerciseStats.ts` | Estatísticas de um exercício ao longo das sessões |
| `template.ts` | Estrutura comum de template e sessão (detecta se a estrutura mudou no Finish) |
| `tacticalBoard.ts` | Modelo da prancheta (pontos normalizados, elementos), regras e comparação |
| `format.ts` | Formatação de FG%, contagens, timer, `durationParts` e datas (recebem `locale`); sem palavras em inglês |
| `media.ts` | Tipo de mídia pela extensão, limite de vídeo |
| `defaults.ts` | Metas padrão, `timeOfDay` (manhã/tarde/noite, sem o nome em si) |
| `order.ts` | `moveItem` (reordenação) |

Nenhum arquivo aqui importa i18n nem guarda texto em inglês (`messages.ts` e os mapas `*_LABELS`
foram removidos na Fase 9.5): `src/i18n/` e a camada de UI transformam `reason`, enums e os
números acima em palavras.

## `src/db/`: persistência (SQLite + Drizzle)

| Arquivo | Papel |
|---|---|
| `schema.ts` | Tabelas: `exercises`, `routines`, `workouts`, `workout_exercises`, `template_sets`, `sessions`, `session_exercises`, `session_sets` |
| `types.ts` | Tipo `Db` (serve para expo-sqlite, better-sqlite3 e `tx`) e tipos das linhas |
| `client.ts` | Abre `basket-routine.db` no aparelho |
| `useDatabaseSetup.ts` | Roda as migrations e o seed na inicialização |
| `migrations/` | Gerado pelo `drizzle-kit` (`0000`–`0002`); somente acréscimo, nunca editar |
| `seed/` | Os 44 exercícios predefinidos (`exercises.ts`) e o upsert por `seedKey` (`seed.ts`) |
| `repositories/` | Funções `(db, ...)` por agregado: `exercises`, `routines`, `workouts`, `sessions` (+ `common.ts`) |
| `test-utils.ts` | `createTestDb()`: banco em memória com as migrations reais |

## `src/i18n/`: i18next

| Arquivo | Papel |
|---|---|
| `translations/en.ts` | Dicionário em inglês, agrupado por feature; é o formato que `pt-BR.ts` segue (uma chave errada ou faltando falha o `typecheck`); `errors` é tipado `Record<DomainErrorReason, string>` |
| `translations/pt-BR.ts` | Dicionário em português, mesmas chaves |
| `translations/parity.test.ts` | Garante que os dois arquivos têm exatamente as mesmas chaves |
| `i18n.ts` | Inicializa o i18next no idioma salvo (lido de forma síncrona), com fallback `en`; importado uma vez em `app/_layout.tsx` antes da primeira renderização |
| `i18next.d.ts` | `CustomTypeOptions` a partir de `en.ts`, para `t('chave')` ser tipado |
| `format.ts` | As palavras em volta de `durationParts` e `splitExerciseList` do domain, recebendo `t` |

## `src/features/`: uma pasta por funcionalidade

Padrão de cada feature: `actions.ts` (toda escrita: chama o repositório, avisa o `dataStore`,
converte `DomainError` em `{ ok: false, reason }`), `hooks.ts` (leituras que acompanham a versão
dos dados) e os componentes da feature. `src/features/dataStore.ts` é o store único (contador de
versão, `run`, `ActionResult`).

| Pasta | Conteúdo |
|---|---|
| `workout/` | Treino ativo: `ExerciseCard`, linhas de set (`ShootingSetRow`, `CheckSetRow`, `SetNumber`), `useNumberCell` + `setDraft` (salvar a cada tecla, desfazer no blur), `setTable` (colunas), `SetTableHeader`, `ExerciseNote`, `ResumeBanner`, `TargetModeSheet`, `navigation.ts` (`leaveScreen`) |
| `routines/` | Rotinas e templates: `RoutineCarousel` (seletor de rotina da aba Workout), `RoutineWorkouts` (os workouts da rotina mostrada), `WorkoutCard`, `RoutineChoiceSection`, lista arrastável de exercícios (`DraggableExerciseList`), o editor (`templateDraft.ts`, `draftStore.ts`, `loadDraft.ts`, `TemplateExerciseCard`, `TemplateSetRow`) |
| `history/` | Histórico: `historyList.ts` (itens, agrupamento por mês, dados do gráfico, estatísticas do perfil), `HistoryRow`, `MonthHeader`, `SessionTotals`, `SessionExerciseView`, `FgChart`, `FgEvolutionCard` |
| `exercises/` | Catálogo: `catalogList.ts`, `CategoryCard` + `categoryImages.ts`, `ExerciseList`, `ExerciseRow`, `ExerciseThumbnail` (a mídia no cabeçalho dos cards do treino ativo e do editor de template), `ExerciseStatsCard`, mídia (`MediaView`, `mediaSource`, `mediaFiles`, `seedMedia`, `videoThumbnail`) |
| `profile/` | Perfil: `profileStorage.ts` (nome e foto no `expo-sqlite/kv-store`, fora do schema), `actions.ts`, `hooks.ts`, `Avatar`, `ProfileCard`, `ProfileStatsCard`, `profileText.ts` |
| `settings/` | Idioma e tema (Fase 9.5): `languages.ts` (os dois códigos suportados, cada um com seu locale `Intl` e seu nome escrito nele mesmo), `languageStorage.ts` (`readLanguage`/`writeLanguage` no `expo-sqlite/kv-store`, mesmo arquivo do perfil), `actions.ts` (`setLanguage`), `hooks.ts` (`useLanguage`), `LanguagePickerGate.tsx` (seletor de idioma, não é uma rota), `launchGate.ts` (`askLanguageOnLaunch()` = `__DEV__`: a cada abertura só em desenvolvimento; desligado no Jest), `themeStorage.ts` (preferência de tema no `expo-sqlite/kv-store`, padrão `dark`), `themePreference.ts` (store + `useThemePreference`), `setThemePreference` em `actions.ts` |
| `tacticalBoard/` | Prancheta tática: `CourtBoard` (SVG da meia quadra), `BoardToolbar`, `boardEditor.ts` (estado do editor e ferramentas), `courtGeometry.ts`, `loadBoard.ts` (sessão ou rascunho), `TacticalBoardSlot` (miniatura no card), `boardDescription.ts` (`describeBoard(t, board)`, a descrição para leitor de tela) |

## `src/components/`, `src/theme/`, `src/test-utils/`

- `components/`: componentes base (`Screen`, `AppText`, `Button`, `Card`, `ListItem`, `Icon`,
  `IconButton`, `NumberInput`, `TextField`, `ChipRow`, `ActionSheet`, `NameDialog`,
  `SwipeToDelete`, `TabBar`, `BottomActionBar`, `Fab`, `ElapsedTimer`, `StatTile`, `EmptyState`),
  `fgTone.ts`, `haptics.ts` e os hooks de teclado.
- `theme/`: tokens (`colors` com as paletas `darkColors` e `lightColors`, `fonts`, `typography`, `spacing`, `navigationThemeFor`), `scheme.ts` (preferência e `resolveScheme`), `ThemeContext.tsx` (`AppThemeProvider`, `useTheme`, `useColors`) e `makeStyles.ts` (estilos por paleta, em cache). Os papéis
  estão em `docs/design.md`.
- `test-utils/a11y.ts`: `expectAccessibleControls()`, chamado em todo teste de fluxo.

## Testes

- Unitários ao lado do código (`*.test.ts(x)`); os de banco usam o docblock
  `@jest-environment node` e `createTestDb()`.
- Fluxos de ponta a ponta em `__tests__/` (`shell`, `active-workout`, `routines`, `history`,
  `exercises`, `tactical-board`, `language`, `theme`), com `renderRouter` e o layout raiz real.
- `jest.setup.js`: mocks de módulos nativos (haptics, file system, image picker, image, video,
  swipeable, `expo-sqlite/kv-store` em memória) e importa `src/i18n/i18n.ts`, para o i18next
  estar inicializado (em inglês) em todo teste, não só nos que renderizam o layout raiz real.

## Configuração e build

| Arquivo | Papel |
|---|---|
| `package.json` | Scripts (`lint`, `format`, `typecheck`, `test`, `db:generate`) e config do Jest (`jest-expo/android`, alias `@/` → `src/`) |
| `app.json` | Config do Expo: nome, ícones, splash, `android.package` (imutável), ID do projeto EAS |
| `eas.json` | Perfis do EAS Build (`preview` gera o APK) |
| `drizzle.config.ts` | `drizzle-kit`: schema em `src/db/schema.ts`, saída em `src/db/migrations` |
| `babel.config.js` / `metro.config.js` | Empacotam os `.sql` das migrations no app |
| `tsconfig.json` / `eslint.config.js` / `.prettierrc` | TypeScript, lint e formatação |
| `.github/workflows/ci.yml` | CI: lint, format, typecheck, testes, schema/migrations em sincronia, `expo-doctor` |
| `.github/workflows/build-apk.yml` | Build manual do APK `preview` (`workflow_dispatch`) |
| `.claude/skills/review-plan/` | Skill do projeto para revisar planos |
