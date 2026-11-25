export type StandingsFilter = 'all' | 'libertadores' | 'relegation'

export type MatchDateFilter = 'all' | (string & {})

export interface Fixture {
  id: string
  round: number
  date: string
  time: string
  homeTeamId: string
  awayTeamId: string
  status?: string
  homeScore?: number
  awayScore?: number
}

export interface Team {
  id: string
  name: string
  shortName: string
  abbreviation: string
  colors?: [string, string]
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
}

export interface StandingTeam extends Team {
  position: number
  played: number
  points: number
  goalDifference: number
}
