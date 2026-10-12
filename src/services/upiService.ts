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

export const DEFAULT_UPI_CONFIG: UpiConfig = {
  upiId: 'mahesh.2008here@okicici',
  payeeName: 'Mahesh (Farm Weather Developer)',
  defaultNote: 'Support Farm Weather Open Source',
};

const STORAGE_KEY_CUSTOM_UPI_ID = 'farmweather_custom_upi_id';

export function getUpiConfig(): UpiConfig {
  try {
    const savedUpi = localStorage.getItem(STORAGE_KEY_CUSTOM_UPI_ID);
    if (savedUpi && savedUpi.includes('@')) {
      return {
        ...DEFAULT_UPI_CONFIG,
        upiId: savedUpi.trim(),
      };
    }
  } catch {}
  return DEFAULT_UPI_CONFIG;
}

export function setCustomUpiId(upiId: string): void {
  try {
    if (upiId && upiId.includes('@')) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_UPI_ID, upiId.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_UPI_ID);
    }
  } catch {}
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

export function buildUpiUrl(upiId: string, payeeName: string, amount: number | string, note: string): string {
  const cleanUpi = upiId.trim();
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(note.trim() || 'Farm Weather Support');
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  // Format amount to 2 decimal places if present
  const formattedAmount = numAmount > 0 ? numAmount.toFixed(2) : '';

  let upiString = `upi://pay?pa=${cleanUpi}&pn=${cleanName}&cu=INR&tn=${cleanNote}`;
  if (formattedAmount) {
    upiString += `&am=${formattedAmount}`;
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
  iconBg: string;
  textColor: string;
  getSchemeUrl: (upiUrl: string) => string;
}

export const UPI_APP_OPTIONS: UpiAppOption[] = [
  {
    id: 'gpay',
    name: 'Google Pay',
    iconBg: '#4285F4',
    textColor: '#FFFFFF',
    getSchemeUrl: (upiUrl) => upiUrl.replace(/^upi:\/\//i, 'gpay://'),
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    iconBg: '#5F259F',
    textColor: '#FFFFFF',
    getSchemeUrl: (upiUrl) => upiUrl.replace(/^upi:\/\//i, 'phonepe://'),
  },
  {
    id: 'paytm',
    name: 'Paytm',
    iconBg: '#00BAF2',
    textColor: '#FFFFFF',
    getSchemeUrl: (upiUrl) => upiUrl.replace(/^upi:\/\//i, 'paytm://'),
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    iconBg: '#004792',
    textColor: '#FFFFFF',
    getSchemeUrl: (upiUrl) => upiUrl,
  },
  {
    id: 'any_upi',
    name: 'Any UPI App',
    iconBg: '#10B981',
    textColor: '#FFFFFF',
    getSchemeUrl: (upiUrl) => upiUrl,
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
