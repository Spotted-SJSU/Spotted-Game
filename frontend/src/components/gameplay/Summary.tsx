import { Group, Paper, Text } from "@mantine/core";
import { GameplayEventPayload } from "../../types/GameplayEventPayload";

interface SummaryProps {
  level: GameplayEventPayload;
  score: number;
}

export default function Summary(props: SummaryProps) {
  const { level, score } = props;
  return (
    <Paper p="lg">
      <Text>
        You scored {score} point{score !== 1 && "s"}!
      </Text>
    </Paper>
  );
}
