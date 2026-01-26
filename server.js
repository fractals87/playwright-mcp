const express = require("express");
const { spawn } = require("child_process");

const app = express();
app.use(express.json());

// ---- MCP PROCESS (singleton) ----
console.log("Starting MCP server...");
const mcp = spawn("mcp-server-playwright", [], {
  stdio: ["pipe", "pipe", "pipe"],
});

mcp.stderr.on("data", d => {
  console.error("[MCP stderr]", d.toString());
});

let buffer = "";

// MCP output handler
mcp.stdout.on("data", d => {
  buffer += d.toString();
});

// ---- HTTP ----
app.get("/", (_req, res) => {
  res.send("OK");
});

app.post("/mcp", (req, res) => {
  const payload = JSON.stringify(req.body);

  // write MCP request
  mcp.stdin.write(payload + "\n");

  // poll until we get a JSON-RPC response
  const interval = setInterval(() => {
    const idx = buffer.indexOf("\n");
    if (idx !== -1) {
      const message = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      clearInterval(interval);
      try {
        res.json(JSON.parse(message));
      } catch {
        res.type("application/json").send(message);
      }
    }
  }, 10);
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`HTTP MCP bridge listening on ${port}`);
});
