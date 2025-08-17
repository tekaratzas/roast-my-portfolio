import { CheckIcon } from '@heroicons/react/24/solid'; // or /outline
import { useEffect, useState } from 'react';
import { backendService } from '../../services/Backend';
import PlaidLinkButton from '../components/PlaidButton';

function Home() {
    const [plaidURL, setPlaidURL] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        backendService.getLinkToken().then((response) => {
            setPlaidURL(response.linkToken);
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="min-h-screen w-full bg-[var(--background)] text-[var(--text-primary)]">
            <div className="max-w-6xl mx-auto px-6 text-center pt-20">
                {/* Main Heading */}
                <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-[var(--accent)] to-[var(--text-primary)] bg-clip-text text-transparent">
                    Get a Snapshot of your Portfolio
                </h1>

                {/* Description */}
                <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 leading-relaxed">
                    Discover insights about your investments with our powerful portfolio analysis tool
                </p>

                <FeatureList />

                {/* CTA Button */}
                {plaidURL && <PlaidLinkButton plaidURL={plaidURL} isLoading={isLoading} />}
            </div>
        </div>
    )
}

const features = [
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
]

function FeatureList() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
            {features.map((feature) => (
                <FeatureListItem key={feature.title} feature={feature} />
            ))}
        </div>
    )
}

function FeatureListItem({ feature }: { feature: { title: string, description: string } }) {
    return (
        <div className="bg-[var(--background-surface)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3 justify-center">
                <CheckIcon className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-bold text-[var(--text-primary)] text-xl">
                    {feature.title}
                </h3>
            </div>
            <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                {feature.description}
            </p>
        </div>
    )
}

export default Home;
