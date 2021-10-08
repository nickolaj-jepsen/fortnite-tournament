import { SearchResult, SearchResultValidator } from "./dto/search.dto";

export async function searchUser(name: string): Promise<SearchResult> {
  const data = await fetch("/api/player-search", {
    method: "POST",
    body: JSON.stringify({ search: name }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await data.json();
  return SearchResultValidator.parse(json);
}
