import React, { useEffect, useState } from "react";
import { fetchActivePlayers } from "../../../api/player-api";
import { User } from "../../../types/auth/User";
import { ApiResponse } from "../../../types/api/ApiResponse";
import Loading from "../../../components/common/Loading";
import { Stack } from "@mantine/core";

export default function ActivePlayersFrame() {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>();

  const loadActivePlayers = async () => {
    // const response = await fetchActivePlayers(); TODO: integrate
    const response: ApiResponse<User[]> = {
      success: true,
      data: [
        {
          userID: "abc",
          username: "Vivek Raman",
        },
      ],
    };
    if (response.data) {
      setPlayers(response.data);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadActivePlayers();
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loading />;

  return (
    <Stack>
      <strong>active players</strong>
      {players.map((player) => (
        <div key={player.userID}>{player.username}</div>
      ))}
    </Stack>
  );
}
