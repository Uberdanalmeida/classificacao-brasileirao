import { useMemo, useState } from 'react'
import type { Fixture, Team } from '../types/standings'
import './FixturesSection.css'

interface FixturesSectionProps {
  fixtures: Fixture[]
  teams: Team[]
}

function getTeam(fixture: Fixture, side: 'home' | 'away', teamsById: Map<string, Team>): Team {
  const team = teamsById.get(side === 'home' ? fixture.homeTeamId : fixture.awayTeamId)

  if (!team) {
    throw new Error(`Clube não encontrado para a partida ${fixture.id}`)
  }

  return team
}

function formatFixtureDate(date: string) {
  const parsedDate = new Date(`${date}T12:00:00-03:00`)
  const weekday = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    timeZone: 'America/Sao_Paulo',
  }).format(parsedDate)
  const day = String(parsedDate.getDate()).padStart(2, '0')
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')

  return {
    shortDate: `${day}/${month}`,
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
  }
}

function FixtureCard({ fixture, teamsById }: { fixture: Fixture; teamsById: Map<string, Team> }) {
  const homeTeam = getTeam(fixture, 'home', teamsById)
  const awayTeam = getTeam(fixture, 'away', teamsById)
  const formattedDate = formatFixtureDate(fixture.date)
  const hasScore = typeof fixture.homeScore === 'number' && typeof fixture.awayScore === 'number'
  const matchStatus = fixture.status === 'IN_PLAY'
    ? 'AO VIVO'
    : fixture.status === 'PAUSED'
      ? 'INTERVALO'
      : fixture.status === 'FINISHED'
        ? 'ENCERRADO'
        : fixture.status === 'POSTPONED'
          ? 'ADIADO'
          : fixture.status === 'CANCELLED'
            ? 'CANCELADO'
            : fixture.time

  return (
    <article className="fixture-card">
      <div className="fixture-local">
        <span>LOCAL</span>
        <strong>{formattedDate.shortDate}</strong>
        <em>{formattedDate.weekday}</em>
        <small>{matchStatus}</small>
      </div>
      <div className="fixture-matchup" aria-label={`${homeTeam.name} x ${awayTeam.name}`}>
        <span>{homeTeam.abbreviation}</span>
        <strong>{hasScore ? `${fixture.homeScore} – ${fixture.awayScore}` : 'X'}</strong>
        <span>{awayTeam.abbreviation}</span>
      </div>
    </article>
  )
}

export function FixturesSection({ fixtures, teams }: FixturesSectionProps) {
  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams])
  const rounds = useMemo(
    () => [...new Set(fixtures.map((fixture) => fixture.round))].sort((a, b) => a - b),
    [fixtures],
  )
  const currentRound = useMemo(() => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
    return fixtures.find((fixture) => fixture.date >= today && fixture.status !== 'FINISHED')?.round ?? rounds[0] ?? 1
  }, [fixtures, rounds])
  const [selectedRound, setSelectedRound] = useState<number | null>(null)
  const activeRound = selectedRound !== null && rounds.includes(selectedRound) ? selectedRound : currentRound

  const roundFixtures = useMemo(
    () => fixtures.filter((fixture) => fixture.round === activeRound),
    [fixtures, activeRound],
  )

  const showPreviousRound = () => {
    if (rounds.length === 0) {
      return
    }

    setSelectedRound((selected) => {
      const currentIndex = rounds.indexOf(selected ?? activeRound)
      const nextIndex = currentIndex <= 0 ? rounds.length - 1 : currentIndex - 1
      return rounds[nextIndex]
    })
  }

  const showNextRound = () => {
    if (rounds.length === 0) {
      return
    }

    setSelectedRound((selected) => {
      const currentIndex = rounds.indexOf(selected ?? activeRound)
      const nextIndex = currentIndex === -1 || currentIndex >= rounds.length - 1 ? 0 : currentIndex + 1
      return rounds[nextIndex]
    })
  }

  return (
    <section className="fixtures-section" id="jogos">
      <div className="fixtures-heading">
        <div>
          <div className="section-kicker">AGENDA DO CAMPEONATO</div>
          <h2>Jogos da rodada</h2>
        </div>
        <span className="fixtures-count"><strong>{roundFixtures.length}</strong> partidas</span>
      </div>

      <div className="fixture-round-nav" aria-label="Navegação por rodada">
        <button className="fixture-round-arrow" onClick={showPreviousRound} type="button" aria-label="Rodada anterior">
          ‹
        </button>
        <span className="fixture-round-label">{activeRound}ª RODADA</span>
        <button className="fixture-round-arrow" onClick={showNextRound} type="button" aria-label="Próxima rodada">
          ›
        </button>
      </div>

      <div className="fixture-days" aria-live="polite">
        <div className="fixture-grid">
          {roundFixtures.map((fixture) => (
            <FixtureCard
              fixture={fixture}
              teamsById={teamsById}
              key={fixture.id}
            />
          ))}
        </div>
        {roundFixtures.length === 0 && (
          <div className="fixtures-empty" role="status">Não há jogos programados para essa rodada.</div>
        )}
      </div>

      <p className="fixtures-source">
        Atualização automática a cada 5 minutos. O plano gratuito pode atrasar os placares. Fonte:{' '}
        <a href="https://www.football-data.org/" target="_blank" rel="noreferrer">football-data.org</a>.
      </p>
    </section>
  )
}
