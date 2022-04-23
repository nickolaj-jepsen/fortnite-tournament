import { Router } from "express";

import { getClient } from "../api/fortnite";

const playerRouter = Router();

playerRouter.post("/api/player-search", async (req, res) => {
  const search: string = req.body["search"];
  const client = await getClient();
  try {
    res.send(await client.searchProfiles(search));
  } catch (error) {
    console.error(error);
    res.status(500);
    res.send({ status: "error" });
  }
});

export default playerRouter;
