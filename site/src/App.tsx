import './App.css'

const repoUrl = 'https://github.com/stels54/claude-code-harness'

function App() {
  return (
    <main className="stub">
      <h1>Конвейер разработки с ИИ-агентами</h1>
      <p>
        План → реализация → изолированная проверка → ревью другой моделью.
        Сайт в разработке.
      </p>
      <ul>
        <li>
          <a href={repoUrl}>Репозиторий на GitHub</a>
        </li>
        <li>
          <a href={`${repoUrl}/blob/main/README.md`}>README</a>
        </li>
      </ul>
    </main>
  )
}

export default App
