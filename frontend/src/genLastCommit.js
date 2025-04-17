import git from "git-last-commit";
import FileSystem from "node:fs";

git.getLastCommit(function (err, commit) {
  const commmitSha = err ? "error" : commit.shortHash;
  FileSystem.writeFileSync(
    "src/lastCommit.ts",
    `export const commitSha = "${commmitSha}";`,
  );
});
