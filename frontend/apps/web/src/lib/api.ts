import { PUBLIC_API_URL } from '$app/env/public';
import { createApiClient } from '@mergetip/api-client';

export const api = createApiClient(PUBLIC_API_URL);
