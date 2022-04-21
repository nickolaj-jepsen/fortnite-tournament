/* eslint-disable @typescript-eslint/no-explicit-any*/
import { Client } from "fnbr";
import { mergeWith } from "lodash";

const input = ["gamepad", "keyboardmouse"];

let queues: { [key: string]: { [key: string]: number } } = {
  defaultsolo: { placetop25: 20, placetop10: 20, placetop1: 60, kills: 20 },
  defaultduo: { placetop12: 10, placetop5: 20, placetop1: 30, kills: 20 },
  trios: { placetop6: 10, placetop3: 20, placetop1: 25, kills: 20 },
  defaultsquad: { placetop6: 5, placetop3: 10, placetop1: 20, kills: 20 },
};

if (process.env.ENABLE_NO_BUILD) {
  queues = {
    ...queues,
    nobuildbr_solo: {
      placetop25: 20,
      placetop10: 20,
      placetop1: 60,
      kills: 20,
    },
    nobuildbr_duo: { placetop12: 10, placetop5: 20, placetop1: 30, kills: 20 },
    nobuildbr_trio: { placetop6: 10, placetop3: 20, placetop1: 25, kills: 20 },
    nobuildbr_squad: { placetop6: 5, placetop3: 10, placetop1: 20, kills: 20 },
  };
}
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
  Buffer.from(process.env.AUTH ?? "", "base64").toString()
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

const parseStats = (data: { [key: string]: string }) => {
  const stats: Stats = {};
  for (const [statName, value] of Object.entries(data)) {
    const parts = statName.split("_");

    const name = parts[1];
    const playlist = parts.slice(5, parts.length).join("_");
    if (!(playlist in stats)) {
      stats[playlist] = {};
    }
    stats[playlist][name] = parseInt(value, 10);
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
