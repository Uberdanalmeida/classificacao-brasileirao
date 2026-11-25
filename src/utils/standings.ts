import type { StandingTeam, Team } from '../types/standings'

export function getStandings(teams: Team[]): StandingTeam[] {
  return teams
    .map((team) => ({
      ...team,
      played: team.wins + team.draws + team.losses,
      points: team.wins * 3 + team.draws,
      goalDifference: team.goalsFor - team.goalsAgainst,
      position: 0,
    }))
    .sort((a, b) =>
      b.points - a.points ||
      b.wins - a.wins ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.name.localeCompare(b.name, 'pt-BR'),
    )
    .map((team, index) => ({ ...team, position: index + 1 }))
}
