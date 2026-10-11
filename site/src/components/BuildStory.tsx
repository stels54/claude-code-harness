import { repoFileUrl } from '../repo.ts'
import {
  BUILD_STORY,
  PARTIAL_NOTE,
  SELF_PLAN,
  type StoryFragment as StoryFragmentData,
} from '../sections/build-story.ts'

function StoryFragment({ fragment }: { fragment: StoryFragmentData }) {
  return (
    <figure className="step-fragment">
      <figcaption>
        {fragment.label}:{' '}
        <a
          href={repoFileUrl(fragment.path, { from: fragment.fromLine, to: fragment.toLine })}
          rel="noreferrer"
        >
          {fragment.path},{' '}
          {fragment.fromLine === fragment.toLine
            ? `строка ${fragment.fromLine}`
            : `строки ${fragment.fromLine}–${fragment.toLine}`}
        </a>
        {fragment.partial && `; ${PARTIAL_NOTE}`}
      </figcaption>
      <details>
        <summary>Фрагмент</summary>
        <pre>{fragment.text}</pre>
      </details>
    </figure>
  )
}

function BuildStory() {
  return (
    <section id="build" className="section build-story" aria-labelledby="build-title">
      <h2 id="build-title">{BUILD_STORY.title}</h2>
      <p className="section-lead">{BUILD_STORY.lead}</p>
      {BUILD_STORY.stages.map((stage) => (
        <div key={stage.id} className="build-stage">
          <h3>{stage.title}</h3>
          <p className="build-stage-lead">{stage.lead}</p>
          <ul className="info-items build-events">
            {stage.events.map((event) => (
              <li key={event.id} className="info-item">
                <h4>{event.title}</h4>
                <p>{event.text}</p>
                {event.fragments.map((fragment) => (
                  <StoryFragment
                    key={`${fragment.path}:${fragment.fromLine}`}
                    fragment={fragment}
                  />
                ))}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="build-self">
        Этот раздел собран тем же конвейером:{' '}
        <a href={repoFileUrl(SELF_PLAN.path)} rel="noreferrer">
          {SELF_PLAN.label}
        </a>
        .
      </p>
    </section>
  )
}

export default BuildStory
