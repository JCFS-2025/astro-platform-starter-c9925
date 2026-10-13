/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface Env {
    AXIA_KV?: KVNamespace;
    ADMIN_PASSWORD?: string;
    SESSION_SECRET?: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
    interface Locals extends Runtime {
        settings: import('./lib/settings').Settings;
        admin: boolean;
    }
}
