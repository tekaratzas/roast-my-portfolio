import {
  Products,
  CountryCode,
  PlaidApi,
  Configuration,
  PlaidEnvironments,
} from "plaid";

import dotenv from "dotenv";
dotenv.config();

const APP_PORT = process.env.APP_PORT || 8000;

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";
const PLAID_REDIRECT_URI =
  process.env.PLAID_REDIRECT_URI || "https://localhost:3001/";

export class AuthenticationController {
  private plaidClient: PlaidApi;

  constructor() {
    console.log(PLAID_CLIENT_ID, PLAID_SECRET);
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
    try {
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
      console.log("createTokenResponse :>> ", createTokenResponse);
      const linkToken = createTokenResponse.data.link_token;

      return linkToken;
    } catch (error) {
      // handle error
      console.error("error :>> ", error);
    }
  }

  public async getAccessToken(publicToken: string) {
    const response = await this.plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    return response.data.access_token;
  }
}
