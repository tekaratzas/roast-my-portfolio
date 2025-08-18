import { useCallback, useEffect, useState, useRef } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { backendService } from '../../services/Backend';
import type { Holding } from '../../../shared/Types';
import type { InvestmentsResponse } from '../shared/Types';

const QUERY_KEY = "s";

function encodeStocks(holdings: InvestmentsResponse): string {
    return btoa(encodeURIComponent(JSON.stringify(holdings)));
}

function PlaidLinkButton({ plaidURL, isLoading }: { plaidURL: string, isLoading: boolean }) {
    const [isOAuthCallback, setIsOAuthCallback] = useState(false);
    const hasInitialized = useRef(false);
    const navigate = useNavigate();

    // Check if we're in an OAuth callback flow
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const oauthStateId = urlParams.get('oauth_state_id');
        setIsOAuthCallback(!!oauthStateId);
    }, []);

    const onSuccess = useCallback((public_token: string) => {
        console.log("onSuccess", public_token);
        fetchInvestments(public_token, navigate);
    }, []);

    const onExit = useCallback((err: any, metadata: any) => {
        console.log("onExit", err, metadata);
        if (err) {
            console.error("Plaid Link error:", err);
        }
    }, []);

    const config: Parameters<typeof usePlaidLink>[0] = {
        token: plaidURL,
        // Only set receivedRedirectUri if we're in an OAuth callback
        ...(isOAuthCallback && { receivedRedirectUri: window.location.href }),
        onSuccess,
        onExit,
    };

    const { open, ready, error } = usePlaidLink(config);

    // Only auto-open if we're in an OAuth callback and haven't initialized yet
    useEffect(() => {
        if (ready && isOAuthCallback && !hasInitialized.current) {
            hasInitialized.current = true;
            open();
        }
    }, [ready, open, isOAuthCallback]);

    // Cleanup effect to prevent multiple initializations
    useEffect(() => {
        return () => {
            hasInitialized.current = false;
        };
    }, []);

    if (isLoading || !ready) {
        return (
            <button className="px-8 py-4 bg-[var(--background-surface)] border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-xl transition-all duration-300 cursor-not-allowed opacity-50">
                Loading...
            </button>
        )
    }

    if (error) {
        return (
            <div className="px-8 py-4 bg-red-600 text-white font-semibold rounded-xl">
                Error: {error.message}
            </div>
        )
    }

    return (
        <button
            className="px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--background)] font-semibold rounded-xl transition-all duration-300 hover:scale-105 text-lg"
            onClick={() => open()}
        >
            Start Portfolio Analysis
        </button>
    )
}

function fetchInvestments(publicToken: string, navigate: NavigateFunction) {
    backendService.getInvestments(publicToken).then((response) => {
        console.log(response);
        const encoded = encodeStocks(response);

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

export default PlaidLinkButton;