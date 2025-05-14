import { GameplayEventPayload } from "../../types/GameplayEventPayload";

interface SummaryProps {
  level: GameplayEventPayload;
}

export default function Summary(props: SummaryProps) {
  const { level } = props;
  return <>summary</>;
}
