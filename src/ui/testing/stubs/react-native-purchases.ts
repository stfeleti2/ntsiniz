export const LOG_LEVEL = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
}

export const CustomerInfo = class CustomerInfo {}
export const PurchasesOffering = class PurchasesOffering {}

const Purchases = {
  async configure(_options?: any) {},
  async setLogLevel(_level?: string) {},
  async getCustomerInfo() {
    return { entitlements: { active: {} } }
  },
  async getOfferings() {
    return { current: null, all: {} }
  },
  async purchasePackage(_pkg?: any) {
    return { customerInfo: { entitlements: { active: {} } } }
  },
  async restorePurchases() {
    return { entitlements: { active: {} } }
  },
}

export default Purchases