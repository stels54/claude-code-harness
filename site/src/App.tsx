import './App.css'
import HeroArt from './components/HeroArt.tsx'
import { DeviceSection, LimitsSection, WhySection } from './components/InfoSections.tsx'
import PipelineScheme from './components/PipelineScheme.tsx'
import SiteFooter from './components/SiteFooter.tsx'
import { REPO_URL, repoFileUrl } from './repo.ts'

function App() {
  return (
    <>
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
            <li>
              <a href="#why">Зачем</a>
            </li>
            <li>
              <a href="#pipeline">Конвейер</a>
            </li>
            <li>
              <a href="#device">Устройство</a>
            </li>
            <li>
              <a href="#limits">Ограничения</a>
            </li>
            <li>
              <a href="#author">Автор</a>
            </li>
          </ul>
          <p className="hero-note">Раздел «Как собран этот сайт» в работе.</p>
        </header>

        <WhySection />

        <section id="pipeline" className="section" aria-labelledby="pipeline-title">
          <h2 id="pipeline-title">Конвейер</h2>
          <p className="section-lead">
            Нажмите на шаг: откроется, что он делает, что получает и отдаёт, где
            решение остаётся за человеком, файл команды и фрагмент настоящего
            документа из прогона, которым собран этот сайт.
          </p>
          <PipelineScheme />
        </section>

        <DeviceSection />
        <LimitsSection />
      </main>
      <SiteFooter />
    </>
  )
}

export default App
