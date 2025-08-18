import {
  PlaidApi,
  Configuration,
  PlaidEnvironments,
  Holding,
  Security,
} from "plaid";
import { AuthenticationController } from "./authentication";
import { Holding as HoldingType } from "./shared/Types";

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

const MAX_REQUESTS = process.env.MAX_REQUESTS
  ? parseInt(process.env.MAX_REQUESTS)
  : 10e4;

export class InvestmentsController {
  private plaidClient: PlaidApi;
  private authenticationController: AuthenticationController;
  private counter: number;

  constructor() {
    this.authenticationController = new AuthenticationController();
    this.counter = 0;
    const configuration = new Configuration({
      basePath: PlaidEnvironments[PLAID_ENV],
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
          "PLAID-SECRET": PLAID_SECRET,
          "Plaid-Version": "2020-09-14",
        },
      },
    });

    this.plaidClient = new PlaidApi(configuration);
  }

  public async getHoldings(publicToken: string): Promise<HoldingType[]> {
    console.log("current counter:", this.counter, "out of", MAX_REQUESTS);
    if (this.counter++ > MAX_REQUESTS) {
      throw new Error("Too many requests");
    }

    const accessToken =
      await this.authenticationController.getAccessToken(publicToken);

    const response = await this.plaidClient
      .investmentsHoldingsGet({ access_token: accessToken })
      .catch((error) => {
        console.error("error :>> ", error);
        throw error;
      });

    return this.formatHoldings(
      response.data.holdings,
      response.data.securities
    );
  }

  private formatHoldings(
    holdings: Holding[],
    securities: Security[]
  ): HoldingType[] {
    const securityMap = new Map(
      securities.map((security) => [security.security_id, security])
    );

    const totalValue = holdings.reduce(
      (acc, holding) => acc + holding.institution_value,
      0
    );

    return holdings.map((holding) => {
      const security = securityMap.get(holding.security_id);
      return {
        ticker: security?.ticker_symbol || undefined,
        name: security?.name || `Security ${holding.security_id}`,
        securityId: holding.security_id,
        sector: security?.sector || undefined,
        percentage: parseFloat(
          ((holding.institution_value / totalValue) * 100).toFixed(2)
        ),
        price: security?.close_price || holding.institution_price,
      };
    });
  }
}
