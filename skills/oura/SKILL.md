---
name: oura
description: Query Oura Ring health data — sleep, readiness, activity, workouts, HR, stress, SpO2, sessions, and trends
argument-hint: "[sleep | readiness | activity | workouts | stress | spo2 | sessions | trends | hr <start> <end> | summary]"
allowed-tools: mcp__oura__oura_daily_summary, mcp__oura__oura_sleep, mcp__oura__oura_readiness, mcp__oura__oura_activity, mcp__oura__oura_workouts, mcp__oura__oura_heart_rate, mcp__oura__oura_stress, mcp__oura__oura_spo2, mcp__oura__oura_sessions, mcp__oura__oura_trends
---

# /oura — Oura Ring Health Data

Query and present Oura Ring health data in a conversational, insight-driven format.

## First-Time Setup

If any tool call returns an auth error:
1. Tell the user: "Oura isn't connected yet. Set `OURA_TOKEN` in your MCP server config with a personal access token from https://cloud.ouraring.com/personal-access-tokens"
2. Do not retry until the user confirms they've set it up.

## When to Use

Trigger on phrases like:
- "How did I sleep?" / "sleep score" / "sleep data"
- "How's my readiness?" / "am I recovered?"
- "Show my activity" / "steps today"
- "Any workouts?" / "workout data"
- "Heart rate during..." / "HR data"
- "Stress levels" / "how stressed am I?"
- "Blood oxygen" / "SpO2"
- "Meditation sessions" / "breathing sessions"
- "Health trends" / "how have I been doing this week?"
- "Oura summary" / "health briefing"

## Arguments

Parse from `$ARGUMENTS`:

| Argument | Action |
|----------|--------|
| *(empty)* | Daily health briefing for today |
| `sleep` | Detailed sleep data |
| `readiness` | Readiness score and contributors |
| `activity` | Activity data (steps, calories, distance) |
| `workouts` | Auto-detected workouts |
| `hr <start> <end>` | Heart rate for a time window (ISO 8601 datetimes) |
| `stress` | Daily stress and recovery |
| `spo2` | Blood oxygen percentage |
| `sessions` | Meditation, breathing, relaxation sessions |
| `trends` or `trends <days>` | Multi-day sleep + readiness trends (default 7 days) |
| `summary` | Full daily summary (same as empty) |

Dates default to today. If the user mentions a specific date (e.g., "yesterday", "last Tuesday"), convert it to YYYY-MM-DD format.

## Workflows

### Default / Summary (no args or `summary`)

1. Call `oura_daily_summary` (no args — defaults to today)
2. Present as a health briefing:
   - Lead with sleep score and readiness score as headline numbers
   - Highlight anything notable (low scores, high HRV, unusual patterns)
   - Include key activity metrics (steps, calories)
   - Keep it conversational — 3-5 sentences max for the overview
3. Offer: "Want me to dig into sleep details, trends, or anything specific?"

### Sleep (`sleep`)

1. Call `oura_sleep`
2. Present insights:
   - Sleep score and total sleep time
   - Sleep stage breakdown (deep, REM, light, awake)
   - Average HR and HRV during sleep
   - Notable patterns (e.g., high awake time, low deep sleep)
3. Compare to typical ranges if data suggests anything unusual

### Readiness (`readiness`)

1. Call `oura_readiness`
2. Present:
   - Readiness score as headline
   - Top contributing factors (positive and negative)
   - Actionable insight (e.g., "Recovery looks good — solid day for a hard workout" or "Below baseline — consider taking it easy")

### Activity (`activity`)

1. Call `oura_activity`
2. Present:
   - Steps, active calories, total calories
   - Activity score if available
   - Distance, movement metrics

### Workouts (`workouts`)

1. Call `oura_workouts`
2. Present each workout:
   - Type, duration, calories burned
   - Average and max HR if available
   - Intensity level
3. If no workouts found, say so and suggest checking the date

### Heart Rate (`hr <start> <end>`)

1. Parse start and end datetimes from arguments
2. Call `oura_heart_rate` with `start_datetime` and `end_datetime`
3. Present:
   - HR range (min, max, average) over the window
   - Notable spikes or drops
   - If the window overlaps a workout, note the correlation
4. If args are missing, ask: "I need a time window — e.g., `/oura hr 2026-03-11T08:00:00+00:00 2026-03-11T09:00:00+00:00`"

### Stress (`stress`)

1. Call `oura_stress`
2. Present:
   - Stress level and recovery balance
   - Context on what the numbers mean

### SpO2 (`spo2`)

1. Call `oura_spo2`
2. Present:
   - SpO2 percentage
   - Note if it's in normal range (95-100%) or worth attention

### Sessions (`sessions`)

1. Call `oura_sessions`
2. Present each session:
   - Type (meditation, breathing, etc.), duration
   - HR data if available
3. If no sessions, say "No sessions recorded today."

### Trends (`trends` or `trends <days>`)

1. Parse optional days count from arguments (default 7)
2. Call `oura_trends` with `days` parameter
3. Present:
   - Sleep and readiness scores over the period
   - Use a simple text table or aligned format for readability
   - Highlight best/worst days
   - Note any patterns (improving, declining, consistent)
   - Calculate averages

## Presentation Style

- **Lead with numbers**: "Sleep: 85 | Readiness: 78" — scores first, details after
- **Conversational tone**: Brief insights, not raw JSON dumps
- **Highlight anomalies**: Flag anything notably high, low, or different from recent patterns
- **Offer next steps**: End with a suggestion for what else to explore
- **Keep it concise**: Default to a brief overview; go deeper only when asked or when the specific endpoint is requested
- **Dates**: Show dates in a human-friendly format (e.g., "Monday Mar 10") alongside scores
