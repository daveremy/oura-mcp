#!/usr/bin/env node
import { Command } from "commander";
import { OuraClient } from "./client.js";
import { runAuthFlow } from "./auth.js";

const program = new Command();

program
  .name("oura")
  .description("Oura Ring CLI — query sleep, readiness, and activity data")
  .version("0.1.0");

function today(): string {
  return new Date().toISOString().split("T")[0];
}

program
  .command("auth")
  .description("Run OAuth2 authorization flow")
  .action(async () => {
    await runAuthFlow();
  });

program
  .command("sleep")
  .description("Get daily sleep score and sleep periods")
  .option("--date <date>", "Date in YYYY-MM-DD format", today())
  .action(async (opts) => {
    const client = OuraClient.fromEnv();
    const [daily, periods] = await Promise.all([
      client.getDailySleep(opts.date),
      client.getSleepPeriods(opts.date),
    ]);
    console.log(JSON.stringify({ daily, periods }, null, 2));
  });

program
  .command("readiness")
  .description("Get daily readiness score")
  .option("--date <date>", "Date in YYYY-MM-DD format", today())
  .action(async (opts) => {
    const client = OuraClient.fromEnv();
    const readiness = await client.getDailyReadiness(opts.date);
    console.log(JSON.stringify(readiness, null, 2));
  });

program
  .command("activity")
  .description("Get daily activity data")
  .option("--date <date>", "Date in YYYY-MM-DD format", today())
  .action(async (opts) => {
    const client = OuraClient.fromEnv();
    const activity = await client.getDailyActivity(opts.date);
    console.log(JSON.stringify(activity, null, 2));
  });

program
  .command("summary")
  .description("Get all data for a day (sleep, readiness, activity)")
  .option("--date <date>", "Date in YYYY-MM-DD format", today())
  .action(async (opts) => {
    const client = OuraClient.fromEnv();
    const [sleep, readiness, sleepPeriods, activity] = await Promise.all([
      client.getDailySleep(opts.date),
      client.getDailyReadiness(opts.date),
      client.getSleepPeriods(opts.date),
      client.getDailyActivity(opts.date),
    ]);
    console.log(JSON.stringify({ date: opts.date, sleep, readiness, sleepPeriods, activity }, null, 2));
  });

program.parse();
