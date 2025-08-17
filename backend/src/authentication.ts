import {
  Products,
  CountryCode,
  PlaidApi,
  Configuration,
  PlaidEnvironments,
} from "plaid";

import dotenv from "dotenv";
dotenv.config();

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";
const PLAID_REDIRECT_URI =
  process.env.PLAID_REDIRECT_URI || "https://localhost:3001/";

export class AuthenticationController {
  private plaidClient: PlaidApi;

  constructor() {
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

  public async getPlaidOauthLink() {
    const createTokenResponse = await this.plaidClient.linkTokenCreate({
      client_name: "Roast My Portfolio",
      user: {
        client_user_id: "user-id",
      },
      products: [Products.Investments],
      country_codes: [CountryCode.Us],
      language: "en",
      redirect_uri: PLAID_REDIRECT_URI,
    });

    const linkToken = createTokenResponse.data.link_token;

    return linkToken;
  }

  public async getAccessToken(publicToken: string) {
    const response = await this.plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    return response.data.access_token;
  }
}
