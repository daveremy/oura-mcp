import type {
  OuraApiResponse,
  OuraDailyActivity,
  OuraDailyReadiness,
  OuraDailySleep,
  OuraSleepPeriod,
  OuraTokens,
} from "./types.js";

export class OuraClient {
  private accessToken: string;
  private refreshToken: string;
  private clientId: string;
  private clientSecret: string;
  private baseUrl = "https://api.ouraring.com";

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

  /** Create client from environment variables. Throws if required vars are missing. */
  static fromEnv(): OuraClient {
    const accessToken = process.env.OURA_ACCESS_TOKEN;
    const refreshToken = process.env.OURA_REFRESH_TOKEN;
    const clientId = process.env.OURA_CLIENT_ID;
    const clientSecret = process.env.OURA_CLIENT_SECRET;

    if (!accessToken || !refreshToken) {
      throw new Error(
        "Missing OURA_ACCESS_TOKEN or OURA_REFRESH_TOKEN. Run: oura auth"
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

    if (res.status === 401) {
      await this.doRefresh();
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

    // Print new tokens so user can update their env
    console.error("[oura] Token refreshed. New tokens:");
    console.error(`OURA_ACCESS_TOKEN=${tokens.access_token}`);
    console.error(`OURA_REFRESH_TOKEN=${tokens.refresh_token}`);
  }

  async getDailySleep(date: string): Promise<OuraDailySleep | null> {
    const res = await this.request<OuraApiResponse<OuraDailySleep>>(
      "v2/usercollection/daily_sleep",
      { start_date: date, end_date: date }
    );
    return res.data[0] ?? null;
  }

  async getDailyReadiness(date: string): Promise<OuraDailyReadiness | null> {
    const res = await this.request<OuraApiResponse<OuraDailyReadiness>>(
      "v2/usercollection/daily_readiness",
      { start_date: date, end_date: date }
    );
    return res.data[0] ?? null;
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
}
