export interface UpiConfig {
  upiId: string;
  payeeName: string;
  defaultNote: string;
}

export interface PresetAmount {
  id: string;
  amount: number;
  label: string;
  description: string;
  iconName: string;
  isPopular?: boolean;
}

// CENTRAL LOCKED DONATION RECIPIENT
export const LOCKED_UPI_ID = 'mahesh.2008here@okicici';
export const LOCKED_PAYEE_NAME = 'Farm Weather Developer';
export const DEFAULT_NOTE = 'Support Farm Weather';

export const DEFAULT_UPI_CONFIG: UpiConfig = {
  upiId: LOCKED_UPI_ID,
  payeeName: LOCKED_PAYEE_NAME,
  defaultNote: DEFAULT_NOTE,
};

export function getUpiConfig(): UpiConfig {
  return DEFAULT_UPI_CONFIG;
}

export const DONATION_PRESETS: PresetAmount[] = [
  {
    id: 'coffee',
    amount: 50,
    label: '₹50',
    description: 'Buy 1 Hot Coffee for Dev',
    iconName: 'Coffee',
  },
  {
    id: 'seed',
    amount: 100,
    label: '₹100',
    description: 'Seed Pack & Test Kit',
    iconName: 'Sprout',
  },
  {
    id: 'fertilizer',
    amount: 250,
    label: '₹250',
    description: 'Irrigation & Telemetry Support',
    iconName: 'Droplets',
    isPopular: true,
  },
  {
    id: 'station',
    amount: 500,
    label: '₹500',
    description: 'Weather Station Server Boost',
    iconName: 'CloudSun',
  },
  {
    id: 'hero',
    amount: 1000,
    label: '₹1,000',
    description: 'Farm Weather Hero Sponsor',
    iconName: 'Sparkles',
  },
];

/**
 * Construct properly encoded UPI Payment URI using the central locked recipient
 */
export function buildUpiUrl(amount: number | string = '', note: string = DEFAULT_NOTE): string {
  const pa = LOCKED_UPI_ID;
  const pn = encodeURIComponent(LOCKED_PAYEE_NAME);
  const cu = 'INR';
  const cleanNote = encodeURIComponent((note || DEFAULT_NOTE).trim());
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const am = numAmount > 0 ? numAmount.toFixed(2) : '';

  let upiString = `upi://pay?pa=${pa}&pn=${pn}&cu=${cu}&tn=${cleanNote}`;
  if (am) {
    upiString += `&am=${am}`;
  }

  return upiString;
}

export function getUpiQrCodeUrl(upiUrl: string, size: number = 280): string {
  const encodedUpiUrl = encodeURIComponent(upiUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUpiUrl}&margin=10&color=171717&bgcolor=FFFFFF`;
}

export interface UpiAppOption {
  id: string;
  name: string;
  packageName?: string;
  iconBg: string;
  textColor: string;
  getAppIntentUrl: (amount: number | string, note?: string) => string;
  getSchemeUrl: (amount: number | string, note?: string) => string;
}

export const UPI_APP_OPTIONS: UpiAppOption[] = [
  {
    id: 'gpay',
    name: 'Google Pay',
    packageName: 'com.google.android.apps.nbu.paisa.user',
    iconBg: '#4285F4',
    textColor: '#FFFFFF',
    getAppIntentUrl: (amount, note) => {
      const rawUrl = buildUpiUrl(amount, note);
      return rawUrl.replace(/^upi:\/\//i, 'intent://') + `#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
    },
    getSchemeUrl: (amount, note) => buildUpiUrl(amount, note).replace(/^upi:\/\//i, 'gpay://'),
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    packageName: 'com.phonepe.app',
    iconBg: '#5F259F',
    textColor: '#FFFFFF',
    getAppIntentUrl: (amount, note) => {
      const rawUrl = buildUpiUrl(amount, note);
      return rawUrl.replace(/^upi:\/\//i, 'intent://') + `#Intent;scheme=upi;package=com.phonepe.app;end`;
    },
    getSchemeUrl: (amount, note) => buildUpiUrl(amount, note).replace(/^upi:\/\//i, 'phonepe://'),
  },
  {
    id: 'paytm',
    name: 'Paytm',
    packageName: 'net.one97.paytm',
    iconBg: '#00BAF2',
    textColor: '#FFFFFF',
    getAppIntentUrl: (amount, note) => {
      const rawUrl = buildUpiUrl(amount, note);
      return rawUrl.replace(/^upi:\/\//i, 'intent://') + `#Intent;scheme=upi;package=net.one97.paytm;end`;
    },
    getSchemeUrl: (amount, note) => buildUpiUrl(amount, note).replace(/^upi:\/\//i, 'paytm://'),
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    packageName: 'in.org.npci.upiapp',
    iconBg: '#004792',
    textColor: '#FFFFFF',
    getAppIntentUrl: (amount, note) => {
      const rawUrl = buildUpiUrl(amount, note);
      return rawUrl.replace(/^upi:\/\//i, 'intent://') + `#Intent;scheme=upi;package=in.org.npci.upiapp;end`;
    },
    getSchemeUrl: (amount, note) => buildUpiUrl(amount, note),
  },
  {
    id: 'any_upi',
    name: 'Pay with Any UPI App',
    iconBg: '#10B981',
    textColor: '#FFFFFF',
    getAppIntentUrl: (amount, note) => buildUpiUrl(amount, note),
    getSchemeUrl: (amount, note) => buildUpiUrl(amount, note),
  },
];

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (err) {
    console.error('Copy failed', err);
    return false;
  }
}
