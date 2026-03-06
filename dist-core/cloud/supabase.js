"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabase = getSupabase;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("./config");
const secureStoreStorage_1 = require("./secureStoreStorage");
let client = null;
function getSupabase() {
    if (!(0, config_1.isCloudConfigured)())
        return null;
    if (client)
        return client;
    const cfg = (0, config_1.getCloudConfig)();
    client = (0, supabase_js_1.createClient)(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: {
            storage: secureStoreStorage_1.secureStoreAdapter,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
        global: {
            // RN fetch
            fetch: (input, init) => fetch(input, init),
        },
    });
    return client;
}
