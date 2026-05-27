export const haptics = {
  light:        () => navigator.vibrate?.(10),
  medium:       () => navigator.vibrate?.(25),
  success:      () => navigator.vibrate?.([15, 50, 15]),
  error:        () => navigator.vibrate?.([30, 20, 30, 20, 30]),
  warning:      () => navigator.vibrate?.([20, 40, 20]),
  selection:    () => navigator.vibrate?.(8),
  heavy:        () => navigator.vibrate?.([50, 30, 50]),
  notification: () => navigator.vibrate?.([10, 30, 10, 30, 10]),
};
