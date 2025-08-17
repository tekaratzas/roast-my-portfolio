import axios from 'axios';
import type { LinkResponse } from '../../shared/Types';

const backendBaseUrl = '/api';

interface BackendService {
    getLinkToken: () => Promise<LinkResponse>;
}

export const backendService: BackendService = {
    getLinkToken: async () => {
        const response = await axios.get<LinkResponse>(`${backendBaseUrl}/plaid_oauth_link`);
        return response.data;
    }
};