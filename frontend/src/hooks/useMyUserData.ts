import { trpc } from "../trpc";

export function useMyUserData() {
  return trpc.user.getMyUserData.useQuery(undefined, {
    // TODO make global
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
