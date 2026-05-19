import {
	implicit$FirstArg,
	noSerialize,
	useSignal,
	useVisibleTask$,
	type NoSerialize,
	type QRL,
	type Signal,
} from '@builder.io/qwik';
import gsapDefault from 'gsap';

let gsap: typeof gsapDefault = gsapDefault;

type UseGSAPConfig = {
	scope?: Signal<HTMLElement | undefined>; // The scope is undefined in SSR
	revertOnUpdate?: boolean;
	dependencies?: (() => void)[];
};

type UseGSAPReturn = {
	context: Readonly<Signal<gsap.Context | undefined>>;
	contextSafe: Readonly<Signal<ContextSafeFunction | undefined>>;
};

type ContextSafeFunction = <T extends (...args: any[]) => any>(fn: T) => T;

// This function does not fetch the function from the QRL
function invokeResolvedQrl(qrl: QRL<(...args: any[]) => void>): void {
	const fn = qrl.resolved;

	const captured = qrl.getCaptured() || [];

	if (fn) fn(...captured);
}

export function useGSAP(callback: QRL<() => void>, config: UseGSAPConfig = {}): UseGSAPReturn {
	const { scope, revertOnUpdate, dependencies = [] } = config;

	const mounted = useSignal(false); // this is false on server

	// this is undefined on server, but it will be set to the context on the browser
	const context = useSignal<NoSerialize<gsap.Context>>();
	const contextSafe = useSignal<NoSerialize<ContextSafeFunction>>();

	const deferCleanup = dependencies.length > 0 && !revertOnUpdate;

	// Clean up the GSAP context when the component is unmounted
	// So context.value cannot be null in here
	useVisibleTask$(
		async (ctx) => {
			mounted.value = true;

			ctx.cleanup(() => context.value!.revert());
		},
		{ strategy: 'document-ready' },
	);

	// Clean up the GSAP context when the scope changes or dependencies update
	useVisibleTask$(
		async (ctx) => {
			dependencies.forEach(ctx.track);
			if (scope) ctx.track(scope);

			// fetch code
			if (callback) await callback.resolve();

			const scopeElement = scope?.value;
			const isMounted = mounted.value;

			if (deferCleanup && context.value) {
				context.value.add(() => invokeResolvedQrl(callback), scopeElement);
			} else {
				const ctx = noSerialize(gsap.context(() => {}, scopeElement));

				context.value = ctx;

				const makeContextSafe: ContextSafeFunction = (fn) => {
					// @ts-ignore
					return ctx?.add(null, fn) as typeof fn;
				};

				contextSafe.value = noSerialize(makeContextSafe);

				if (callback && context.value)
					context.value.add(() => invokeResolvedQrl(callback), scopeElement);
			}

			if (!deferCleanup || !isMounted) ctx.cleanup(() => context.value?.revert());
		},
		{ strategy: 'document-ready' },
	);

	return { context, contextSafe };
}

export namespace useGSAP {
	export function register(core: typeof gsapDefault): void {
		gsap = core;
	}
}

export const useGSAP$: (callback: () => void, config?: UseGSAPConfig) => UseGSAPReturn =
	implicit$FirstArg(useGSAP);
