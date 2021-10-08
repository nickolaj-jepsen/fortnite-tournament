import MenuIcon from "@mui/icons-material/Menu";
import { CssBaseline } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { FunctionComponent } from "react";
import { Link, Route } from "react-router-dom";

import LeaderboardRoute from "./routes/LeaderboardRoute";
import TournamentListRoute from "./routes/TournamentListRoute";
import TournamentRoute from "./routes/TournamentRoute";

const App: FunctionComponent = (props) => {
  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fortnite tournament
          </Typography>
          <Link to={"/"}>
            <Button variant="contained" color="secondary">
              Home
            </Button>
          </Link>
        </Toolbar>
      </AppBar>
      <Route path="/tournament/:id/leaderboard" exact>
        <LeaderboardRoute />
      </Route>
      <Route path="/tournament/:id" exact>
        <TournamentRoute />
      </Route>
      <Route path="/" exact>
        <TournamentListRoute />
      </Route>
    </>
  );
};

export default App;
