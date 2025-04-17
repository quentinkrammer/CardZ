import { trpc } from "../trpc";

export function useMyUserData() {
  return trpc.user.getMyUserData.useQuery(undefined, {
    staleTime: Infinity,
    refetchOnMount: false,
  });
}
