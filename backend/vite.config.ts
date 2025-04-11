import { node } from "@liuli-util/vite-plugin-node";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  console.log("Command: ", command);
  console.log("Mode: ", mode);
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [node()],
    define: { __APP_ENV__: JSON.stringify(env["APP_ENV"]) },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
