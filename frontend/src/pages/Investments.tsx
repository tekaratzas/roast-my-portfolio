import { useEffect, useState } from "react";
import { backendService } from "../../services/Backend";
import type { Holding } from "../../../shared/Types";

function InvestmentsPage() {
    const [token, setToken] = useState<string | null>(null);
    const [holdings, setHoldings] = useState<Holding[]>([]);

    useEffect(() => {
        const publicToken = localStorage.getItem('public_token');
        setToken(publicToken);
        if (publicToken) {
            backendService.getInvestments(publicToken).then((response) => {
                console.log(response);
                setHoldings(response.holdings);
            });
        }   
    }, []);

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