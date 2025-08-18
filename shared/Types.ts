export interface LinkResponse {
  linkToken: string;
}

export interface InvestmentsResponse {
  holdings: Holding[];
}

export interface Holding {
  name: string;
  ticker?: string | null;
  securityId: string;
  sector?: string | null;
  percentage: number;
  price?: number | null;
  percentagePL?: number | null;
}

export interface PlaidLinkResponse {
  linkToken: string;
}
