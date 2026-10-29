// Typed client for the MergeTip API. `schema.d.ts` is generated from openapi/openapi.json
// (run `pnpm gen:api`); never edit it by hand.
export type { components, paths } from './schema';
export * from './bridge';
export * from './client';
export * from './errors';
export * as schemas from './schemas';
export {
	MAX_NOTE_CHARS,
	MAX_TIP_SATS,
	MIN_CONFIRM_THRESHOLD_SATS,
	OTP_LENGTH,
	firstIssue
} from './schemas';
