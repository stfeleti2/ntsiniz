"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeBroker = void 0;
const routeManager_1 = require("./routeManager");
class RouteBroker {
    state = { route: null, lastChangedAtMs: null };
    listeners = new Set();
    sub = null;
    started = false;
    async start() {
        if (!this.started) {
            this.started = true;
            // Prime with current route.
            try {
                const r = await (0, routeManager_1.getCurrentRoute)();
                this.state = { route: r, lastChangedAtMs: Date.now() };
                this.emit();
            }
            catch {
                // ignore: route module may be unavailable on web/simulator; callers handle null.
            }
        }
        if (!this.sub) {
            this.sub = routeManager_1.audioRouteEmitter.addListener('routeChanged', (payload) => {
                this.state = { route: payload, lastChangedAtMs: Date.now() };
                this.emit();
            });
        }
    }
    stop() {
        this.sub?.remove?.();
        this.sub = null;
        // Keep `started` true after first prime so we don't regress to stale state
        // and accidentally miss priming on the next subscribe.
    }
    getState() {
        return this.state;
    }
    subscribe(fn) {
        this.listeners.add(fn);
        fn(this.state);
        // If we haven't primed and we have no route, best-effort start in the background.
        if (!this.started && !this.state.route) {
            void this.start();
        }
        return () => this.listeners.delete(fn);
    }
    emit() {
        for (const fn of this.listeners)
            fn(this.state);
    }
}
exports.routeBroker = new RouteBroker();
