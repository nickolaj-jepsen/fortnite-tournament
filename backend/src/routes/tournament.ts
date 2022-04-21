import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { mergeWith } from "lodash";

import { calculateScore, diffStats, Stats } from "../api/fortnite";

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
    let score = 0;
    if (player.initialScore && player.lastScore) {
      const diffed = diffStats(
        player.initialScore as Stats,
        player.lastScore as Stats
      );

      score = calculateScore(diffed);
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

  const player = await prisma.player.create({
    data: {
      accountId: id,
      name: name,
      displayName: displayName,
      tournamentId: tournament.id,
    },
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
