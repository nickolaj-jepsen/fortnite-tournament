import { PrismaClient } from "@prisma/client";
import { getStats } from "./api/fortnite";
import { sleep } from "./util/sleep";

export const fetchStats = async () => {
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
        console.log(stats)
        await prisma.player.update({
          where: {
            id: player.id,
          },
          data: {
            initialScore: player.initialScore ?? stats,
            lastScore: stats,
          },
        });
        await prisma.score.create({
            data: {
                playerId: player.id,
                data: stats
            }
        })
      } catch (error) {
        console.error(
          `Error fetching stats for user ${player.displayName} - ${player.name} (${error})`,
        );
      }
      await sleep(500); // Seems epic rate-limit the api endpoint, so we wait
    }

}