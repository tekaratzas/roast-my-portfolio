import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
// @ts-ignore
import HighchartsMore from "highcharts/highcharts-more";
// @ts-ignore
import highchartsAnnotations from "highcharts/modules/annotations";
// @ts-ignore
import colorAxis from 'highcharts/modules/coloraxis';
// @ts-ignore
import HC_treemap from "highcharts/modules/treemap";
import type { InvestmentsResponse } from "../../../shared/Types";


type Props = {
  stocks: InvestmentsResponse;
};

const QUERY_KEY = "s";

function encodeHoldings(holdings: InvestmentsResponse): string {
  return btoa(encodeURIComponent(JSON.stringify(holdings)));
}

const getHeightPct = () =>
  typeof window === "undefined"
    ? "100%" // SSR-safe fallback
    : `${(window.innerHeight / window.innerWidth) * 100}%`;

function decodeHoldings(param: string | null): InvestmentsResponse | null {
  if (!param) return null;
  try {
    const resp = JSON.parse(decodeURIComponent(atob(param)));
    return resp.holdings;
  } catch {
    return null;
  }
}

function replaceUrlParam(encoded: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(QUERY_KEY, encoded);
  window.history.replaceState({}, "", url.toString());
}

const StockTreemap: React.FC<Props> = ({ stocks }) => {
  const [heightPct, setHeightPct] = React.useState<string>(getHeightPct);

  React.useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setHeightPct(getHeightPct()));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Decode from URL if present
  const decoded: InvestmentsResponse | null = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = new URL(window.location.href);
    return decodeHoldings(url.searchParams.get(QUERY_KEY));
  }, []);

  const effectiveStocks = decoded ?? stocks;

  // If no query param, set it on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.get(QUERY_KEY) && stocks?.holdings.length) {
      const encoded = encodeHoldings(stocks);
      replaceUrlParam(encoded);
    }
  }, [stocks]);

  // Click to copy full URL
  const copyShareUrl = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
    }
  }, [effectiveStocks]);

  // ---------- Treemap data ----------
  console.log("NABIL")
  console.log(effectiveStocks.holdings)
  const treemapData: Highcharts.PointOptionsObject[] = [
    ...effectiveStocks.holdings.map(s => ({
      id: s.ticker || s.name,
      name: s.ticker || s.name,     // label tries ticker first
      fullName: s.name,             // for tooltip
      value: Math.max(0.0001, s.percentage), // area ~ portfolio weight
      percentage: s.percentage,     // 0..1
      percentagePL: s.percentagePL,
      price: s.price,
    }))
  ];

  // ----- Color gradient based on change ------------------------------------
  // Auto-scale the gradient to your actual data so shades look meaningful
  const changes = effectiveStocks
    .holdings
    .map((s) => (s as any).change)
    .filter((v): v is number => typeof v === "number" && isFinite(v));

  // Symmetric range around 0 using the largest absolute change (clamped)
  const maxAbs = changes.length ? Math.max(...changes.map((v) => Math.abs(v))) : 5;
  const range = Math.min(50, Math.max(1, Math.ceil(maxAbs))); // sane bounds

  // ---------- Options ----------
  const options: Highcharts.Options = {
    chart: {
      type: "treemap",
      height: heightPct, // your aspect height
      backgroundColor: "#f7f8fa",
      spacing: [0, 0, 0, 0],
      margin: [0, 0, 0, 0]
    },
    title: {
      text: "",
      align: "center",
      style: { fontWeight: "600", fontSize: "24px" },
    },
    legend: { enabled: false },

    colorAxis: {
      minColor: '#f73539',
      maxColor: '#2ecc59',
      stops: [
          [0, '#f73539'],
          [0.5, '#414555'],
          [1, '#2ecc59']
      ],
      min: -10,
      max: 10,
      gridLineWidth: 0,
      labels: {
          overflow: 'allow',
          format: '{#gt value 0}+{value}{else}{value}{/gt}%',
          style: {
              color: 'white'
          }
      }
  },

    series: [{
      type: "treemap",
      layoutAlgorithm: "squarified",
      allowDrillToNode: false,
      colorKey: "percentagePL",
      data: treemapData,
      borderColor: "rgba(0,0,0,0.15)",
      borderWidth: 1.5,

      // Stock labels: font size depends on label length (not percentage)
      dataLabels: {
        enabled: true,
        useHTML: false,
        allowOverlap: false,
        formatter: function () {
          // @ts-ignore
          const point = this.point as any;

          // Prefer ticker; if it's long/noisy, use acronym of full name
          const toAcronym = (str: string) =>
            (str || "")
              .split(/[\s\-_/]+/)
              .filter(Boolean)
              .map((w: string) => w[0])
              .join("")
              .toUpperCase();

          let display: string = point.name as string;
          // If not a short clean ticker, fall back to acronym of company name
          // if (!/^[A-Z0-9]{1,6}$/.test(display)) {
          //   const ac = toAcronym(point.fullName || display);
          //   if (ac && ac.length <= 6) display = ac;
          // }

          // Base font independent of percentage; only adjust for length,
          // and clamp to the tile to prevent overflow on very tiny tiles.
          const shape = (point.node && point.node.shapeArgs) || (point.shapeArgs as any);
          const w = shape?.width ?? 0;
          const h = shape?.height ?? 0;
          const shortSide = Math.max(0, Math.min(w, h));

          const basePx = 18; // constant base size
          const len = Math.max(1, display.length);
          const lengthScale = Math.max(0.6, Math.min(1, 8 / len)); // longer → smaller
          // cap so it can't exceed ~22% of the short side (visual fit)
          const capPx = Math.max(10, Math.floor(shortSide * 0.22));
          const labelFontPx = Math.min(capPx, Math.max(10, Math.round(basePx * lengthScale)));

          const pct =
            point.percentage != null ? `${(point.percentage).toFixed(1)}%` : null;
          const showPct = shortSide >= 70; // show only if there's space (not tied to percentage value)
          const pctFontPx = Math.max(9, Math.round(labelFontPx * 0.85));
          const pctPL = point.percentagePL != null
            ? `${point.percentagePL > 0 ? "+" : ""}${(point.percentagePL).toFixed(1)}%`
            : null;

          return showPct && pct
            ? `<tspan style="font-size:${pctFontPx*2}px; fill:#white">${pct}</tspan><br/><br/>
               <tspan style="font-size:${labelFontPx}px">${display}</tspan><br/><br/>
               ${
                 pctPL && parseFloat(point.percentagePL) !== 0
                   ? `<tspan style="font-size:${pctFontPx}px; fill:#white">P/L: ${pctPL}</tspan>`
                   : ""
               }`
            : `<tspan style="font-size:${labelFontPx}px">${display}</tspan>`;
        },
        style: {
          color: "white",
          textOutline: "none",
          fontWeight: "300"
        }
      }
    } as Highcharts.SeriesTreemapOptions],

    tooltip: {
      useHTML: true,
      formatter: function () {
        // @ts-ignore
        const p = this.point as any;
        const change =
          p.change != null
            ? `${p.change >= 0 ? "+" : ""}${p.change.toFixed(2)}%`
            : "N/A";
        const price = p.price != null ? `$${p.price.toFixed(2)}` : "N/A";
        const pct = p.percentage != null ? `${(p.percentage).toFixed(2)}%` : "—";
        const pctPL = p.percentagePL != null ? `${(p.percentagePL).toFixed(2)}%` : "—";
        return `
          <div style="min-width:180px">
            <div style="font-weight:600; margin-bottom:4px">${p.fullName || p.name}</div>
            <div><b>Ticker:</b> ${p.id || p.name}</div>
            <div><b>Price:</b> ${price}</div>
            <div><b>Portfolio:</b> ${pct}</div>
            <div><b>P&L:</b> ${pctPL}</div>
            <div><b>Change:</b> ${change}</div>
          </div>
        `;
      }
    }
  };

  return (
    <div className="w-full max-h-screen relative">
      <button
        onClick={copyShareUrl}
        style={{
          position: "absolute",
          right: 16,
          top: 16,
          zIndex: 2,
          padding: "6px 12px",
          fontSize: "12px",
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer",
          color: "#000",
        }}
      >
        Share
      </button>
      <div className="w-full h-full">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

export default StockTreemap;
