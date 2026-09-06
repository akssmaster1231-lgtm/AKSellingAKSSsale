export interface StoreShippingSettings {
  freeShippingEnabled: boolean;
  freeShippingThreshold: number; // 0 = all orders free, or e.g. 499
  standardShippingFee: number; // e.g. 49
  freeShippingLabelText: string; // e.g. "Free Express Delivery"
  standardShippingLabelText: string; // e.g. "Standard Delivery: ₹49"
  estimatedDaysText: string; // e.g. "2-3 Days"
  courierPartnerText: string; // e.g. "BlueDart Express"
}

export const DEFAULT_SHIPPING_SETTINGS: StoreShippingSettings = {
  freeShippingEnabled: true,
  freeShippingThreshold: 0,
  standardShippingFee: 49,
  freeShippingLabelText: 'Free Express Delivery',
  standardShippingLabelText: 'Express Delivery: ₹49',
  estimatedDaysText: 'Delivered in 2-3 Days',
  courierPartnerText: 'BlueDart / Delhivery Air',
};

const STORAGE_KEY = 'ak_store_shipping_settings';

export function getStoreShippingSettings(): StoreShippingSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SHIPPING_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading shipping settings', e);
  }
  return DEFAULT_SHIPPING_SETTINGS;
}

export function saveStoreShippingSettings(settings: StoreShippingSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('ak_shipping_settings_updated', { detail: settings }));
  } catch (e) {
    console.error('Error saving shipping settings', e);
  }
}

export function getProductShippingLabel(price: number, settings: StoreShippingSettings = getStoreShippingSettings()): {
  text: string;
  isFree: boolean;
  charge: number;
} {
  if (settings.freeShippingEnabled) {
    if (settings.freeShippingThreshold === 0 || price >= settings.freeShippingThreshold) {
      return {
        text: settings.freeShippingLabelText || 'Free Express Delivery',
        isFree: true,
        charge: 0,
      };
    }
  }
  return {
    text: settings.standardShippingLabelText || `Delivery: ₹${settings.standardShippingFee}`,
    isFree: false,
    charge: settings.standardShippingFee,
  };
}
