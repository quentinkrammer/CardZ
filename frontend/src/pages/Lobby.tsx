import { useLobbySubscription } from "../hooks/useGameSubscription";

export function Lobby() {
  const sub = useLobbySubscription();

  return "Lobby";
}
