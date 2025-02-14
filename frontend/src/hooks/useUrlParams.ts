import { useParams } from "react-router";
import { z } from "zod";

export function useUrlParams() {
  const params = useParams();
  return z.object({ lobbyId: z.string() }).parse(params);
}
