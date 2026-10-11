import './App.css'
import HeroArt from './components/HeroArt.tsx'
import PipelineScheme from './components/PipelineScheme.tsx'
import { REPO_URL, repoFileUrl } from './repo.ts'

function App() {
  return (
    <main className="page">
      <header className="hero">
        <p className="hero-kicker">Claude Code · команды и агент проверки</p>
        <h1>Конвейер разработки с ИИ-агентами</h1>
        <p className="hero-lead">
          план → реализация → изолированная проверка → ревью другой моделью
        </p>
        <HeroArt />
        <ul className="hero-links">
          <li>
            <a href={REPO_URL}>Репозиторий на GitHub</a>
          </li>
          <li>
            <a href={repoFileUrl('README.md')}>README</a>
          </li>
        </ul>
        <p className="hero-note">Остальные разделы сайта в работе.</p>
      </header>

      <section id="pipeline" className="section" aria-labelledby="pipeline-title">
        <h2 id="pipeline-title">Конвейер</h2>
        <p className="section-lead">
          Нажмите на шаг: откроется, что он делает, что получает и отдаёт, где
          решение остаётся за человеком, файл команды и фрагмент настоящего
          документа из прогона, которым собран этот сайт.
        </p>
        <PipelineScheme />
      </section>
    </main>
  )
}

export default App
