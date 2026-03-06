/** Oura API v2 response types */

export interface OuraDailySleep {
  day: string;
  score: number | null;
  contributors: {
    deep_sleep: number | null;
    efficiency: number | null;
    latency: number | null;
    rem_sleep: number | null;
    restfulness: number | null;
    timing: number | null;
    total_sleep: number | null;
  };
  timestamp: string;
}

export interface OuraDailyReadiness {
  day: string;
  score: number | null;
  contributors: {
    activity_balance: number | null;
    body_temperature: number | null;
    hrv_balance: number | null;
    previous_day_activity: number | null;
    previous_night: number | null;
    recovery_index: number | null;
    resting_heart_rate: number | null;
    sleep_balance: number | null;
  };
  timestamp: string;
  temperature_deviation: number | null;
}

export interface OuraSleepPeriod {
  day: string;
  type: "long_sleep" | "short_sleep" | "rest";
  bedtime_start: string;
  bedtime_end: string;
  deep_sleep_duration: number;
  light_sleep_duration: number;
  rem_sleep_duration: number;
  average_heart_rate: number | null;
  average_hrv: number | null;
  lowest_heart_rate: number | null;
  efficiency: number | null;
  latency: number | null;
  awake_time: number | null;
}

export interface OuraDailyActivity {
  day: string;
  score: number | null;
  active_calories: number;
  steps: number;
  equivalent_walking_distance: number;
  total_calories: number;
  timestamp: string;
}

export interface OuraApiResponse<T> {
  data: T[];
  next_token?: string;
}

export interface OuraTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
