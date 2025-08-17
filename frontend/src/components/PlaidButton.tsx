import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

function PlaidLinkButton({ plaidURL, isLoading }: { plaidURL: string, isLoading: boolean }) {
    const [isOAuthCallback, setIsOAuthCallback] = useState(false);

    // Check if we're in an OAuth callback flow
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const oauthStateId = urlParams.get('oauth_state_id');
        setIsOAuthCallback(!!oauthStateId);
    }, []);

    const onSuccess = useCallback((public_token: string) => {
        console.log("onSuccess", public_token);
        // Handle the success - you might want to redirect or show success message
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

    // Only auto-open if we're in an OAuth callback
    useEffect(() => {
        if (ready && isOAuthCallback) {
            open();
        }
    }, [ready, open, isOAuthCallback]);

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

export default PlaidLinkButton;