import './App.css'
import StockBubbleMap from "./pages/StockBubbleMap";
import type { Stock } from "./pages/StockBubbleMap";

const stocks: Stock[] = [
  { sector: "Technology", percentageOfPortfolio: 9, name: "AAPL", value: 3500, change: 1.2, price: 228.3 },
  { sector: "Technology", percentageOfPortfolio: 50, name: "MSFT", value: 3300, change: -0.6, price: 418.9 },
  { sector: "Financials", percentageOfPortfolio: 34, name: "JPM", value: 600, change: 0.4, price: 206.1 },
  { sector: "Energy", percentageOfPortfolio: 30, name: "XOM", value: 470, change: -1.9, price: 113.7 },
  { sector: "Consumer", percentageOfPortfolio: 2, name: "AMZN", value: 2200, change: 0.0, price: 182.6 },
];

export default function App() {
  return <StockBubbleMap stocks={stocks} />;
}
