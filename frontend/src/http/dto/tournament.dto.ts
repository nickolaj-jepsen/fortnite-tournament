import { z } from "zod";

export const TournamentValidator = z.object({
  id: z.number(),
  name: z.string(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
});
export const TournamentListValidator = z.array(TournamentValidator);

export const LeaderboardScoreValidator = z.object({
  score: z.number(),
  id: z.number(),
  name: z.string(),
});
export const LeaderboardScoreListValidator = z.array(LeaderboardScoreValidator);

export type Tournament = z.infer<typeof TournamentValidator>;
export type TournamentList = z.infer<typeof TournamentListValidator>;
export type LeaderboardScoreList = z.infer<
  typeof LeaderboardScoreListValidator
>;
