import {
  PlaidApi,
  Configuration,
  PlaidEnvironments,
  Holding,
  Security,
} from "plaid";
import { AuthenticationController } from "./authentication";

const APP_PORT = process.env.APP_PORT || 8000;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

export class InvestmentsController {
  private plaidClient: PlaidApi;
  private authenticationController: AuthenticationController;

  constructor() {
    this.authenticationController = new AuthenticationController();
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

  public async getHoldings(publicToken: string) {
    const accessToken =
      await this.authenticationController.getAccessToken(publicToken);

    const response = await this.plaidClient
      .investmentsHoldingsGet({ access_token: accessToken })
      .catch((error) => {
        console.error("error :>> ", error);
        throw error;
      });

    console.log("response.data.holdings :>> ", response.data.holdings);
    console.log("response.data.securities :>> ", response.data.securities);

    return this.formatHoldings(
      response.data.holdings,
      response.data.securities
    );
  }

  // Get the total monentary value of the holdings
  // and return the percentage of the total value for each holding
  private formatHoldings(holdings: Holding[], securities: Security[]) {
    const securityMap = new Map(
      securities.map((security) => [security.security_id, security])
    );

    const totalValue = holdings.reduce(
      (acc, holding) => acc + holding.institution_value,
      0
    );

    const formattedHoldings = holdings.map((holding) => {
      const security = securityMap.get(holding.security_id);
      return {
        ticker: security?.ticker_symbol,
        name: security?.name,
        security_id: holding.security_id,
        sector: security?.sector,
        percentage: holding.institution_value / totalValue,
      };
    });

    return {
      holdings: formattedHoldings,
    };
  }
}
