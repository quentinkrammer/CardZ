import { createHTTPServer } from "@trpc/server/adapters/standalone";
import connect from "connect";
import cookie from "cookie";
import cors from "cors";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { env } from "../env.js";
import { createUser } from "./drizzle/query/createUser.js";
import { appRouter } from "./trpc/appRouter.js";
import { createContext } from "./trpc/trpc.js";

const COOKIE_SECRET = "shhhh";
const COOKIE_NAME_USER_ID = "userIdToken";

const middleware = connect();
middleware
  .use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    })
  )
  .use(function attachUserCookie(req, res, next) {
    const cookies = cookie.parse(req.headers.cookie ?? "");
    let newUserId: string;
    jwt.verify(
      cookies?.[COOKIE_NAME_USER_ID] ?? "",
      COOKIE_SECRET,
      async function (err, token) {
        if (err) {
          newUserId = nanoid();
          await createUser({ id: newUserId });

          const newSignedUserIdToken = jwt.sign(newUserId, COOKIE_SECRET);
          res.setHeader(
            "Set-Cookie",
            cookie.serialize(COOKIE_NAME_USER_ID, newSignedUserIdToken, {
              httpOnly: true,
              maxAge: 60 * 60 * 24 * 365,
              secure: true,
              sameSite: "lax",
              path: "/",
            })
          );
        }
        // @ts-expect-error the "userId" is added to the req
        req["userId"] = newUserId ?? token;
        next();
      }
    );
  });

const server = createHTTPServer({
  middleware,
  router: appRouter,
  createContext,
});

server.listen(env.port);
// This is needed for HMR.
// This code hooks into the vite lifecycle and closes the server before HMR.
// Without closing the server HMR fails cause the port is alredy in use.
// https://github.com/vitest-dev/vitest/issues/2334
if (env.mode === "development") {
  const hot = import.meta.hot;
  if (hot) {
    hot.on("vite:beforeFullReload", () => {
      server.close();
    });
  }
  hot?.dispose(() => {
    server.close();
  });
}
