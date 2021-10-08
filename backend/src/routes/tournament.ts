import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { getStats } from "../api/fortnite";
import { statsCache } from "../cache";
import { isDefined } from "../util/isUndefined";
import { sleep } from "../util/sleep";
import player from "./player";

const prisma = new PrismaClient();

const tournamentRouter = Router();

tournamentRouter.get("/api/tournament/list", async (req, res) => {
  res.send(await prisma.tournament.findMany());
});

tournamentRouter.get("/api/tournament/:id", async (req, res) => {
  res.send(
    await prisma.tournament.findFirst({
      where: { id: parseInt(req.params.id, 10) },
    })
  );
});

interface LeaderboardScore {
  score: number;
  id: number;
  name: string;
}

tournamentRouter.get("/api/tournament/:id/leaderboard", async (req, res) => {
  const tournament = await prisma.tournament.findFirst({
    where: { id: parseInt(req.params.id, 10) },
    include: { players: true },
  });

  if (!tournament) {
    res.send({ status: "error", msg: "Could not find tournament" });
    return;
  }

  const result: LeaderboardScore[] = [];
  for (const player of tournament.players) {
    const cacheKey = `stats-${tournament.id}-${player.id}`;
    let score = await statsCache.getItem<number>(cacheKey);

    if (!score) {
      score = await getStats(
        player.accountId,
        tournament.startTime ?? undefined,
        tournament.endTime ?? undefined
      );
      await statsCache.setItem(cacheKey, score, { ttl: 300 });
      await sleep(500); // Seems epic rate-limit the api endpoint, so we wait
    }

    result.push({
      score: score,
      id: player.id,
      name: player.name,
    });
  }

  res.send(result.sort((a, b) => b.score - a.score));
});

tournamentRouter.get("/api/tournament/:id/players", async (req, res) => {
  const tournament = await prisma.tournament.findFirst({
    where: { id: parseInt(req.params.id, 10) },
    include: { players: true },
  });

  if (!tournament) {
    res.send({ status: "error", msg: "Could not find tournament" });
    return;
  }

  res.send(tournament.players);
});

tournamentRouter.post("/api/tournament/:id/time", async (req, res) => {
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;

  const tournament = await prisma.tournament.update({
    where: { id: parseInt(req.params.id, 10) },
    data: {
      startTime,
      endTime,
    },
  });

  if (!tournament) {
    res.send({ status: "error", msg: "Could not find tournament" });
    return;
  }

  res.send(tournament);
});

tournamentRouter.post("/api/tournament/:id/player", async (req, res) => {
  const name = req.body?.name;
  const id = req.body?.id;
  const displayName = req.body?.displayName;
  if (
    typeof name !== "string" ||
    typeof id !== "string" ||
    typeof displayName !== "string"
  ) {
    res.send({ status: "error", msg: "invalid body" });
    return;
  }

  const tournament = await prisma.tournament.findFirst({
    where: { id: parseInt(req.params.id, 10) },
    include: { players: true },
  });

  if (!tournament) {
    res.send({ status: "error", msg: "Could not find tournament" });
    return;
  }

  const player = await prisma.player.upsert({
    where: {
      accountId: id,
    },
    update: {
      name: name,
      displayName: displayName,
    },
    create: {
      accountId: id,
      name: name,
      displayName: displayName,
    },
  });

  await prisma.player.update({
    where: { id: player.id },
    data: { tournaments: { connect: { id: tournament.id } } },
  });

  res.send(player);
});

tournamentRouter.post("/api/tournament", async (req, res) => {
  const name = req.body?.name;

  if (typeof name !== "string") {
    res.status(500);
    res.send({ status: "error", msg: '"name" must be a string ' });
    return;
  }

  res.send(await prisma.tournament.create({ data: { name } }));
});

export default tournamentRouter;
