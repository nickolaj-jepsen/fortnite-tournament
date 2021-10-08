import { z } from "zod";

export const SearchEntryValidator = z.object({
  _displayName: z.string(),
  id: z.string(),
  externalAuths: z
    .record(
      z.string(),
      z.object({
        type: z.string(),
        externalDisplayName: z.string().nullish(),
        externalAuthId: z.string().nullish(),
      })
    )
    .optional(),
});

export const SearchResultValidator = z.array(SearchEntryValidator);

export type SearchEntry = z.infer<typeof SearchEntryValidator>;
export type SearchResult = z.infer<typeof SearchResultValidator>;
