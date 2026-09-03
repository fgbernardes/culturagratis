import assert from "node:assert/strict";
import test from "node:test";

import { disposeTurnstileWidget } from "../app/components/turnstile-lifecycle.mjs";

test("disposes the rendered Turnstile widget when the form unmounts", () => {
  const removedWidgetIds = [];
  const turnstile = {
    remove(widgetId) {
      removedWidgetIds.push(widgetId);
    },
  };

  disposeTurnstileWidget(turnstile, "widget-123");

  assert.deepEqual(removedWidgetIds, ["widget-123"]);
});
