export interface LinkResponse {
    linkToken: string;
}

export interface InvestmentsResponse {
    holdings: Holding[];
}

export interface Holding {
    ticker: string | undefined;
    securityId: string;
    sector: string | undefined;
    percentage: number;
}