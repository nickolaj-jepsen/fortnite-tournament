import {
  Player,
  PlayerList,
  PlayerListValidator,
  PlayerValidator,
} from "./dto/player.dto";
import { SearchResult, SearchResultValidator } from "./dto/search.dto";
import {
  LeaderboardScoreList,
  LeaderboardScoreListValidator,
  Tournament,
  TournamentList,
  TournamentListValidator,
  TournamentValidator,
} from "./dto/tournament.dto";

export async function fetchTournaments(): Promise<TournamentList> {
  const data = await fetch("/api/tournament/list");
  const json = await data.json();
  return TournamentListValidator.parse(json);
}

export async function fetchTournament(
  id: number | string,
): Promise<Tournament> {
  const data = await fetch(`/api/tournament/${id}`);
  const json = await data.json();
  return TournamentValidator.parse(json);
}

export async function fetchTournamentPlayers(
  id: number | string,
): Promise<PlayerList> {
  const data = await fetch(`/api/tournament/${id}/players`);
  const json = await data.json();
  return PlayerListValidator.parse(json);
}

export async function createTournament(name: string): Promise<Tournament> {
  const data = await fetch("/api/tournament", {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await data.json();
  return TournamentValidator.parse(json);
}

export interface AddPlayerData {
  tournamentId: number | string;
  name: string;
  accountId: string;
  displayName: string;
}

export async function addPlayerToTournament(
  newPlayer: AddPlayerData,
): Promise<Player> {
  const data = await fetch(`/api/tournament/${newPlayer.tournamentId}/player`, {
    method: "POST",
    body: JSON.stringify({
      name: newPlayer.name,
      id: newPlayer.accountId,
      displayName: newPlayer.displayName,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await data.json();
  return PlayerValidator.parse(json);
}

export interface UpdateTournamentTimeData {
  startTime: Date | undefined;
  endTime: Date | undefined;
  tournamentId: string;
}

export async function updateTournamentTime(
  newTime: UpdateTournamentTimeData,
): Promise<Tournament> {
  const data = await fetch(`/api/tournament/${newTime.tournamentId}/time`, {
    method: "POST",
    body: JSON.stringify({
      startTime: newTime.startTime,
      endTime: newTime.endTime,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await data.json();
  return TournamentValidator.parse(json);
}

export async function fetchLeaderboard(
  tournamentId: number | string,
): Promise<LeaderboardScoreList> {
  const data = await fetch(`/api/tournament/${tournamentId}/leaderboard`);
  const json = await data.json();
  return LeaderboardScoreListValidator.parse(json);
}
