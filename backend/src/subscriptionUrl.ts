export const subscriptionUrl = (obj: { lobbyId: string; userId: string }) =>
  `lobby/${obj.lobbyId}/user/${obj.userId}`;
