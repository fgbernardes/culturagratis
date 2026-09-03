export function disposeTurnstileWidget(turnstile, widgetId) {
  if (widgetId) turnstile?.remove(widgetId);
}
