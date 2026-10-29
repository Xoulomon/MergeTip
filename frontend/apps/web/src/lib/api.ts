import { PUBLIC_API_URL } from '$app/env/public';
import { MergeTipApi } from '@mergetip/api-client';

/** The API, authenticated by the HttpOnly `mt_session` cookie. */
export const api = new MergeTipApi({ baseUrl: PUBLIC_API_URL });
