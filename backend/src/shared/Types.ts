export interface LinkResponse {
  linkToken: string;
}

export interface InvestmentsResponse {
  holdings: Holding[];
}

export interface Holding {
  ticker?: string | null;
  securityId: string;
  sector?: string | null;
  percentage: number;
  name?: string | null;
}
