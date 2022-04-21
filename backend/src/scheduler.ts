import { PrismaClient } from "@prisma/client";
import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";

import { calculateScore, getStats } from "./api/fortnite";
import { statsCache } from "./cache";
import { sleep } from "./util/sleep";

export const startScheduler = () => {
  const scheduler = new ToadScheduler();

  const task = new AsyncTask("Fetch stats", async () => {
    const prisma = new PrismaClient();
    const currentTime = new Date().toISOString();

    const activePlayers = await prisma.player.findMany({
      where: {
        tournament: {
          startTime: {
            lt: currentTime,
          },
          endTime: {
            gt: currentTime,
          },
        },
      },
    });

    // eslint-disable-next-line no-console
    console.info(`fetching stats for ${activePlayers.length} users`);

    for (const player of activePlayers) {
      try {
        const stats = await getStats(player.accountId);
        await prisma.player.update({
          where: {
            id: player.id,
          },
          data: {
            initialScore: player.initialScore ?? stats,
            lastScore: stats,
          },
        });
      } catch (error) {
        console.error(
          `Error fetching stats for user ${player.displayName} - ${player.name} (${error})`
        );
      }
      await sleep(500); // Seems epic rate-limit the api endpoint, so we wait
    }
  });

  const job1 = new SimpleIntervalJob({ seconds: 180 }, task, "id_1");

  scheduler.addIntervalJob(job1);
  return scheduler;
};
