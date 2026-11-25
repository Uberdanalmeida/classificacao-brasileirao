import { useEffect, useMemo, useState } from 'react'
import { FixturesSection } from './components/FixturesSection'
import { StandingsTable } from './components/StandingsTable'
import { teams } from './data/teams'
import { fixtures as fallbackFixtures } from './data/fixtures'
import type { Fixture, StandingTeam, Team } from './types/standings'
import { getStandings } from './utils/standings'
import './App.css'

interface CompetitionData {
  teams: Team[]
  standings: StandingTeam[]
  fixtures: Fixture[]
  updatedAt: string
  stale: boolean
  warning: string | null
}

const defaultTeamColors: [string, string] = ['#536157', '#ffffff']

function addTeamColors<T extends Team>(team: T): T & { colors: [string, string] } {
  const knownTeam = teams.find((item) =>
    item.abbreviation === team.abbreviation ||
    item.shortName === team.shortName ||
    item.name === team.name,
  )

  return { ...team, colors: knownTeam?.colors ?? defaultTeamColors }
}

function App() {
  const [liveTeams, setLiveTeams] = useState<Team[]>(teams)
  const [standings, setStandings] = useState<StandingTeam[]>(() => getStandings(teams))
  const [fixtures, setFixtures] = useState<Fixture[]>(fallbackFixtures)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function refreshData() {
      try {
        const response = await fetch('/api/data')
        const body = await response.json() as CompetitionData | { error?: string }

        if (!response.ok) {
          throw new Error('error' in body && body.error ? body.error : 'Não foi possível carregar os dados.')
        }

        const data = body as CompetitionData
        if (!active) return

        setLiveTeams(data.teams.map(addTeamColors))
        setStandings(data.standings.map(addTeamColors))
        setFixtures(data.fixtures)
        setUpdatedAt(data.updatedAt)
        setSyncError(data.warning)
      } catch (error) {
        if (!active) return
        setSyncError(error instanceof Error ? error.message : 'Falha inesperada ao atualizar os dados.')
      }
    }

    void refreshData()
    const intervalId = window.setInterval(() => void refreshData(), 60_000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  const updateLabel = useMemo(() => {
    if (!updatedAt) return null

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(updatedAt))
  }, [updatedAt])

  return (
    <div className="app-shell">
      <main id="inicio" className="app-main">
        <h1 className="page-title">Brasileirão <span>Série A</span></h1>
        <p className={`data-sync-status${syncError ? ' data-sync-warning' : ''}`} role="status">
          {syncError
            ? `Atualização indisponível: ${syncError}`
            : updateLabel
              ? `Dados atualizados em ${updateLabel} (horário de Brasília).`
              : 'Conectando à fonte de dados do campeonato…'}
        </p>
        <div className="competition-layout">
          <section className="standings-section" id="classificacao">
            <StandingsTable standings={standings} />
          </section>
          <FixturesSection fixtures={fixtures} teams={liveTeams} />
        </div>
      </main>
    </div>
  )
}

export default App
