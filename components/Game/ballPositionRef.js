// Shared mutable ref for ball position — written by Ball, read by Spring for particle effects.
// Using a module-level variable avoids React re-renders and zustand persist overhead.
export const ballWorldPosition = [0, 0, 0]
