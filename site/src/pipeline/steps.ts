import fragments from 'virtual:pipeline-fragments'
import type { Fragment } from './fragment.ts'

export interface StepFragment extends Fragment {
  path: string
  label: string
}

export interface PipelineStep {
  id: string
  title: string
  optional: boolean
  summary: string
  input: string
  output: string
  human: string
  model?: string
  file: string
  fragment?: StepFragment
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'roadmap',
    title: '/roadmap',
    optional: true,
    summary:
      'Роадмап большой задачи — декомпозиция на части-планы с общей памятью фактов. Шагов и кода не пишет.',
    input: 'Описание большой задачи; пустое — STOP.',
    output:
      'docs/roadmaps/<префикс>_<slug>.md: части (цель, результат, dependsOn, статус, план), «Факты», «Решения», «Допущения», «Вне объёма».',
    human:
      'Критичные вопросы до роадмапа — ответ записывается в «Решения». Частей три или меньше — STOP «Это один /plan».',
    model: 'opus',
    file: 'harness/commands/roadmap.md',
    fragment: { ...fragments.roadmap, label: 'Пункт 3 в роадмапе этого сайта' },
  },
  {
    id: 'plan',
    title: '/plan',
    optional: false,
    summary:
      'Составляет план реализации, кода не пишет. После сохранения плана — кросс-ревью другой моделью (Codex, codex exec --sandbox read-only): ревьюер без контекста обсуждения и файлов не меняет, каждое замечание проверяется по коду, вердикты «принято/отклонено», принятые правки — в файл плана, один цикл.',
    input:
      'Текст задачи или путь к роадмапу с номером пункта; флаг --no-codex пропускает кросс-ревью.',
    output:
      'docs/plans/<префикс>_<slug>.md: шаги (цель, файл, изменение, референс, риск, проверка, dependsOn), критерии приёмки, «Не делаем», «Решения», «Допущения»; у пункта роадмапа — статус 📝 и путь плана.',
    human:
      'Критичные вопросы до плана — ответ в «Решения». STOP по статусу, dependsOn и «Фактам» пункта роадмапа; больше трёх частей — STOP с предложением /roadmap; критичное замечание кросс-ревью — STOP.',
    model: 'opus',
    file: 'harness/commands/plan.md',
    fragment: { ...fragments.plan, label: 'Шаг плана пункта 3 (каркас сайта)' },
  },
  {
    id: 'implement',
    title: '/implement',
    optional: false,
    summary:
      'Реализует план по шагам с проверкой после каждого и передаёт проверку агенту verifier.',
    input: 'Путь к плану или самый свежий план без -verify.md.',
    output:
      'Правки по шагам, таблица итогов, отчёт агента verifier дословно, обновлённый статус пункта роадмапа и «Факты».',
    human:
      'Несколько планов-кандидатов; ❌ preflight (Docker, порты, внешние API); ⏭️/❌ в челлендже плана; тест-шаг прошёл сразу; две неудачные попытки product-шага; упавший шаг; подтверждение DEFERRED. Коммит при PASSED предлагается, а не делается.',
    model: 'opus',
    file: 'harness/commands/implement.md',
    fragment: {
      ...fragments.implement,
      label: 'Отклонение, согласованное при реализации пункта 3 и записанное в «Решения» плана',
    },
  },
  {
    id: 'verifier',
    title: 'verifier',
    optional: false,
    summary:
      'Изолированная верификация реализации плана. Контекста реализации у агента нет намеренно: он проверяет файл плана и фактическое состояние репозитория. Инструменты — Read, Grep, Glob, Bash, Write, ToolSearch, Chrome-расширение.',
    input:
      'Только путь к плану: задание «Проверь план <путь>» из /implement; из /code-review — только если правки внесены и у плана уже есть -verify.md.',
    output:
      'docs/plans/<план>-verify.md: статус каждого шага, вывод команд проверки, браузерная приёмка, критерии приёмки, итог PASSED/FAILED/PARTIAL.',
    human:
      'Своих точек решения у агента нет: отчёт возвращается в вызвавшую команду — /implement или /code-review.',
    model: 'opus',
    file: 'harness/agents/verifier.md',
    fragment: { ...fragments.verifier, label: 'Итог отчёта verifier по пункту 3' },
  },
  {
    id: 'code-review',
    title: '/code-review',
    optional: false,
    summary:
      'Независимое ревью диффа другой моделью (Codex); принятые замечания правятся на месте. Ревьюер (codex exec --sandbox read-only) без контекста обсуждения и файлов не меняет, каждое замечание проверяется по коду, один цикл без повторного ревью.',
    input:
      'Необязательные путь к плану и git-диапазон. Без диапазона — незакоммиченные изменения против HEAD, новые неотслеживаемые файлы туда не попадают; пустой дифф — STOP.',
    output:
      'docs/plans/<план>-review.md — таблица замечаний с вердиктом «исправлено/STOP/отклонено» — и правки по принятым замечаниям.',
    human:
      'Повторное ревью при существующем -review.md; вердикт STOP (правка меняет подход, выходит за файлы диффа или трогает существующий тест); DEFERRED после повторной проверки.',
    file: 'harness/commands/code-review.md',
    fragment: {
      ...fragments['code-review'],
      label: 'Замечания ревью другой моделью по пункту 3',
    },
  },
  {
    id: 'manual',
    title: '/manual',
    optional: false,
    summary: 'Генерирует мануал ручного тестирования по плану и верификации.',
    input: 'Путь к плану и к -verify.md.',
    output:
      'Один файл docs/manual/<префикс>_<slug>.md со сценариями «Действие → Ожидание»; ограничения из верификации помечены «багом не считать».',
    human: 'Нет плана и верификации — команда спрашивает пути.',
    file: 'harness/commands/manual.md',
    fragment: { ...fragments.manual, label: 'Сценарий из мануала пункта 3' },
  },
]
