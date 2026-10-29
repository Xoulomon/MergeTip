<script lang="ts">
	import { onMount } from 'svelte';

	let {
		showGrid = true,
		interactive = true,
		intensity = 'medium'
	}: {
		showGrid?: boolean;
		interactive?: boolean;
		intensity?: 'subtle' | 'medium' | 'high';
	} = $props();

	let mouseX = $state(50);
	let mouseY = $state(30);
	let targetX = 50;
	let targetY = 30;
	let animFrame: number;

	onMount(() => {
		if (!interactive) return;

		// Check reduced motion
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		if (mediaQuery.matches) return;

		const handleMouseMove = (e: MouseEvent) => {
			targetX = (e.clientX / window.innerWidth) * 100;
			targetY = (e.clientY / window.innerHeight) * 100;
		};

		// Smooth spring-like lerp loop for the interactive light
		const loop = () => {
			// lerp factor 0.05 for fluid, organic drift
			mouseX += (targetX - mouseX) * 0.05;
			mouseY += (targetY - mouseY) * 0.05;
			animFrame = requestAnimationFrame(loop);
		};

		window.addEventListener('pointermove', handleMouseMove, { passive: true });
		animFrame = requestAnimationFrame(loop);

		return () => {
			window.removeEventListener('pointermove', handleMouseMove);
			cancelAnimationFrame(animFrame);
		};
	});
</script>

