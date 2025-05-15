import { Group, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import {
  fetchLeaderboard,
  LeaderboardEntryResponse,
} from "../api/leaderboard-api";
import Loading from "./common/Loading";

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>();

  const fetchLeaderboardData = async () => {
    const data = await fetchLeaderboard();
    setEntries(data);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchLeaderboardData();
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loading />;

  return (
    <Stack>
      {entries.map((entry) => (
        <Group key={`${entry.Username}+${entry.Score}`} justify="space-between">
          <Text>{entry.Username}</Text>
          <Text>{entry.Score}</Text>
        </Group>
      ))}
    </Stack>
  );
}
