import Check from "@mui/icons-material/Check";
import {
  Container,
  Fab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import React, { FunctionComponent, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";

import { fetchLeaderboard } from "../http/tournament.http";

const LeaderboardRoute: FunctionComponent = (props) => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: leaderboard, isLoading } = useQuery(["leaderboard", id], () =>
    fetchLeaderboard(id)
  );

  useEffect(() => {
    const interval = setInterval(
      () => queryClient.invalidateQueries(["leaderboard", id]),
      1000 * 60
    );
    return () => {
      clearInterval(interval);
    };
  }, [id]);

  return (
    <Container>
      <TableContainer component={Paper} sx={{ marginTop: "20px" }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Positions</TableCell>
              <TableCell align={"left"}>Name</TableCell>
              <TableCell>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard?.map((player, index) => (
              <TableRow
                key={player.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Fab
        onClick={() => queryClient.invalidateQueries(["leaderboard", id])}
        sx={{ position: "absolute", right: "20px", bottom: "20px" }}
      >
        {isLoading ? <CircularProgress /> : <Check sx={{ fontSize: 40 }} />}
      </Fab>
    </Container>
  );
};

export default LeaderboardRoute;
