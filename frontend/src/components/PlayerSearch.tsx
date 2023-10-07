import {
  Avatar,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import React, { FunctionComponent, useState } from "react";
import { useQuery } from "react-query";

import { searchUser } from "../http/search.http";

interface IPlayerSearchProps {
  onSelect: (id: string, name: string, displayName: string) => void;
}

const PlayerSearch: FunctionComponent<IPlayerSearchProps> = ({ onSelect }) => {
  const [name, setName] = useState("");
  const [search, setSearch] = useState<string | undefined>();
  const { data, isLoading, error } = useQuery(
    ["search", search],
    () => searchUser(search ?? ""),
    {
      enabled: !!search,
    },
  );
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Stack spacing={2} sx={{ marginTop: "10px" }}>
      <TextField
        label="Name"
        value={name}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setSearch(searchQuery);
          }
        }}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="Username"
        value={searchQuery}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setSearch(searchQuery);
          }
        }}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Button
        onClick={() => setSearch(searchQuery)}
        variant={"outlined"}
        color={error ? "error" : "primary"}
        disabled={isLoading}
      >
        {error ? "Error" : isLoading ? "Loading" : "Search"}
      </Button>
      {data ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Externals</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((player) => {
                return (
                  <TableRow
                    key={player.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>{player._displayName}</TableCell>
                    <TableCell>
                      <Stack spacing={1} direction={"row"}>
                        {Object.values(player.externalAuths ?? {}).map(
                          (external, index) => (
                            <Chip
                              key={index}
                              label={`${external.type}: ${
                                external.externalDisplayName ??
                                external.externalAuthId
                              }`}
                            />
                          ),
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align={"right"}>
                      <Button
                        onClick={() => {
                          setName("");
                          setSearch(undefined);
                          setSearchQuery("");
                          onSelect(player.id, name, player._displayName);
                        }}
                        variant={"outlined"}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        ""
      )}
    </Stack>
  );
};

export default PlayerSearch;
