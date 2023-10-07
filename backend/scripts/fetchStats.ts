import dotenv from "dotenv";
import { fetchStats } from "../src/fetcher";
dotenv.config();

/* eslint-disable no-console */

(async () => {
    console.time('start')
    await fetchStats()
    console.timeEnd('start')
})();
