import { useGSAP } from '@/index';
import { $, useSignal } from '@builder.io/qwik';
import { afterEach, expect, test, vi } from 'vite-plus/test';
import gsap from 'gsap';
import { renderHook } from 'vitest-browser-qwik';

afterEach(() => {
	vi.restoreAllMocks();
});

test('should create context and contextSafe', async () => {
	const gsapContextSpy = vi.spyOn(gsap, 'context');

	const { result } = await renderHook(() => useGSAP($(() => {})));

	await vi.waitFor(() => expect(gsapContextSpy).toHaveBeenCalled());

	expect(result.context.value).toBeDefined();
	expect(typeof result.contextSafe.value).toBe('function');
});

test('should invoke the callback', async () => {
	const toSpy = vi.spyOn(gsap, 'to');

	await renderHook(() =>
		useGSAP(
			$(() => {
				gsap.to('.box', { x: 100 });
			}),
		),
	);

	await vi.waitFor(() =>
		expect(toSpy).toHaveBeenCalledWith('.box', expect.objectContaining({ x: 100 })),
	);
});

test('should pass scope element to gsap.context', async () => {
	const gsapContextSpy = vi.spyOn(gsap, 'context');
	const scopeElement = document.createElement('div');

	await renderHook(() => {
		const scopeSignal = useSignal<HTMLElement>(scopeElement);
		return useGSAP(
			$(() => {}),
			{ scope: scopeSignal },
		);
	});

	await vi.waitFor(() =>
		expect(gsapContextSpy).toHaveBeenCalledWith(expect.any(Function), scopeElement),
	);
});

test('should wrap functions with contextSafe', async () => {
	const { result } = await renderHook(() => useGSAP($(() => {})));

	await vi.waitFor(() => expect(result.contextSafe.value).toBeDefined());

	const fn = vi.fn();
	const wrapped = result.contextSafe.value!(fn);

	expect(typeof wrapped).toBe('function');
});

test('should recreate context when scope changes', async () => {
	const el1 = document.createElement('div');
	const el2 = document.createElement('div');

	const { result } = await renderHook(() => {
		const scopeSignal = useSignal<HTMLElement>(el1);
		return {
			...useGSAP(
				$(() => {}),
				{ scope: scopeSignal },
			),
			scopeSignal,
		};
	});

	await vi.waitFor(() => expect(result.context.value).toBeDefined());
	const firstContext = result.context.value!;

	result.scopeSignal.value = el2;

	await vi.waitFor(() => expect(result.context.value).not.toBe(firstContext));
});

test('should add to existing context on dep change when deferCleanup is true', async () => {
	const gsapContextSpy = vi.spyOn(gsap, 'context');

	const { result } = await renderHook(() => {
		const dep = useSignal(0);
		return {
			...useGSAP(
				$(() => {}),
				{ dependencies: [() => dep.value] },
			),
			dep,
		};
	});

	await vi.waitFor(() => expect(result.context.value).toBeDefined());
	expect(gsapContextSpy).toHaveBeenCalledTimes(1);

	const addSpy = vi.spyOn(result.context.value!, 'add');

	result.dep.value = 1;

	await vi.waitFor(() => expect(addSpy).toHaveBeenCalled());
	expect(gsapContextSpy).toHaveBeenCalledTimes(1);
});

test('should revert old context and create a new one on dep change when revertOnUpdate is true', async () => {
	const gsapContextSpy = vi.spyOn(gsap, 'context');

	const { result } = await renderHook(() => {
		const dep = useSignal(0);
		return {
			...useGSAP(
				$(() => {}),
				{ dependencies: [() => dep.value], revertOnUpdate: true },
			),
			dep,
		};
	});

	await vi.waitFor(() => expect(result.context.value).toBeDefined());
	expect(gsapContextSpy).toHaveBeenCalledTimes(1);

	const firstContext = result.context.value!;
	const revertSpy = vi.spyOn(firstContext, 'revert');

	result.dep.value = 1;

	await vi.waitFor(() => expect(revertSpy).toHaveBeenCalled());
	expect(gsapContextSpy).toHaveBeenCalledTimes(2);
});

test('should revert old context when scope changes', async () => {
	const el1 = document.createElement('div');
	const el2 = document.createElement('div');

	const { result } = await renderHook(() => {
		const scopeSignal = useSignal<HTMLElement>(el1);
		return {
			...useGSAP(
				$(() => {}),
				{ scope: scopeSignal },
			),
			scopeSignal,
		};
	});

	await vi.waitFor(() => expect(result.context.value).toBeDefined());
	const firstContext = result.context.value!;
	const revertSpy = vi.spyOn(firstContext, 'revert');

	result.scopeSignal.value = el2;

	await vi.waitFor(() => expect(revertSpy).toHaveBeenCalled());
});

test('should not revert context when dependency changes and deferCleanup is true', async () => {
	const { result } = await renderHook(() => {
		const dep = useSignal(0);
		return {
			...useGSAP(
				$(() => {}),
				{ dependencies: [() => dep.value] },
			),
			dep,
		};
	});

	await vi.waitFor(() => expect(result.context.value).toBeDefined());

	const revertSpy = vi.spyOn(result.context.value!, 'revert');
	const addSpy = vi.spyOn(result.context.value!, 'add');

	result.dep.value = 1;

	await vi.waitFor(() => expect(addSpy).toHaveBeenCalled());

	expect(revertSpy).not.toHaveBeenCalled();
});
