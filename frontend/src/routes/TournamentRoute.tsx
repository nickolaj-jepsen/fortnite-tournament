import {
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link, useParams } from "react-router-dom";

import PlayerSearch from "../components/PlayerSearch";
import {
  addPlayerToTournament,
  fetchTournament,
  fetchTournamentPlayers,
  updateTournamentTime,
} from "../http/tournament.http";

const TournamentRoute: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [fromDate, setFromDate] = useState<Date | undefined | null>(null);
  const [toDate, setToDate] = useState<Date | undefined | null>(null);

  const playerMutation = useMutation(addPlayerToTournament, {
    onSuccess: () => {
      queryClient.invalidateQueries(["tournaments-players", id]);
    },
  });
  const tournamentMutation = useMutation(updateTournamentTime, {
    onSuccess: () => {
      queryClient.invalidateQueries(["tournaments", id]);
    },
  });

  const { data: tournament } = useQuery({
    queryKey: ["tournaments", id],
    queryFn: () => (id ? fetchTournament(id) : undefined),
  });

  const { data: players } = useQuery({
    queryKey: ["tournaments-players", id],
    queryFn: () => (id ? fetchTournamentPlayers(id) : undefined),
  });

  useEffect(() => {
    setFromDate(tournament?.startTime ? new Date(tournament.startTime) : null);
    setToDate(tournament?.endTime ? new Date(tournament.endTime) : null);
  }, [tournament]);

  const addPlayer = (accountId: string, name: string, displayName: string) => {
    if (name === "") {
      alert("Empty name");
      return;
    }
    playerMutation.mutateAsync({
      tournamentId: id ?? "",
      displayName,
      accountId,
      name,
    });
  };

  const updateTime = () =>
    tournamentMutation.mutateAsync({
      tournamentId: id ?? "",
      startTime: fromDate ?? undefined,
      endTime: toDate ?? undefined,
    });

  return (
    <Container>
      <Typography variant={"h3"}>{tournament?.name}</Typography>
      <Divider sx={{ margin: "20px 0" }} />
      <Typography variant={"h4"} sx={{ margin: "20px 0" }}>
        Settings
      </Typography>
      <Stack direction={"row"} spacing={2}>
        <DateTimePicker
          label="From"
          value={fromDate}
          ampm={false}
          onChange={setFromDate}
        />
        <DateTimePicker
          label="To"
          value={toDate}
          ampm={false}
          onChange={setToDate}
        />
        <Button variant={"contained"} onClick={updateTime}>
          Save
        </Button>
      </Stack>
      <Divider sx={{ margin: "20px 0" }} />
      <Typography variant={"h4"} sx={{ margin: "20px 0" }}>
        Players
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Display name</TableCell>
              <TableCell>Account ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players?.map((player) => (
              <TableRow
                key={player.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.displayName}</TableCell>
                <TableCell>
                  <a
                    href={`https://fortnitetracker.com/profile/all/${player.accountId}/matches`}
                  >
                    {player.accountId}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider sx={{ margin: "20px 0" }} />
      <Typography variant={"h4"}>Add Player</Typography>
      <PlayerSearch onSelect={addPlayer} />
    </Container>
  );
};

export default TournamentRoute;