<div class="mt-bg-motion-container mt-intensity-{intensity}" aria-hidden="true">
	<!-- Aurora Orbs Field -->
	<div class="mt-aurora-canvas">
		<!-- Golden Bitcoin / Sats Energy Orb -->
		<div class="mt-orb mt-orb-gold"></div>

		<!-- Emerald GitHub / Action Orb -->
		<div class="mt-orb mt-orb-emerald"></div>

		<!-- Cyan Lightning / Protocol Orb -->
		<div class="mt-orb mt-orb-cyan"></div>

		<!-- Nostr Violet Orb -->
		<div class="mt-orb mt-orb-violet"></div>

		<!-- Interactive pointer follower orb -->
		{#if interactive}
			<div class="mt-pointer-orb" style="left: {mouseX}%; top: {mouseY}%;"></div>
		{/if}
	</div>

	<!-- Delicate Tech Grid Pattern with Vignette -->
	{#if showGrid}
		<div class="mt-grid-overlay"></div>
	{/if}

	<!-- Ambient Sats Sparks / Constellation Dust -->
	<div class="mt-sparks-cluster">
		<span class="mt-spark s-1"></span>
		<span class="mt-spark s-2"></span>
		<span class="mt-spark s-3"></span>
		<span class="mt-spark s-4"></span>
		<span class="mt-spark s-5"></span>
		<span class="mt-spark s-6"></span>
		<span class="mt-spark s-7"></span>
		<span class="mt-spark s-8"></span>
	</div>

	<!-- Subtle Noise / Texture Overlay for anti-banding -->
	<div class="mt-noise-sheen"></div>
</div>

<style>
	.mt-bg-motion-container {
		position: fixed;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: 0;
		user-select: none;
		contain: strict;
	}

	.mt-aurora-canvas {
		position: absolute;
		inset: -20%;
		width: 140%;
		height: 140%;
		filter: blur(100px);
		opacity: 0.7;
		transform: translateZ(0);
		will-change: transform;
	}

	:global([data-theme='light']) .mt-aurora-canvas {
		filter: blur(120px);
		opacity: 0.45;
	}

	/* Intensity variants */
	.mt-intensity-subtle .mt-aurora-canvas {
		opacity: 0.4;
	}
	:global([data-theme='light']) .mt-intensity-subtle .mt-aurora-canvas {
		opacity: 0.25;
	}

	.mt-intensity-high .mt-aurora-canvas {
		opacity: 0.85;
	}

	/* Floating Orbs with out-of-phase GPU transforms */
	.mt-orb {
		position: absolute;
		border-radius: 50%;
		transform-origin: center center;
		will-change: transform;
	}

	/* Bitcoin Gold Orb */
	.mt-orb-gold {
		width: 650px;
		height: 650px;
		left: 15%;
		top: 10%;
		background: radial-gradient(
			circle,
			rgba(227, 179, 65, 0.45) 0%,
			rgba(212, 167, 44, 0.18) 50%,
			transparent 75%
		);
		animation: drift-gold 28s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
	}

	/* Emerald GitHub Orb */
	.mt-orb-emerald {
		width: 580px;
		height: 580px;
		right: 15%;
		top: 25%;
		background: radial-gradient(
			circle,
			rgba(35, 134, 54, 0.35) 0%,
			rgba(46, 160, 67, 0.12) 55%,
			transparent 75%
		);
		animation: drift-emerald 34s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
	}

	/* Cyan Lightning Orb */
	.mt-orb-cyan {
		width: 520px;
		height: 520px;
		left: 35%;
		bottom: 15%;
		background: radial-gradient(
			circle,
			rgba(56, 139, 253, 0.3) 0%,
			rgba(9, 105, 218, 0.1) 50%,
			transparent 70%
		);
		animation: drift-cyan 38s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
	}

	/* Nostr Purple Orb */
	.mt-orb-violet {
		width: 480px;
		height: 480px;
		right: 30%;
		bottom: 20%;
		background: radial-gradient(
			circle,
			rgba(163, 113, 247, 0.25) 0%,
			rgba(130, 80, 223, 0.08) 50%,
			transparent 70%
		);
		animation: drift-violet 32s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
	}

	/* Interactive Follower Orb */
	.mt-pointer-orb {
		position: absolute;
		width: 400px;
		height: 400px;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgba(240, 195, 84, 0.22) 0%,
			rgba(88, 166, 255, 0.12) 45%,
			transparent 70%
		);
		pointer-events: none;
		transition: opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1);
		will-change: left, top;
	}

	:global([data-theme='light']) .mt-pointer-orb {
		background: radial-gradient(
			circle,
			rgba(212, 167, 44, 0.18) 0%,
			rgba(9, 105, 218, 0.08) 45%,
			transparent 70%
		);
	}

	/* Keyframe Animations for organic drift */
	@keyframes drift-gold {
		0% {
			transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
		}
		50% {
			transform: translate3d(80px, -60px, 0) scale(1.12) rotate(15deg);
		}
		100% {
			transform: translate3d(-60px, 70px, 0) scale(0.92) rotate(-10deg);
		}
	}

	@keyframes drift-emerald {
		0% {
			transform: translate3d(0, 0, 0) scale(1);
		}
		50% {
			transform: translate3d(-90px, 80px, 0) scale(1.15);
		}
		100% {
			transform: translate3d(70px, -50px, 0) scale(0.95);
		}
	}

	@keyframes drift-cyan {
		0% {
			transform: translate3d(0, 0, 0) scale(0.96);
		}
		50% {
			transform: translate3d(70px, -70px, 0) scale(1.1);
		}
		100% {
			transform: translate3d(-80px, 40px, 0) scale(1.04);
		}
	}

	@keyframes drift-violet {
		0% {
			transform: translate3d(0, 0, 0) scale(1.05);
		}
		50% {
			transform: translate3d(-60px, -80px, 0) scale(0.9);
		}
		100% {
			transform: translate3d(50px, 60px, 0) scale(1.12);
		}
	}

	/* Delicate Tech Dot Matrix with Vignette */
	.mt-grid-overlay {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
		background-size: 32px 32px;
		mask-image: radial-gradient(
			ellipse at center,
			rgba(0, 0, 0, 0.85) 0%,
			rgba(0, 0, 0, 0.25) 70%,
			transparent 100%
		);
		-webkit-mask-image: radial-gradient(
			ellipse at center,
			rgba(0, 0, 0, 0.85) 0%,
			rgba(0, 0, 0, 0.25) 70%,
			transparent 100%
		);
		opacity: 0.85;
	}

	:global([data-theme='light']) .mt-grid-overlay {
		background-image: radial-gradient(rgba(31, 35, 40, 0.08) 1px, transparent 1px);
		opacity: 0.6;
	}

	/* Glowing Sats Sparks Cluster */
	.mt-sparks-cluster {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	.mt-spark {
		position: absolute;
		border-radius: 50%;
		background: #f0c354;
		box-shadow:
			0 0 10px rgba(240, 195, 84, 0.8),
			0 0 20px rgba(227, 179, 65, 0.4);
		will-change: transform, opacity;
	}

	:global([data-theme='light']) .mt-spark {
		background: #d4a72c;
		box-shadow: 0 0 8px rgba(212, 167, 44, 0.6);
	}

	.s-1 {
		width: 3px;
		height: 3px;
		left: 18%;
		top: 22%;
		animation: spark-float 14s infinite ease-in-out;
	}
	.s-2 {
		width: 4px;
		height: 4px;
		left: 32%;
		top: 68%;
		animation: spark-float 19s infinite ease-in-out 2s;
	}
	.s-3 {
		width: 2px;
		height: 2px;
		left: 45%;
		top: 35%;
		animation: spark-float 16s infinite ease-in-out 4s;
	}
	.s-4 {
		width: 4px;
		height: 4px;
		left: 62%;
		top: 18%;
		animation: spark-float 22s infinite ease-in-out 1s;
	}
	.s-5 {
		width: 3px;
		height: 3px;
		left: 78%;
		top: 48%;
		animation: spark-float 18s infinite ease-in-out 5s;
	}
	.s-6 {
		width: 2px;
		height: 2px;
		left: 88%;
		top: 75%;
		animation: spark-float 15s infinite ease-in-out 3s;
	}
	.s-7 {
		width: 3px;
		height: 3px;
		left: 12%;
		top: 82%;
		animation: spark-float 20s infinite ease-in-out 6s;
	}
	.s-8 {
		width: 2px;
		height: 2px;
		left: 52%;
		top: 86%;
		animation: spark-float 17s infinite ease-in-out 2.5s;
	}

	@keyframes spark-float {
		0%,
		100% {
			transform: translate3d(0, 0, 0) scale(0.9);
			opacity: 0.2;
		}
		50% {
			transform: translate3d(24px, -36px, 0) scale(1.4);
			opacity: 0.85;
		}
	}

	/* Anti-banding grain overlay */
	.mt-noise-sheen {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 50% 0%, transparent 60%, rgba(13, 17, 23, 0.4) 100%);
		opacity: 0.5;
	}

	:global([data-theme='light']) .mt-noise-sheen {
		background: radial-gradient(circle at 50% 0%, transparent 60%, rgba(246, 248, 250, 0.5) 100%);
		opacity: 0.3;
	}

	/* Reduced motion accessibility */
	@media (prefers-reduced-motion: reduce) {
		.mt-orb,
		.mt-spark {
			animation: none !important;
		}
		.mt-aurora-canvas {
			opacity: 0.35;
		}
		.mt-pointer-orb {
			display: none;
		}
	}
</style>
