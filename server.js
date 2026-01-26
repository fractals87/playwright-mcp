const express = require("express");
const { spawn } = require("child_process");

const app = express();
app.use(express.json());

console.log("Starting MCP server...");

const mcp = spawn("node", ["node_modules/@playwright/mcp/cli.js"], {
  stdio: ["pipe", "pipe", "pipe"],
});

mcp.stderr.on("data", d => {
  console.error("[MCP stderr]", d.toString());
});

let buffer = "";
mcp.stdout.on("data", d => {
  buffer += d.toString();
});

app.get("/", (_req, res) => {
  res.send("OK");
});

app.post("/mcp", (req, res) => {
  const payload = JSON.stringify(req.body);
  mcp.stdin.write(payload + "\n");

  const interval = setInterval(() => {
    const idx = buffer.indexOf("\n");
    if (idx !== -1) {
      const msg = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      clearInterval(interval);
      try {
        res.json(JSON.parse(msg));
      } catch {
        res.type("application/json").send(msg);
      }
    }
  }, 10);
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`HTTP MCP bridge listening on ${port}`);
});
