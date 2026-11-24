import { useMemo, useState } from 'react'
import { fixtures } from '../data/fixtures'
import { teams } from '../data/teams'
import type { Fixture, Team } from '../types/standings'
import './FixturesSection.css'

const teamsById = new Map(teams.map((team) => [team.id, team]))

function getTeam(fixture: Fixture, side: 'home' | 'away'): Team {
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

function FixtureCard({ fixture }: { fixture: Fixture }) {
  const homeTeam = getTeam(fixture, 'home')
  const awayTeam = getTeam(fixture, 'away')
  const formattedDate = formatFixtureDate(fixture.date)

  return (
    <article className="fixture-card">
      <div className="fixture-local">
        <span>LOCAL</span>
        <strong>{formattedDate.shortDate}</strong>
        <em>{formattedDate.weekday}</em>
        <small>{fixture.time}</small>
      </div>
      <div className="fixture-matchup" aria-label={`${homeTeam.name} x ${awayTeam.name}`}>
        <span>{homeTeam.abbreviation}</span>
        <strong>X</strong>
        <span>{awayTeam.abbreviation}</span>
      </div>
    </article>
  )
}

export function FixturesSection() {
  const rounds = useMemo(() => [...new Set(fixtures.map((fixture) => fixture.round))].sort((a, b) => a - b), [])
  const [activeRound, setActiveRound] = useState<number>(rounds[0] ?? 1)

  const roundFixtures = useMemo(
    () => fixtures.filter((fixture) => fixture.round === activeRound),
    [activeRound],
  )

  const showPreviousRound = () => {
    if (rounds.length === 0) {
      return
    }

    setActiveRound((currentRound) => {
      const currentIndex = rounds.indexOf(currentRound)
      const nextIndex = currentIndex <= 0 ? rounds.length - 1 : currentIndex - 1
      return rounds[nextIndex]
    })
  }

  const showNextRound = () => {
    if (rounds.length === 0) {
      return
    }

    setActiveRound((currentRound) => {
      const currentIndex = rounds.indexOf(currentRound)
      const nextIndex = currentIndex === -1 || currentIndex >= rounds.length - 1 ? 0 : currentIndex + 1
      return rounds[nextIndex]
    })
  }

  return (
    <section className="fixtures-section" id="jogos">
      <div className="fixtures-heading">
        <div>
          <div className="section-kicker">AGENDA DO CAMPEONATO</div>
          <h2>Próximos jogos</h2>
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
          {roundFixtures.map((fixture) => <FixtureCard fixture={fixture} key={fixture.id} />)}
        </div>
        {roundFixtures.length === 0 && (
          <div className="fixtures-empty" role="status">Não há jogos programados para essa rodada.</div>
        )}
      </div>

      <p className="fixtures-source">
        Programação consultada em 8 de novembro de 2026. Horários sujeitos a alteração. Fonte:{' '}
        <a href="https://www.espn.com.br/futebol/classificacao/_/liga/bra.1" target="_blank" rel="noreferrer">ESPN Brasil</a>.
      </p>
    </section>
  )
}
