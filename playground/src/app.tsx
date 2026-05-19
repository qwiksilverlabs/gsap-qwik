import { $, component$, useSignal } from '@builder.io/qwik';
import gsap from 'gsap';
import { useGSAP } from 'gsap-qwik';

gsap.registerPlugin(useGSAP);

export const App = component$(() => {
	const containerRef = useSignal<HTMLElement>();
	const boxRef = useSignal<HTMLElement>();

	const { contextSafe } = useGSAP(
		$(() => {
			gsap.to(boxRef.value!, {
				rotation: 360,
				scale: 1.2,
				duration: 2,
				repeat: -1,
				yoyo: true,
				ease: 'power1.inOut',
			});
		}),
		{ scope: containerRef },
	);

	const onBoxClick$ = $(() => {
		contextSafe.value?.(() => {
			gsap.to(boxRef.value!, {
				scale: 5,
				duration: 0.3,
				yoyo: true,
				repeat: 1,
				ease: 'power2.out',
			});
		})?.();
	});

	return (
		<div
			ref={containerRef}
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
			}}>
			<div
				ref={boxRef}
				onClick$={onBoxClick$}
				style={{
					width: '100px',
					height: '100px',
					background: 'hsl(171, 100%, 48%)',
					borderRadius: '12px',
					cursor: 'pointer',
				}}
			/>
		</div>
	);
});
