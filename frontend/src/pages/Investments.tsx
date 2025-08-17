import { useEffect, useState } from "react";
import { backendService } from "../../services/Backend";
import type { Holding } from "../../../shared/Types";
import { useNavigate } from "react-router-dom";

const QUERY_KEY = "s";

function encodeStocks(stocks: Holding[]): string {
    return encodeURIComponent(JSON.stringify(stocks));
}

function InvestmentsPage() {
    const [token, setToken] = useState<string | null>(null);
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const publicToken = localStorage.getItem('public_token');
        setToken(publicToken);
        if (publicToken) {
            backendService.getInvestments(publicToken).then((response) => {
                console.log(response);
                setHoldings(response.holdings);
                const encoded = encodeStocks(response.holdings);
                // replaceUrlParam(encoded);

                const params = new URLSearchParams();
                params.set(QUERY_KEY, encoded); // default encoding

                navigate(
                    {
                    pathname: "/stock-bubble-map",
                    search: `?${params.toString()}`,
                    },
                    { replace: true } // same semantics as replaceState
                );
            });
        }   
    }, []);

    function replaceUrlParam(encoded: string) {
        const url = new URL(window.location.href);
        url.searchParams.set(QUERY_KEY, encoded);
        window.history.replaceState({}, "", url.toString());
    }

    return (
        <div>
            <h1>Investments</h1>
            <p>Token: {token}</p>

            {holdings.map((holding) => (
                <div key={holding.securityId}>
                    <p>{holding.ticker}</p>
                    <p>{holding.percentage}</p>
                </div>
            ))}


        </div>
    )
}

export default InvestmentsPage;