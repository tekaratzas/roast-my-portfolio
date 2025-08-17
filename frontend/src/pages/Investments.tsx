import { useEffect, useState } from "react";
import { backendService } from "../../services/Backend";

function InvestmentsPage() {
    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        const publicToken = localStorage.getItem('public_token');
        setToken(publicToken);
        if (publicToken) {
            backendService.getInvestments(publicToken).then((response) => {
                console.log(response);
            });
        }
    }, []);
    
    return (
        <div>
            <h1>Investments</h1>
            <p>Token: {token}</p>
        </div>
    )
}

export default InvestmentsPage;