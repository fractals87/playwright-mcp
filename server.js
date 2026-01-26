import express from "express";
import { spawn } from "child_process";

const app = express();
app.use(express.json());

app.get("/", (_, res) => res.send("OK"));

app.post("/mcp", (req, res) => {
  const child = spawn("npx", ["mcp-server-playwright"], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  child.stdin.write(JSON.stringify(req.body));
  child.stdin.end();

  let output = "";
  child.stdout.on("data", d => output += d.toString());

  child.on("close", () => {
    res.type("application/json").send(output);
  });
});

app.listen(8080, "0.0.0.0", () => {
  console.log("HTTP MCP bridge listening on 8080");
});
