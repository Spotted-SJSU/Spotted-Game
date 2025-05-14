import { Group, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../api/leaderboard-api";
import Loading from "./common/Loading";

export default function Leaderboard() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>();

  const fetchLeaderboardData = async () => {
    const res = await fetchLeaderboard();
    setEntries(res);
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
        // TODO: use response
        <Group key={entry.id}>entry</Group>
      ))}
    </Stack>
  );
}
