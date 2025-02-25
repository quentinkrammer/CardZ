import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  httpBatchLink,
  loggerLink,
  splitLink,
  unstable_httpSubscriptionLink,
} from "@trpc/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { env } from "./env.ts";
import "./index.css";
import { Game } from "./pages/Game.tsx";
import Home from "./pages/Home.tsx";
import { Lobby } from "./pages/Lobby.tsx";
import { RootLayout } from "./pages/RootLayout.tsx";
import { trpc } from "./trpc.ts";

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    // adds pretty logs to your console in development and logs errors in production
    loggerLink(),
    splitLink({
      // uses the httpSubscriptionLink for subscriptions
      condition: (op) => op.type === "subscription",
      true: unstable_httpSubscriptionLink({
        url: env.url,
        eventSourceOptions() {
          return {
            withCredentials: true,
          };
        },
      }),
      false: httpBatchLink({
        url: env.url,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Router />
        </QueryClientProvider>
      </trpc.Provider>
    </BrowserRouter>
  </StrictMode>,
);

export function Router() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="lobby/:lobbyId" element={<Lobby />} loader={() => 42} />
        <Route path="lobby/:lobbyId/game" element={<Game />} />
      </Route>
    </Routes>
  );
}
