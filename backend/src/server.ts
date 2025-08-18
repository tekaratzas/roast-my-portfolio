import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { AuthenticationController } from "./authentication";
import { InvestmentsController } from "./investments";
import { LinkResponse, Holding } from "./shared/Types";

// Run validation
validateEnvironmentVariables();

// Add error handling for unhandled errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const authenticationController = new AuthenticationController();
const investmentsController = new InvestmentsController();

app.get(
  "/plaid_oauth_link",
  async (req: Request, res: Response): Promise<LinkResponse | void> => {
    const linkToken = await authenticationController.getPlaidOauthLink();
    if (!linkToken) {
      res.status(500).json({ error: "Failed to get link token" });
      return;
    }

    res.json({ linkToken });
  }
);

app.get(
  "/investments",
  async (
    req: Request,
    res: Response
  ): Promise<{ holdings: Holding[] } | void> => {
    const publicToken = req.query.publicToken as string;
    if (!req.query.publicToken) {
      res.status(400).json({ error: "Access token is required" });
      return;
    }

    res.json({
      holdings: await investmentsController.getHoldings(publicToken),
    });
  }
);

// Add a simple health check endpoint
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const server = app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

// Add graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

// Validate required environment variables
function validateEnvironmentVariables() {
  const requiredEnvVars = {
    PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID,
    PLAID_SECRET: process.env.PLAID_SECRET,
    PLAID_ENV: process.env.PLAID_ENV,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  console.log('✅ All required environment variables are present');
}