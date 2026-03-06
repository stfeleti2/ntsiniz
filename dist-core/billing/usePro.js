"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePro = usePro;
const react_1 = require("react");
const entitlementsRepo_1 = require("./entitlementsRepo");
const revenuecat_1 = require("./revenuecat");
function computeIsPro(e) {
    if (e.proUntilMs && Date.now() > e.proUntilMs)
        return false;
    return !!e.pro;
}
function usePro() {
    const [e, setE] = (0, react_1.useState)({ pro: false, proUntilMs: null, source: 'local', syncedAtMs: null });
    const [refreshing, setRefreshing] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        let mounted = true;
        (0, entitlementsRepo_1.getEntitlements)()
            .then((x) => mounted && setE(x))
            .catch(() => { });
        const unsub = (0, entitlementsRepo_1.subscribeEntitlements)((x) => mounted && setE(x));
        return () => {
            mounted = false;
            unsub();
        };
    }, []);
    const refresh = async () => {
        if (!(0, revenuecat_1.isRevenueCatConfigured)())
            return;
        setRefreshing(true);
        try {
            // Force a customer-info refresh and let the RevenueCat listener update local entitlements.
            const entitlementId = (0, revenuecat_1.getRevenueCatConfig)().entitlementPro;
            await (0, revenuecat_1.refreshCustomerInfoSafe)(entitlementId);
        }
        finally {
            setRefreshing(false);
        }
    };
    const isPro = (0, react_1.useMemo)(() => computeIsPro(e), [e.pro, e.proUntilMs]);
    return {
        isPro,
        proUntilMs: e.proUntilMs ?? null,
        source: e.source,
        syncedAtMs: e.syncedAtMs ?? null,
        refreshing,
        refresh,
    };
}
