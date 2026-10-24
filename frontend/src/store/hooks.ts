import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, RootState } from "./store";

/**
 * Typed `useDispatch` / `useSelector` / `useStore`. Use these instead of the
 * bare react-redux hooks so state and thunk types come through without an
 * annotation at each call.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

/**
 * The store itself, for reading state without subscribing to it.
 *
 * Reach for this when a value is only needed at the moment an event fires — a
 * whole canvas read when Save is pressed, say. `useAppSelector` would
 * re-render the component on every change to that state, which during a node
 * drag means once per frame.
 */
export const useAppStore = useStore.withTypes<ReturnType<typeof useStore<RootState>>>();
