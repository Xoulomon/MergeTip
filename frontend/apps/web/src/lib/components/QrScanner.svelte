<script lang="ts" module>
	// The Shape Detection API is not in TypeScript's DOM types yet.
	interface DetectedBarcode {
		rawValue: string;
	}
	interface BarcodeDetector {
		detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>;
	}
	type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetector;

	function detectorClass(): BarcodeDetectorConstructor | null {
		return (globalThis as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector ?? null;
	}

	/** True where the browser can read QR codes from the camera. */
	export function canScan(): boolean {
		return detectorClass() !== null && !!navigator.mediaDevices?.getUserMedia;
	}
</script>

<script lang="ts">
	import { Alert, Button, Dialog } from '@mergetip/ui';

	let {
		label,
		accept,
		onscan
	}: {
		label: string;
		/** Only values this returns true for are taken; others keep the scanner open. */
		accept: (value: string) => boolean;
		onscan: (value: string) => void;
	} = $props();

	let open = $state(false);
	let error = $state<string | null>(null);
	let video: HTMLVideoElement | undefined = $state();

	$effect(() => {
		const Detector = detectorClass();
		if (!open || !video || !Detector) return;
		const detector = new Detector({ formats: ['qr_code'] });
		let stream: MediaStream | null = null;
		let timer: ReturnType<typeof setInterval> | undefined;
		let stopped = false;
		const element = video;

		navigator.mediaDevices
			.getUserMedia({ video: { facingMode: 'environment' } })
			.then(async (media) => {
				if (stopped) return media.getTracks().forEach((track) => track.stop());
				stream = media;
				element.srcObject = media;
				await element.play();
				timer = setInterval(async () => {
					const codes = await detector.detect(element).catch(() => []);
					const match = codes.find((code) => accept(code.rawValue));
					if (match) {
						onscan(match.rawValue);
						open = false;
					}
				}, 250);
			})
			.catch(() => (error = 'Camera access was blocked. Paste the connection string instead.'));

		return () => {
			stopped = true;
			clearInterval(timer);
			stream?.getTracks().forEach((track) => track.stop());
		};
	});
</script>

{#if canScan()}
	<Button onclick={() => ((error = null), (open = true))}>Scan QR code</Button>
	<Dialog bind:open title={label} description="Hold the QR code from your wallet up to the camera.">
		{#if error}
			<Alert>{error}</Alert>
		{:else}
			<video bind:this={video} class="aspect-square w-full rounded-md bg-inset" muted playsinline
			></video>
		{/if}
		{#snippet footer()}
			<Button onclick={() => (open = false)}>Cancel</Button>
		{/snippet}
	</Dialog>
{/if}
