import {
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { FunctionComponent, useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";

import { searchUser } from "../http/search.http";
import { createTournament, fetchTournaments } from "../http/tournament.http";

const TournamentListRoute: FunctionComponent = () => {
  const [newTournamentName, setNewTournamentName] = useState("");
  const queryClient = useQueryClient();
  const mutation = useMutation(createTournament, {
    onSuccess: () => {
      setNewTournamentName("");
      queryClient.invalidateQueries(["tournaments"]);
    },
  });

  const { data } = useQuery(["tournaments"], () => fetchTournaments());

  const create = useCallback(() => {
    return mutation.mutateAsync(newTournamentName);
  }, [newTournamentName]);

  return (
    <Container>
      <Typography variant={"h3"}>Tournament list</Typography>
      {data?.map((tournament) => (
        <Paper key={tournament.id} sx={{ padding: "20px", margin: "20px 0" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">{tournament.name}</Typography>
            <Stack direction={"row"} spacing={2}>
              <Link to={`/tournament/${tournament.id}/leaderboard`}>
                <Button>Leaderboard</Button>
              </Link>
              <Link to={`/tournament/${tournament.id}`}>
                <Button variant="outlined">Admin</Button>
              </Link>
            </Stack>
          </Stack>
        </Paper>
      ))}
      <Divider sx={{ margin: "20px 0" }} />
      <Typography variant="h5" sx={{ marginBottom: "10px" }}>
        Create a new tournament:
      </Typography>
      <Stack direction={"row"} spacing={2}>
        <TextField
          label="Name"
          value={newTournamentName}
          onChange={(e) => setNewTournamentName(e.target.value)}
        />
        <Button onClick={create} variant={"contained"}>
          Create tournament
        </Button>
      </Stack>
    </Container>
  );
};

export default TournamentListRoute;
