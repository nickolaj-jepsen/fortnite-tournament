import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import express from "express";

import playerRouter from "./routes/player";
import tournamentRouter from "./routes/tournament";

const app = express();

if (process.env.SERVE_DIR) {
  app.use(express.static(process.env.SERVE_DIR));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(playerRouter);
app.use(tournamentRouter);

app.listen(5000, () => {
  // eslint-disable-next-line no-console
  console.log("Server started on port 5000");
});
