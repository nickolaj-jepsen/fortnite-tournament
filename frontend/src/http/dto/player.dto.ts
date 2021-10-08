import { z } from "zod";

export const PlayerValidator = z.object({
  name: z.string(),
  id: z.number(),
  accountId: z.string(),
  displayName: z.string().nullish(),
});

export const PlayerListValidator = z.array(PlayerValidator);

export type Player = z.infer<typeof PlayerValidator>;
export type PlayerList = z.infer<typeof PlayerListValidator>;
