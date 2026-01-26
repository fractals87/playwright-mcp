const express = require("express");
const { spawn } = require("child_process");

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("OK");
});

app.post("/mcp", (req, res) => {
  const child = spawn("mcp-server-playwright", [], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  child.stdin.write(JSON.stringify(req.body));
  child.stdin.end();

  let output = "";
  let error = "";

  child.stdout.on("data", d => output += d.toString());
  child.stderr.on("data", d => error += d.toString());

  child.on("close", () => {
    if (error) {
      return res.status(500).json({ error });
    }
    try {
      res.json(JSON.parse(output));
    } catch {
      res.type("application/json").send(output);
    }
  });
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`HTTP MCP bridge listening on ${port}`);
});
