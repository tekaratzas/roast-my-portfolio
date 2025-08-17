import { useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';

function PlaidLinkButton({ plaidURL, isLoading }: { plaidURL: string, isLoading: boolean }) {

    const onSuccess = useCallback((public_token: string) => {
        console.log("onSuccess", public_token);
    }, []);

    const onExit = useCallback((err: any, metadata: any) => {
        console.log("onExit", err, metadata);
    }, []);

    const config: Parameters<typeof usePlaidLink>[0] = {
        token: plaidURL,
        // pass in the received redirect URI, which contains an OAuth state ID parameter that is required to
        // re-initialize Link
        receivedRedirectUri: window.location.href,
        onSuccess,
        onExit,
    };

    const { open, ready, error } = usePlaidLink(config);

    // automatically reinitialize Link
    useEffect(() => {
        if (ready) {
            open();
        }
    }, [ready, open]);

    if (isLoading || !ready) {
        return (
            <button className="px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--background)] font-semibold rounded-xl transition-all duration-300 hover:scale-105 text-lg">
                Loading...
            </button>
        )
    }

    if (error) {
        return (
            <div className="px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--background)] font-semibold rounded-xl transition-all duration-300 hover:scale-105 text-lg">
                Error: {error.message}
            </div>
        )
    }
    return (
        <button className="px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--background)] font-semibold rounded-xl transition-all duration-300 hover:scale-105 text-lg" onClick={() => open()}>
            Start Portfolio Analysis
        </button>
    )
}

export default PlaidLinkButton;