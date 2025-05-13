import React, { useCallback, useEffect, useState } from "react";
import { onActivePlayersChanged } from "../../../api/player-api";
import { User } from "../../../types/auth/User";
import Loading from "../../../components/common/Loading";
import { Stack } from "@mantine/core";

export default function ActivePlayersFrame() {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>();

  const callback = useCallback((players: User[]) => {
    setPlayers(players);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const stopListener = onActivePlayersChanged(callback);
      setLoading(false);
      return () => stopListener();
    })();
  }, [callback]);

  if (loading) return <Loading />;

  return (
    <Stack>
      <strong>active players</strong>
      {players?.map((player) => (
        <div key={player.id}>{player.username}</div>
      ))}
    </Stack>
  );
}
