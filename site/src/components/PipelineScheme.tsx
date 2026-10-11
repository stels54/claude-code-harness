import { useState } from 'react'
import { PIPELINE_STEPS, type PipelineStep } from '../pipeline/steps.ts'
import { repoFileUrl } from '../repo.ts'
import './PipelineScheme.css'

interface StepProps {
  step: PipelineStep
  index?: number
  open: boolean
  onToggle: () => void
}

function StepDetails({ step }: { step: PipelineStep }) {
  return (
    <div className="step-details">
      <dl className="step-facts">
        <dt>Что делает</dt>
        <dd>{step.summary}</dd>
        <dt>Вход</dt>
        <dd>{step.input}</dd>
        <dt>Выход</dt>
        <dd>{step.output}</dd>
        <dt>Решение за человеком</dt>
        <dd>{step.human}</dd>
        {step.model && (
          <>
            <dt>Модель</dt>
            <dd>{step.model}</dd>
          </>
        )}
      </dl>
      <p className="step-link">
        Файл команды:{' '}
        <a href={repoFileUrl(step.file)} rel="noreferrer">
          {step.file}
        </a>
      </p>
      {step.fragment ? (
        <figure className="step-fragment">
          <figcaption>
            {step.fragment.label}:{' '}
            <a
              href={repoFileUrl(step.fragment.path, {
                from: step.fragment.fromLine,
                to: step.fragment.toLine,
              })}
              rel="noreferrer"
            >
              {step.fragment.path}, строки {step.fragment.fromLine}–{step.fragment.toLine}
            </a>
          </figcaption>
          <pre>{step.fragment.text}</pre>
        </figure>
      ) : (
        <p className="step-nodoc">Документа этой команды в репозитории нет.</p>
      )}
    </div>
  )
}

function Step({ step, index, open, onToggle }: StepProps) {
  const panelId = `step-panel-${step.id}`
  return (
    <li className={`step step-chain${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="step-button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {index !== undefined && <span className="step-index">{index}</span>}
        <span className="step-title">{step.title}</span>
        {step.optional && <span className="step-tag">опционально</span>}
      </button>
      <div id={panelId} className="step-panel" hidden={!open}>
        {open && <StepDetails step={step} />}
      </div>
    </li>
  )
}

function PipelineScheme() {
  const [openId, setOpenId] = useState<string | null>(null)
  const toggle = (id: string) => setOpenId((current) => (current === id ? null : id))

  return (
    <div className="scheme">
      <ol className="scheme-chain">
        {PIPELINE_STEPS.map((step, i) => (
          <Step
            key={step.id}
            step={step}
            index={i + 1}
            open={openId === step.id}
            onToggle={() => toggle(step.id)}
          />
        ))}
      </ol>
    </div>
  )
}

export default PipelineScheme
