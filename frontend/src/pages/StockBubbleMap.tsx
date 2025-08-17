import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Keep your import as requested
import HC_more from "highcharts/highcharts-more";

export interface Stock {
  name: string;                   // ticker/symbol
  percentageOfPortfolio: number;  // 0..100
  sector: string;
  value?: number;                 // market cap in billions (optional)
  change?: number;                // daily % change
  price?: number;
}

type Props = {
  stocks: Stock[];
};

const QUERY_KEY = "s";

// Encode stocks as JSON in query string
function encodeStocks(stocks: Stock[]): string {
  return encodeURIComponent(JSON.stringify(stocks));
}

// Decode stocks back
function decodeStocks(param: string | null): Stock[] | null {
  if (!param) return null;
  try {
    const arr = JSON.parse(decodeURIComponent(param)) as Stock[];
    if (Array.isArray(arr)) return arr;
    return null;
  } catch {
    return null;
  }
}

function replaceUrlParam(encoded: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(QUERY_KEY, encoded);
  window.history.replaceState({}, "", url.toString());
}

const StockBubbleMap: React.FC<Props> = ({ stocks }) => {
  // Decode from URL if present
  const decoded = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = new URL(window.location.href);
    return decodeStocks(url.searchParams.get(QUERY_KEY));
  }, []);

  const effectiveStocks = decoded ?? stocks;

  // If no query param, set it on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.get(QUERY_KEY) && stocks?.length) {
      const encoded = encodeStocks(stocks);
      replaceUrlParam(encoded);
    }
  }, [stocks]);

  // Optional: click to copy full URL
  const copyShareUrl = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    const encoded = encodeStocks(effectiveStocks);
    replaceUrlParam(encoded);
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Share URL copied to clipboard!");
    } catch {
      alert("URL updated in address bar.");
    }
  }, [effectiveStocks]);

  // Group by sector for packed-bubble series
  const bySector: Record<string, Highcharts.PointOptionsObject[]> = {};
  effectiveStocks.forEach((s) => {
    if (!bySector[s.sector]) bySector[s.sector] = [];
    bySector[s.sector].push({
      name: s.name,
      value: s.value ?? s.percentageOfPortfolio,
      change: s.change,
      price: s.price,
      percentageOfPortfolio: s.percentageOfPortfolio
    } as any);
  });

  const series: Highcharts.SeriesPackedbubbleOptions[] = Object.entries(bySector).map(
    ([sector, data]) => ({
      type: "packedbubble",
      name: sector,
      data,
      colorKey: "change"
    })
  );

  const options: Highcharts.Options = {
    chart: { type: "packedbubble", height: "100%", backgroundColor: "#f7f8fa" },
    title: {
      text: "My Holdings",
      align: "center",
      style: { fontWeight: "600", fontSize: "24px" }
    },
    legend: { enabled: false },
    colorAxis: {
      dataClasses: [
        { to: -0.0001, color: "#c0392b" },
        { from: -0.0001, to: 0.0001, color: "#7f8c8d" },
        { from: 0.0001, color: "#2ecc71" }
      ]
    },
    plotOptions: {
      packedbubble: {
        minSize: "20%",
        maxSize: "120%",
        zMin: 0,
        zMax: 4000,
        layoutAlgorithm: { splitSeries: false, gravitationalConstant: 0.02 },
        lineWidth: 1,
        lineColor: "rgba(0,0,0,0.15)",
        dataLabels: {
          enabled: true,
          formatter: function () {
            const p = this.point as any;
            const showPercent = (p.percentageOfPortfolio ?? 0) >= 2;
            const pct = p.percentageOfPortfolio != null
              ? `${p.percentageOfPortfolio.toFixed(1)}%`
              : null;
            return showPercent && pct
              ? `${p.name}<br/><span style="font-size:14px; color:#6b7280">${pct}</span>`
              : `${p.name}`;
          },
          style: { color: "#111827", textOutline: "none", fontSize: "18px", fontWeight: "500" }
        }
      }
    },
    tooltip: {
      useHTML: true,
      formatter: function () {
        const p = this.point as any;
        const change =
          p.change != null ? `${p.change >= 0 ? "+" : ""}${p.change.toFixed(2)}%` : "N/A";
        const price = p.price != null ? `$${p.price.toFixed(2)}` : "N/A";
        const cap = p.value != null ? `${Number(p.value).toLocaleString()}B` : "—";
        const pct = p.percentageOfPortfolio != null ? `${p.percentageOfPortfolio.toFixed(2)}%` : "—";
        const color = p.change > 0 ? "#2ecc71" : p.change < 0 ? "#c0392b" : "#7f8c8d";
        return `
          <div style="min-width:180px">
            <div style="font-weight:600; margin-bottom:4px">${p.name}</div>
            <div><b>Price:</b> ${price}</div>
            <div><b>Market Cap:</b> ${cap}</div>
            <div><b>Portfolio:</b> ${pct}</div>
            <div><b>Change:</b> <span style="color:${color}">${change}</span></div>
          </div>
        `;
      }
    },
    series
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <button
        onClick={copyShareUrl}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100vh",
          margin: 0,
          padding: 0,
          background: "#f7f8fa",
        }}
      >
        Share
      </button>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default StockBubbleMap;
