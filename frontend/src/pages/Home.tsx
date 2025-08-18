import React, { useState, useEffect } from "react";
import PlaidButton from "../components/PlaidButton";
import { Link } from "react-router-dom";
import { backendService } from "../../services/Backend";
import type { LinkResponse } from "../shared/Types";

export const Home: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [plaidURL, setPlaidURL] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    backendService.getLinkToken().then((response: LinkResponse) => {
      setPlaidURL(response.linkToken);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black overflow-hidden relative">      

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute border-2 border-cyan-400 opacity-30 animate-spin"
            style={{
              left: `${20 + (i * 10)}%`,
              top: `${30 + (i * 15)}%`,
              width: `${100 + i * 20}px`,
              height: `${100 + i * 20}px`,
              transform: `rotate(${i * 45}deg)`,
              animationDuration: `${20 + i * 2}s`,
              borderColor: `hsl(${180 + i * 30}, 100%, 70%)`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Clean Title */}
        <div className="relative mb-16">
          <h1 
            className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400"
            style={{
              textShadow: `
                0 0 5px #00ffff,
                0 0 10px #00ffff,
                0 0 15px #00ffff
              `,
            }}
          >
            ROAST
          </h1>
          <h1   
            className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400"
            style={{
              textShadow: `
                0 0 5px #ff00ff,
                0 0 10px #ff00ff,
                0 0 15px #ff00ff
              `,
            }}
          >
            MY
          </h1>
          <h1 
            className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-yellow-400"
            style={{
              textShadow: `
                0 0 5px #ffff00,
                0 0 10px #ffff00,
                0 0 15px #ffff00
              `,
            }}
          >
            PORTFOLIO
          </h1>
        </div>

        {/* Subtitle with Better Legibility */}
        <div className="text-center mb-16">
          <p className="text-2xl md:text-3xl text-white font-semibold mb-4 drop-shadow-lg">
            Where your investments get the roasting they deserve
          </p>
          <p className="text-lg text-gray-200 font-medium drop-shadow-md">
            Connect your portfolio and prepare for brutal honesty
          </p>
        </div>

        {/* Main Action Button */}
        <div className="mb-16 transform hover:scale-110 transition-transform duration-300">
          <PlaidButton plaidURL={plaidURL} isLoading={isLoading} />
        </div>

        {/* Navigation Links with Hover Effects */}
        <div className="flex flex-col sm:flex-row gap-8 mb-16">
          <Link
            to="/stock-bubble-map"
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/50"
            style={{
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
            }}
          >
            <span className="relative z-10">View Bubble Map</span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          
          <Link
            to="/portfolio-analysis"
            className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/50"
            style={{
              boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
            }}
          >
            <span className="relative z-10">Portfolio Analysis</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>

        {/* Floating Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {[
            {
              title: "Connect",
              description: "Link your investment accounts securely",
              icon: "🔗",
              color: "from-cyan-500 to-blue-500"
            },
            {
              title: "Analyze",
              description: "Get brutally honest portfolio insights",
              icon: "🔍",
              color: "from-pink-500 to-purple-500"
            },
            {
              title: "Improve",
              description: "Learn from the roasting and grow",
              icon: "📈",
              color: "from-yellow-500 to-orange-500"
            }
          ].map((card, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
              <p className="text-gray-300 text-sm">{card.description}</p>
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`} />
            </div>
          ))}
        </div>

        {/* Floating Clock */}
        <div className="fixed top-8 right-8 text-cyan-400 font-mono text-lg bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-cyan-400/30">
          {time.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
