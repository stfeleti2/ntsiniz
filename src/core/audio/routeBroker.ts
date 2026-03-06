import { audioRouteEmitter, getCurrentRoute, type RouteInfo } from './routeManager';

export type RouteBrokerState = {
  route: RouteInfo | null;
  lastChangedAtMs: number | null;
};

type Listener = (s: RouteBrokerState) => void;

class RouteBroker {
  private state: RouteBrokerState = { route: null, lastChangedAtMs: null };
  private listeners = new Set<Listener>();
  private sub: any | null = null;
  private started = false;

  async start(): Promise<void> {
    if (!this.started) {
      this.started = true;
      // Prime with current route.
      try {
        const r = await getCurrentRoute();
        this.state = { route: r, lastChangedAtMs: Date.now() };
        this.emit();
      } catch {
        // ignore: route module may be unavailable on web/simulator; callers handle null.
      }
    }

    if (!this.sub) {
      this.sub = (audioRouteEmitter as any).addListener('routeChanged', (payload: any) => {
        this.state = { route: payload as RouteInfo, lastChangedAtMs: Date.now() };
        this.emit();
      });
    }
  }

  stop(): void {
    this.sub?.remove?.();
    this.sub = null;
    // Keep `started` true after first prime so we don't regress to stale state
    // and accidentally miss priming on the next subscribe.
  }

  getState(): RouteBrokerState {
    return this.state;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.state);
    // If we haven't primed and we have no route, best-effort start in the background.
    if (!this.started && !this.state.route) {
      void this.start();
    }
    return () => this.listeners.delete(fn);
  }

  private emit() {
    for (const fn of this.listeners) fn(this.state);
  }
}

export const routeBroker = new RouteBroker();
