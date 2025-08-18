export interface LinkResponse {
  linkToken: string;
}

export interface InvestmentsResponse {
  holdings: Holding[];
  totalPL: number;
}

export interface Holding {
  /**
   * The name of the security
   */
  name: string;
  /**
   * The ticker symbol of the security
   */
  ticker?: string | null;
  /**
   * The sector of the security
   */
  sector?: string | null;
  /**
   * The security ID of the security
   */
  securityId: string;
  /**
   * The percentage of the portfolio that the security represents
   */
  percentage: number;
  /**
   * The price of the security
   */
  price?: number | null;
  /**
   * The percentage of the portfolio that the security represents
   */
  percentagePL?: number | null;
}

export interface PlaidLinkResponse {
  linkToken: string;
}
