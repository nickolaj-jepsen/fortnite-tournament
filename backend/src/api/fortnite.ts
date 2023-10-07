/* eslint-disable @typescript-eslint/no-explicit-any*/
import { Client, StatsData } from "fnbr";
import { mergeWith } from "lodash";

const input = ["gamepad", "keyboardmouse"];

let queues: { [key: string]: { [key: string]: number } } = {
  solo: { top25: 20, top10: 20, win: 60, kills: 20 },
  duo: { top12: 10, top5: 20, win: 30, kills: 20 },
  trios: { top6: 10, top3: 20, win: 25, kills: 20 },
  squad: { top6: 5, top3: 10, win: 20, kills: 20 },
};

const buildStatsQuery = () => {
  const stats = [];
  for (const i of input) {
    for (const [q, scorableValues] of Object.entries(queues)) {
      for (const s of Object.keys(scorableValues)) {
        stats.push(`br_${s}_${i}_m0_playlist_${q}`);
      }
    }
  }
  return stats;
};

const authCode = JSON.parse(
  Buffer.from(process.env.AUTH ?? "", "base64").toString(),
);

(global as any)._fnbrClient = undefined;

export const getClient = async (): Promise<Client> => {
  if ((global as any)._fnbrClient) {
    return (global as any)._fnbrClient;
  }

  const client = new Client({ auth: { deviceAuth: authCode } });
  await client.login();
  (global as any)._fnbrClient = client;
  return client;
};

export type Stats = { [key: string]: { [key: string]: number } };

const parseStats = (data: StatsData): Stats => {
  const stats: Stats = {};
  for (const [playlist, value] of Object.entries(data.all)) {
    stats[playlist] = value
  }
  return stats;
};

export const calculateScore = (stats: Stats) => {
  let sum = 0;
  for (const [q, scorableValues] of Object.entries(queues)) {
    if (stats.hasOwnProperty(q)) {
      const currentQueue = stats[q];
      for (const [key, value] of Object.entries(scorableValues)) {
        if (currentQueue.hasOwnProperty(key)) {
          // if (currentQueue[key]) {
          //   console.log(q, key, currentQueue[key], scorableValues);
          //   console.log(currentQueue[key] * value);
          // }
          sum += currentQueue[key] * value;
        }
      }
    }
  }
  return sum;
};

export const diffStats = (initial: Stats, latest: Stats): Stats => {
  return mergeWith(initial, latest, (i, l) => {
    if (typeof i === "object" && typeof l === "object") {
      return diffStats(i, l);
    }
    if (typeof i === "number" && typeof l === "number") {
      return l - i;
    }
  });
};

export const getStats = async (user: string, from?: Date, to?: Date) => {
  const client = await getClient();
  const fromTs = from ? Math.round(from.getTime() / 1000) : undefined;
  const toTs = to ? Math.round(to.getTime() / 1000) : undefined;
  const statsResponse = await client.getBRStats(user, fromTs, toTs);
  return parseStats(statsResponse.stats);
};
