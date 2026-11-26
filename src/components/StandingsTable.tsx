import type { StandingTeam } from '../types/standings'
import './StandingsTable.css'

interface StandingsTableProps {
  standings: StandingTeam[]
}

function getPositionClass(position: number): string {
  if (position <= 4) return 'position-libertadores'
  if (position <= 6) return 'position-pre-libertadores'
  if (position >= 17) return 'position-relegation'
  return ''
}

export function StandingsTable({ standings }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="empty-state" role="status">
        <span className="empty-state-icon" aria-hidden="true">⌕</span>
        <strong>Nenhum time encontrado</strong>
        <span>Tente buscar por outro nome ou alterar o filtro.</span>
      </div>
    )
  }

  return (
    <div className="table-scroll">
      <table className="standings-table">
        <thead>
          <tr>
            <th className="position-heading" scope="col"></th>
            <th className="club-heading" scope="col">CLASSIFICAÇÃO</th>
            <th className="points-heading" scope="col">PTS</th>
            <th scope="col">PJ</th>
            <th scope="col">V</th>
            <th scope="col">E</th>
            <th scope="col">D</th>
            <th className="goals-heading" scope="col">GP</th>
            <th scope="col">GC</th>
            <th scope="col">SG</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr key={team.id}>
              <td className="position-cell">
                <span className={`position-indicator ${getPositionClass(team.position)}`} />
                <span>{team.position}</span>
              </td>
              <th className="club-cell" scope="row">
                <span
                  className="club-crest"
                  style={{
                    '--crest-primary': team.colors?.[0] ?? '#536157',
                    '--crest-secondary': team.colors?.[1] ?? '#ffffff',
                  } as React.CSSProperties}
                  aria-hidden="true"
                >
                  {team.abbreviation.slice(0, 3)}
                </span>
                <span className="club-name">{team.name}</span>
                <span className="club-short-name">{team.shortName}</span>
              </th>
              <td className="points-cell">{team.points}</td>
              <td>{team.played}</td>
              <td>{team.wins}</td>
              <td>{team.draws}</td>
              <td>{team.losses}</td>
              <td className="goals-for-cell">{team.goalsFor}</td>
              <td>{team.goalsAgainst}</td>
              <td className={team.goalDifference > 0 ? 'positive-difference' : team.goalDifference < 0 ? 'negative-difference' : ''}>
                {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
