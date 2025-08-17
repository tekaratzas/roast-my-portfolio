import axios from 'axios';
import type { LinkResponse, InvestmentsResponse } from '../../shared/Types';

const backendBaseUrl = '/api';

interface BackendService {
    getLinkToken: () => Promise<LinkResponse>;

    getInvestments: () => Promise<InvestmentsResponse>;
}

export const backendService: BackendService = {
    getLinkToken: async () => {
        const response = await axios.get<LinkResponse>(`${backendBaseUrl}/plaid_oauth_link`);
        return response.data;
    },
    getInvestments: async () => {
        const response = await axios.get<InvestmentsResponse>(`${backendBaseUrl}/investments`);
        return response.data;
    }
};