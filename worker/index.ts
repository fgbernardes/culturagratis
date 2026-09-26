/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { isCanonicalPrelaunchHost, isPrelaunchMode, isPrelaunchRequestAllowed, isPublicPreviewHost } from "./prelaunch";

interface Env {
  ASSETS: Fetcher;
  CGL_ADMIN_EMAILS?: string;
  CGL_PRELAUNCH_MODE?: string;
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_EXPECTED_HOSTNAME?: string;
  BREVO_API_KEY?: string;
  BREVO_DOI_TEMPLATE_ID?: string;
  BREVO_CONTACT_LIST_ID?: string;
  BREVO_DOI_REDIRECT_URL?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const previewHost = isPublicPreviewHost(url.hostname);
    const effectiveEnv: Env = isCanonicalPrelaunchHost(url.hostname)
      ? { ...env, CGL_PRELAUNCH_MODE: "true" }
      : env;
    const runtime = globalThis as typeof globalThis & { __CGL_ENV?: Env };
    runtime.__CGL_ENV = effectiveEnv;
    // The mode passed to rendering must be request scoped. Never read it back from this global.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-cgl-prelaunch-mode", effectiveEnv.CGL_PRELAUNCH_MODE === "false" ? "false" : "true");
    requestHeaders.set("x-cgl-preview-host", previewHost ? "true" : "false");
    const routedRequest = new Request(request, { headers: requestHeaders });

    if (isPrelaunchMode(effectiveEnv) && !isPrelaunchRequestAllowed(request.method, url.pathname)) {
      return new Response("Not found", {
        status: 404,
        headers: { "cache-control": "no-store", "content-type": "text/plain; charset=utf-8" },
      });
    }

    if (previewHost && url.pathname === "/sitemap.xml") {
      return new Response("Not found", { status: 404, headers: { "x-robots-tag": "noindex, nofollow", "cache-control": "no-store" } });
    }
    if (previewHost && url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nDisallow: /\n", { headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex, nofollow", "cache-control": "no-store" } });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(routedRequest, env, ctx);
    if (!previewHost) return response;
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("x-robots-tag", "noindex, nofollow");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: responseHeaders });
  },
};

export default worker;
