// Mock backend webhook for local Worker testing.
// Records the POST body + auth header so we can assert the Worker sent
// exactly what the backend contract requires.
import http from "node:http";
import fs from "node:fs";

const EXPECTED_SECRET = "local-test-secret-change-me";
const requests = [];

const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const auth = req.headers["authorization"];
    const ok = auth === `Bearer ${EXPECTED_SECRET}`;
    requests.push({ authOk: ok, body: JSON.parse(body || "{}") });
    fs.writeFileSync("/tmp/e2e/worker-webhook-calls.json", JSON.stringify(requests, null, 2));
    const fail500 = body.includes("FAIL500");
    res.writeHead(!ok ? 401 : fail500 ? 500 : 200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(!ok ? { error: "unauthorized" } : fail500 ? { error: "boom" } : { success: true, messageId: "mock-id" }));
  });
});

server.listen(9999, () => console.log("mock webhook on :9999"));
