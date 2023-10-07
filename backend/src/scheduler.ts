import { PrismaClient } from "@prisma/client";
import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";

import { calculateScore, getStats } from "./api/fortnite";
import { statsCache } from "./cache";
import { sleep } from "./util/sleep";
import { fetchStats } from "./fetcher";

export const startScheduler = () => {
  const scheduler = new ToadScheduler();

  const task = new AsyncTask("Fetch stats", fetchStats);

  const job1 = new SimpleIntervalJob({ seconds: 180 }, task);

  scheduler.addIntervalJob(job1);
  return scheduler;
};
