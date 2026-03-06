#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { OuraClient } from "./client.js";

const server = new McpServer({ name: "oura", version: "0.1.0" });

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const optDate = z.string().optional().describe("YYYY-MM-DD, defaults to today");

server.registerTool("oura_daily_summary", {
  title: "Daily Summary",
  description: "Get sleep score, readiness score, sleep details, and activity for a date",
  inputSchema: z.object({ date: optDate }),
}, async ({ date }) => {
  const d = date ?? today();
  const client = OuraClient.fromEnv();
  const [sleep, readiness, periods, activity] = await Promise.all([
    client.getDailySleep(d),
    client.getDailyReadiness(d),
    client.getSleepPeriods(d),
    client.getDailyActivity(d),
  ]);
  return text({ date: d, sleep, readiness, sleepPeriods: periods, activity });
});

server.registerTool("oura_sleep", {
  title: "Sleep Details",
  description: "Get detailed sleep session data (duration, stages, HR, HRV) for a date",
  inputSchema: z.object({ date: optDate }),
}, async ({ date }) => {
  const d = date ?? today();
  const client = OuraClient.fromEnv();
  const [daily, periods] = await Promise.all([
    client.getDailySleep(d),
    client.getSleepPeriods(d),
  ]);
  return text({ date: d, daily, periods });
});

server.registerTool("oura_readiness", {
  title: "Readiness Score",
  description: "Get readiness score and contributors for a date",
  inputSchema: z.object({ date: optDate }),
}, async ({ date }) => {
  const d = date ?? today();
  const client = OuraClient.fromEnv();
  return text(await client.getDailyReadiness(d));
});

server.registerTool("oura_activity", {
  title: "Daily Activity",
  description: "Get daily activity data (steps, calories, distance) for a date",
  inputSchema: z.object({ date: optDate }),
}, async ({ date }) => {
  const d = date ?? today();
  const client = OuraClient.fromEnv();
  return text(await client.getDailyActivity(d));
});

server.registerTool("oura_trends", {
  title: "Multi-day Trends",
  description: "Get sleep and readiness scores for a date range",
  inputSchema: z.object({
    days: z.number().optional().describe("Number of days to look back (default 7)"),
  }),
}, async ({ days }) => {
  const n = days ?? 7;
  const client = OuraClient.fromEnv();
  const results: Array<{ date: string; sleep_score: number | null; readiness_score: number | null }> = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    const [sleep, readiness] = await Promise.all([
      client.getDailySleep(ds),
      client.getDailyReadiness(ds),
    ]);
    results.push({
      date: ds,
      sleep_score: sleep?.score ?? null,
      readiness_score: readiness?.score ?? null,
    });
  }

  return text(results);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Oura MCP server error:", err);
  process.exit(1);
});
