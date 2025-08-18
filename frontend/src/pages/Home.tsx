import React, { useState, useEffect } from "react";
import PlaidButton from "../components/PlaidButton";
import { backendService } from "../../services/Backend";
import type { LinkResponse } from "../shared/Types";

export const Home: React.FC = () => {
  const [plaidURL, setPlaidURL] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

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
          <h1 className="text-8xl md:text-9xl font-black text-center">
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400"
              style={{
                textShadow: `
                  0 0 5px #00ffff,
                  0 0 10px #00ffff,
                  0 0 15px #00ffff
                `,
              }}
            >
              ROAST{' '}
            </span>
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400"
              style={{
                textShadow: `
                  0 0 5px #ff00ff,
                  0 0 10px #ff00ff,
                  0 0 15px #ff00ff
                `,
              }}
            >
              MY{' '}
            </span>
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-yellow-400"
              style={{
                textShadow: `
                  0 0 5px #ffff00,
                  0 0 10px #ffff00,
                  0 0 15px #ffff00
                `,
              }}
            >
              PORTFOLIO
            </span>
          </h1>
        </div>

        {/* Subtitle with Better Legibility */}
        <div className="text-center mb-16">
          <p className="text-4xl text-gray-200 font-bold drop-shadow-md">
            Connect your portfolio and get a visual representation of your portfolio.
          </p>
          <p className="text-4xl text-gray-200 font-bold drop-shadow-md">
            Share with your friends and get roasted.
          </p>
        </div>

        {/* Feature Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-16">
          {[
            {
              title: "No Data Stored",
              description: "We don't store any of your data. We use Plaid to get your data and then we use it to generate the report."
            },
            {
              title: "No Signup Required",
              description: "We don't require you to sign up for an account. You can use the tool without creating an account."
            },
            {
              title: "Completely Private",
              description: "We don't store any of your data. We use Plaid to get your data and then we use it to generate the report."
            },
            {
              title: "Plaid Secured",
              description: "We use Plaid to get your data and then we use it to generate the report."
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-pink-500/5 opacity-0 rounded-2xl" />
            </div>
          ))}
        </div>

        {/* Main Action Button */}
        <div className="mb-16 transform hover:scale-110 transition-transform duration-300">
          <PlaidButton plaidURL={plaidURL} isLoading={isLoading} />
        </div>

      </div>
    </div>
  );
};
