import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  httpBatchLink,
  loggerLink,
  splitLink,
  unstable_httpSubscriptionLink,
} from "@trpc/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { EnsureLogin } from "./components/EnsureLoginProps.tsx";
import { ViewProvider } from "./components/ViewProvider.tsx";
import { env } from "./env.ts";
import "./index.css";
import Home from "./pages/Home.tsx";
import { Lobby } from "./pages/Lobby.tsx";
import { RootLayout } from "./pages/RootLayout.tsx";
import { trpc } from "./trpc.ts";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});
const trpcClient = trpc.createClient({
  links: [
    // adds pretty logs to your console in development and logs errors in production
    loggerLink(),
    splitLink({
      // uses the httpSubscriptionLink for subscriptions
      condition: (op) => op.type === "subscription",
      true: unstable_httpSubscriptionLink({
        url: env.backendUrl,
        eventSourceOptions() {
          return {
            withCredentials: true,
          };
        },
      }),
      false: httpBatchLink({
        url: env.backendUrl,
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

queryClient.prefetchQuery({
  queryKey: [["user", "getMyUserData"], { type: "query" }],
  queryFn: () => trpcClient.user.getMyUserData.query(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ViewProvider>
            <Router />
          </ViewProvider>
          <ReactQueryDevtools initialIsOpen={false} />
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
        <Route
          path="lobby/:lobbyId"
          element={
            <EnsureLogin>
              <Lobby />
            </EnsureLogin>
          }
        />
        <Route path="*" element={<Navigate to={"/"} />} />
      </Route>
    </Routes>
  );
}
