import { useMemo } from 'react'
import { FixturesSection } from './components/FixturesSection'
import { StandingsTable } from './components/StandingsTable'
import { teams } from './data/teams'
import { getStandings } from './utils/standings'
import './App.css'

function App() {
  const standings = useMemo(() => getStandings(teams), [])

  return (
    <div className="app-shell">
      <main id="inicio" className="app-main">
        <h1 className="page-title">Brasileirão <span>Série A</span></h1>
        <div className="competition-layout">
          <section className="standings-section" id="classificacao">
            <StandingsTable standings={standings} />
          </section>
          <FixturesSection />
        </div>
      </main>
    </div>
  )
}

export default App
