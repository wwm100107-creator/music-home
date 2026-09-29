import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workerConfig = "stable-link/wrangler.jsonc";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const sshCommand = process.platform === "win32" ? "ssh.exe" : "ssh";
const remoteHome = "/data/data/com.termux/files/home";

function spawnProcess(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: process.env,
      shell: process.platform === "win32" && command.toLowerCase().endsWith(".cmd"),
      ...options,
    });
    child.once("error", rejectPromise);
    child.once("close", (code) => resolvePromise(code ?? 1));
  });
}

async function runWrangler(args, { input, capture = false } = {}) {
  const commandArgs = ["--yes", "wrangler@latest", ...args];

  if (!capture && input === undefined) {
    return spawnProcess(npxCommand, commandArgs, { stdio: "inherit" });
  }

  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(npxCommand, commandArgs, {
      cwd: rootDir,
      env: process.env,
      shell: process.platform === "win32",
      stdio: [input === undefined ? "inherit" : "pipe", capture ? "pipe" : "inherit", capture ? "pipe" : "inherit"],
    });
    let output = "";

    if (capture) {
      for (const stream of [child.stdout, child.stderr]) {
        stream.on("data", (chunk) => {
          const text = chunk.toString();
          output += text;
          (stream === child.stdout ? process.stdout : process.stderr).write(text);
        });
      }
    }

    child.once("error", rejectPromise);
    child.once("close", (code) => resolvePromise({ code: code ?? 1, output }));
    if (input !== undefined) child.stdin.end(input);
  });
}

async function pipeRemoteFile(remotePath, contents, mode) {
  const encoded = Buffer.from(contents, "utf8").toString("base64");
  const parent = remotePath.slice(0, remotePath.lastIndexOf("/"));
  const remoteCommand = `umask 077 && mkdir -p '${parent}' && base64 -d > '${remotePath}' && chmod ${mode} '${remotePath}'`;

  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(sshCommand, ["music-home", remoteCommand], {
      cwd: rootDir,
      env: process.env,
      stdio: ["pipe", "inherit", "inherit"],
    });
    child.once("error", rejectPromise);
    child.once("close", (code) => resolvePromise(code ?? 1));
    child.stdin.end(`${encoded}\n`);
  });
}

async function installOnAndroid(workerUrl, token) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    throw new Error("Generated update secret did not pass validation.");
  }

  const config = [
    `LINK_RELAY_URL='${workerUrl}'`,
    `LINK_RELAY_TOKEN='${token}'`,
    "",
  ].join("\n");
  const bootScript = await readFile(resolve(rootDir, "stable-link/start-music-home-ops.sh"), "utf8");
  const supervisor = await readFile(resolve(rootDir, "scripts/quick-tunnel-supervisor.sh"), "utf8");

  for (const [remotePath, contents, mode] of [
    [`${remoteHome}/.config/music-home-link-relay.env`, config, "600"],
    [`${remoteHome}/.termux/boot/start-music-home-ops`, bootScript, "700"],
    [`${remoteHome}/.termux/boot/quick-tunnel-supervisor.sh`, supervisor, "700"],
  ]) {
    const code = await pipeRemoteFile(remotePath, contents, mode);
    if (code !== 0) throw new Error(`Could not install ${remotePath} on the Android phone.`);
  }

  const startCommand = `bash '${remoteHome}/.termux/boot/start-music-home-ops'`;
  const code = await spawnProcess(sshCommand, ["music-home", startCommand], { stdio: "inherit" });
  if (code !== 0) throw new Error("Files were copied, but the Termux boot script did not start successfully.");
}

async function main() {
  console.log("Music Home stable-link setup");
  console.log("This uses Cloudflare Workers on the free plan and your existing SSH alias: music-home.\n");

  let identity = await runWrangler(["whoami"]);
  if (identity !== 0) {
    console.log("Wrangler needs Cloudflare authorization. A browser window will open; sign in and authorize it there.\n");
    const login = await runWrangler(["login"]);
    if (login !== 0) throw new Error("Cloudflare login was not completed.");
    identity = await runWrangler(["whoami"]);
    if (identity !== 0) throw new Error("Wrangler could not confirm the Cloudflare login.");
  }

  const deployment = await runWrangler(["deploy", "--config", workerConfig], { capture: true });
  if (deployment.code !== 0) throw new Error("Cloudflare Worker deployment failed.");

  const workerUrl = deployment.output.match(/https:\/\/music-home-link\.[a-z0-9-]+\.workers\.dev/i)?.[0];
  if (!workerUrl) {
    throw new Error(
      "Worker deployed, but Wrangler did not print its workers.dev URL. Find it in Cloudflare > Workers & Pages, then run setup again after checking that workers.dev is enabled for the account.",
    );
  }

  const token = randomBytes(32).toString("base64url");
  console.log("\nSaving the private Android-to-Worker update secret in Cloudflare...");
  const secretResult = await runWrangler(
    ["secret", "put", "UPDATE_SECRET", "--config", workerConfig],
    { input: `${token}\n` },
  );
  if (secretResult !== 0) throw new Error("Could not save the update secret in Cloudflare.");

  console.log("\nInstalling the private config and auto-restarting tunnel supervisor on Android...");
  await installOnAndroid(workerUrl, token);

  console.log("\nSetup finished.");
  console.log(`Stable Music Home link: ${workerUrl}`);
  console.log("Share this link. It redirects to the current Quick Tunnel address and updates after a tunnel restart.");
  console.log("The address bar may show the temporary trycloudflare.com address after the redirect.");
}

main().catch((error) => {
  console.error(`\nStable-link setup stopped: ${error.message}`);
  process.exitCode = 1;
});
