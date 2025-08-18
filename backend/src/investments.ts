import {
  PlaidApi,
  Configuration,
  PlaidEnvironments,
  Holding,
  Security,
} from "plaid";
import { AuthenticationController } from "./authentication";
import { Holding as HoldingType, InvestmentsResponse } from "./shared/Types";
// import {
//   DefaultApi,
//   ListTickers200Response,
//   restClient,
// } from "@polygon.io/client-js";
import {
  DefaultApi,
  restClient,
  ListTickers200Response,
} from "@polygon.io/client-js";

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

const MAX_REQUESTS = process.env.MAX_REQUESTS
  ? parseInt(process.env.MAX_REQUESTS)
  : 10e4;

export class InvestmentsController {
  private plaidClient: PlaidApi;
  private authenticationController: AuthenticationController;
  private counter: number;
  // private polygonClient: DefaultApi;

  constructor() {
    if (!PLAID_CLIENT_ID || !PLAID_SECRET || !PLAID_ENV) {
      throw new Error(
        "PLAID_CLIENT_ID, PLAID_SECRET, and PLAID_ENV must be set"
      );
    }
    if (!POLYGON_API_KEY) {
      throw new Error("POLYGON_API_KEY must be set");
    }

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

    // this.polygonClient = restClient(POLYGON_API_KEY, "https://api.polygon.io");
  }

  public async getHoldings(publicToken: string): Promise<InvestmentsResponse> {
    console.log("current counter:", this.counter, "out of", MAX_REQUESTS);
    if (this.counter++ > MAX_REQUESTS) {
      throw new Error("Too many requests");
    }

    console.log("getting access token from public:", publicToken);

    const accessToken = await this.authenticationController
      .getAccessToken(publicToken)
      .catch((error) => {
        throw new Error("Error getting access token: " + error.message);
      });

    const response = await this.plaidClient
      .investmentsHoldingsGet({ access_token: accessToken })
      .catch((error) => {
        throw new Error("Error getting holdings: " + error.message);
      });

    return this.formatHoldings(
      response.data.holdings,
      response.data.securities
    );
  }

  // private async getPolygonSecurity(
  //   securityId: string
  // ): Promise<ListTickers200Response> {
  //   const response = await this.polygonClient.listTickers("SPY");
  //   return response;
  // }

  private formatHoldings(
    holdings: Holding[],
    securities: Security[]
  ): InvestmentsResponse {
    const securityMap = new Map(
      securities.map((security) => [security.security_id, security])
    );

    const totalValue = holdings.reduce(
      (acc, holding) => acc + holding.institution_value,
      0
    );

    // console.log(this.getPolygonSecurity("SPY"));

    const totalPL = holdings.reduce(
      (acc, holding) =>
        acc +
        ((securityMap.get(holding.security_id)?.close_price ||
          holding.institution_price) -
          (holding.cost_basis || 0)) *
          holding.quantity,
      0
    );

    return {
      holdings: holdings.map((holding) => {
        const security = securityMap.get(holding.security_id);
        const holdingPL =
          ((security?.close_price || holding.institution_price) -
            (holding.cost_basis || 0)) *
          holding.quantity;
        return {
          ticker: security?.ticker_symbol || undefined,
          name: security?.name || `Security ${holding.security_id}`,
          securityId: holding.security_id,
          sector: security?.sector || undefined,
          percentage: parseFloat(
            ((holding.institution_value / totalValue) * 100).toFixed(2)
          ),
          price: security?.close_price || holding.institution_price,
          percentagePL:
            totalPL !== 0
              ? parseFloat(((holdingPL / totalPL) * 100).toFixed(2))
              : 0,
        };
      }),
      totalPL,
    };
  }
}
