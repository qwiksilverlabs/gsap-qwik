# GSAP Qwik

A Qwik hook for using [GSAP](https://gsap.com) — the same ergonomics as [`@gsap/react`](https://npmx.dev/package/@gsap/react), adapted for Qwik's resumability model.

## Installation

> [!WARNING]
> This package does not include GSAP itself, so you need to install [gsap](https://npmx.dev/package/gsap) separately and supply it via `gsap.registerPlugin(useGSAP)`.

```bash
pnpm add gsap-qwik gsap
```

## Usage

Before using the hook, you need to register it as a plugin with GSAP:

```tsx
import gsap from 'gsap';
import { useGSAP } from 'gsap-qwik';

gsap.registerPlugin(useGSAP);
```

## Example

```tsx
import { $, component$, useSignal } from '@builder.io/qwik';
import gsap from 'gsap';
import { useGSAP } from 'gsap-qwik';

gsap.registerPlugin(useGSAP);

export const App = component$(() => {
  const boxRef = useSignal<HTMLElement>();

  useGSAP(
    $(() => {
      gsap.to(boxRef.value!, {
        x: 300,
        rotation: 360,
        duration: 2,
        repeat: -1,
        yoyo: true,
      });
    }),
  );

  return (
    <div style={{ padding: '50px', overflow: 'hidden' }}>
      <div
        ref={boxRef}
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: '#88ce02',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
        }}>
        GSAP Box
      </div>
    </div>
  );
});
```

## API

### `useGSAP$(callback, config?)`

The `$`-suffixed convenience form. Automatically wraps the callback in a QRL — use this in components.

```ts
useGSAP$(() => void, config?: UseGSAPConfig): UseGSAPReturn
```

### `useGSAP(callback, config?)`

Raw form that accepts an explicit `QRL`. Use when you need to pass a pre-created `$()` reference.

```ts
useGSAP(callback: QRL<() => void>, config?: UseGSAPConfig): UseGSAPReturn
```

---

### `UseGSAPConfig`

| Property         | Type                               | Default | Description                                                                                             |
| ---------------- | ---------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `scope`          | `Signal<HTMLElement \| undefined>` | —       | Element used as the GSAP context scope.                                                                 |
| `revertOnUpdate` | `boolean`                          | `false` | When `true`, reverts and recreates the context on every dependency change instead of deferring cleanup. |
| `dependencies`   | `(() => void)[]`                   | `[]`    | Tracked signals/values that re-trigger the callback when they change.                                   |

### `UseGSAPReturn`

| Property      | Type                                       | Description                                                                  |
| ------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| `context`     | `Signal<gsap.Context \| undefined>`        | The underlying GSAP context. `undefined` during SSR.                         |
| `contextSafe` | `Signal<ContextSafeFunction \| undefined>` | Wraps a function so it runs inside the GSAP context. `undefined` during SSR. |

### `ContextSafeFunction`

```ts
type ContextSafeFunction = <T extends (...args: any[]) => any>(fn: T) => T;
```

Wraps an event handler or async callback so GSAP can track and revert it with the context.

## License

Released under the [MIT](./LICENSE) license.
