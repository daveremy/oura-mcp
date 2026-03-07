import type {
  OuraApiResponse,
  OuraDailyActivity,
  OuraDailyReadiness,
  OuraDailySleep,
  OuraDailySpO2,
  OuraDailyStress,
  OuraHeartRate,
  OuraSession,
  OuraSleepPeriod,
  OuraTokens,
  OuraWorkout,
} from "./types.js";

export class OuraClient {
  private accessToken: string;
  private refreshToken: string;
  private clientId: string;
  private clientSecret: string;
  private baseUrl = "https://api.ouraring.com";
  private refreshPromise: Promise<void> | null = null;

  constructor(opts: {
    accessToken: string;
    refreshToken: string;
    clientId: string;
    clientSecret: string;
  }) {
    this.accessToken = opts.accessToken;
    this.refreshToken = opts.refreshToken;
    this.clientId = opts.clientId;
    this.clientSecret = opts.clientSecret;
  }

  /** Create client from environment variables. Supports both personal access token and OAuth. */
  static fromEnv(): OuraClient {
    // Personal access token (simplest — no refresh needed)
    const pat = process.env.OURA_TOKEN;
    if (pat) {
      return new OuraClient({ accessToken: pat, refreshToken: "", clientId: "", clientSecret: "" });
    }

    // OAuth flow
    const accessToken = process.env.OURA_ACCESS_TOKEN;
    const refreshToken = process.env.OURA_REFRESH_TOKEN;
    const clientId = process.env.OURA_CLIENT_ID;
    const clientSecret = process.env.OURA_CLIENT_SECRET;

    if (!accessToken || !refreshToken) {
      throw new Error(
        "Missing OURA_TOKEN (personal access token) or OURA_ACCESS_TOKEN/OURA_REFRESH_TOKEN (OAuth). Run: oura auth"
      );
    }
    if (!clientId || !clientSecret) {
      throw new Error(
        "Missing OURA_CLIENT_ID or OURA_CLIENT_SECRET in environment."
      );
    }

    return new OuraClient({ accessToken, refreshToken, clientId, clientSecret });
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    let res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (res.status === 401 && this.refreshToken) {
      await this.serializedRefresh();
      res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Oura API ${res.status}: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  private serializedRefresh(): Promise<void> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.doRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  private async doRefresh(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Token refresh failed: ${body}`);
    }

    const tokens: OuraTokens = await res.json();
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    console.error("[oura] Token refreshed successfully.");
  }

  async getDailySleep(date: string): Promise<OuraDailySleep | null> {
    const res = await this.request<OuraApiResponse<OuraDailySleep>>(
      "v2/usercollection/daily_sleep",
      { start_date: date, end_date: date }
    );
    return res.data[0] ?? null;
  }

  async getDailySleepRange(startDate: string, endDate: string): Promise<OuraDailySleep[]> {
    const res = await this.request<OuraApiResponse<OuraDailySleep>>(
      "v2/usercollection/daily_sleep",
      { start_date: startDate, end_date: endDate }
    );
    return res.data;
  }

  async getDailyReadiness(date: string): Promise<OuraDailyReadiness | null> {
    const res = await this.request<OuraApiResponse<OuraDailyReadiness>>(
      "v2/usercollection/daily_readiness",
      { start_date: date, end_date: date }
    );
    return res.data[0] ?? null;
  }

  async getDailyReadinessRange(startDate: string, endDate: string): Promise<OuraDailyReadiness[]> {
    const res = await this.request<OuraApiResponse<OuraDailyReadiness>>(
      "v2/usercollection/daily_readiness",
      { start_date: startDate, end_date: endDate }
    );
    return res.data;
  }

  async getSleepPeriods(date: string): Promise<OuraSleepPeriod[]> {
    const res = await this.request<OuraApiResponse<OuraSleepPeriod>>(
      "v2/usercollection/sleep",
      { start_date: date, end_date: date }
    );
    return res.data;
  }

  async getDailyActivity(date: string): Promise<OuraDailyActivity | null> {
    const res = await this.request<OuraApiResponse<OuraDailyActivity>>(
      "v2/usercollection/daily_activity",
      { start_date: date, end_date: date }
    );
    return res.data[0] ?? null;
  }

  async getWorkouts(date: string): Promise<OuraWorkout[]> {
    const res = await this.request<OuraApiResponse<OuraWorkout>>(
      "v2/usercollection/workout",
      { start_date: date, end_date: date }
    );
    return res.data;
  }

  async getHeartRate(startDatetime: string, endDatetime: string): Promise<OuraHeartRate[]> {
    const res = await this.request<OuraApiResponse<OuraHeartRate>>(
      "v2/usercollection/heartrate",
      { start_datetime: startDatetime, end_datetime: endDatetime }
    );
    return res.data;
  }

  async getDailyStress(date: string): Promise<OuraDailyStress | null> {
    const res = await this.request<OuraApiResponse<OuraDailyStress>>(
      "v2/usercollection/daily_stress",
      { start_date: date, end_date: date }
    );
    return res.data[0] ?? null;
  }

  async getDailySpO2(date: string): Promise<OuraDailySpO2 | null> {
    const res = await this.request<OuraApiResponse<OuraDailySpO2>>(
      "v2/usercollection/daily_spo2",
      { start_date: date, end_date: date }
    );
    return res.data[0] ?? null;
  }

  async getSessions(date: string): Promise<OuraSession[]> {
    const res = await this.request<OuraApiResponse<OuraSession>>(
      "v2/usercollection/session",
      { start_date: date, end_date: date }
    );
    return res.data;
  }
}
