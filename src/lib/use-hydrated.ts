"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True once the client has mounted; guards persisted-store reads from SSR mismatch. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
