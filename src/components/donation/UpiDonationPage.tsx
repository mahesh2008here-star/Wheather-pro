import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Heart, 
  Copy, 
  Check, 
  QrCode, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  Coffee, 
  Sprout, 
  Droplets, 
  CloudSun, 
  ExternalLink,
  Edit2,
  CheckCircle2,
  Coins,
  HelpCircle,
  Share2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { 
  getUpiConfig, 
  setCustomUpiId, 
  DONATION_PRESETS, 
  buildUpiUrl, 
  getUpiQrCodeUrl, 
  UPI_APP_OPTIONS, 
  copyToClipboard 
} from '../../services/upiService';

interface UpiDonationPageProps {
  onBack: () => void;
}

export const UpiDonationPage: React.FC<UpiDonationPageProps> = ({ onBack }) => {
  const { customAccentColor, accentSurface, accentBorder } = useTheme();

  const [upiConfig, setUpiConfig] = useState(getUpiConfig());
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fertilizer');
  const [customAmount, setCustomAmount] = useState<string>('250');
  const [note, setNote] = useState<string>('Support Farm Weather App');
  
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [showEditUpi, setShowEditUpi] = useState(false);
  const [upiInput, setUpiInput] = useState(upiConfig.upiId);
  
  const [utrNumber, setUtrNumber] = useState('');
  const [hasSubmittedUtr, setHasSubmittedUtr] = useState(false);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  // Selected Amount Calculation
  const selectedPreset = DONATION_PRESETS.find(p => p.id === selectedPresetId);
  const currentAmount = selectedPreset ? selectedPreset.amount : (parseFloat(customAmount) || 0);

  // Generate UPI URI
  const upiUrl = buildUpiUrl(upiConfig.upiId, upiConfig.payeeName, currentAmount, note);
  const qrCodeUrl = getUpiQrCodeUrl(upiUrl, 320);

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = DONATION_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setCustomAmount(preset.amount.toString());
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    setSelectedPresetId('');
  };

  const handleCopyUpiId = async () => {
    const ok = await copyToClipboard(upiConfig.upiId);
    if (ok) {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleCopyUpiUri = async () => {
    const ok = await copyToClipboard(upiUrl);
    if (ok) {
      setCopiedUri(true);
      setTimeout(() => setCopiedUri(false), 2000);
    }
  };

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (upiInput.trim() && upiInput.includes('@')) {
      setCustomUpiId(upiInput.trim());
      setUpiConfig(getUpiConfig());
      setShowEditUpi(false);
    }
  };

  const handleResetUpi = () => {
    setCustomUpiId('');
    setUpiConfig(getUpiConfig());
    setUpiInput(getUpiConfig().upiId);
    setShowEditUpi(false);
  };

  const handleUtrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (utrNumber.trim()) {
      setHasSubmittedUtr(true);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee size={18} />;
      case 'Sprout': return <Sprout size={18} />;
      case 'Droplets': return <Droplets size={18} />;
      case 'CloudSun': return <CloudSun size={18} />;
      case 'Sparkles': return <Sparkles size={18} />;
      default: return <Coins size={18} />;
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#F7F6F2] text-[#171717] flex flex-col font-sans relative overflow-x-hidden">
      {/* 1. TOP HEADER BAR */}
      <header 
        className="w-full bg-white border-b border-[#E9E7E1] sticky top-0 z-40 shadow-xs"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-[#F7F6F2] hover:bg-[#EAE8E1] border border-[#E9E7E1] text-[#171717] flex items-center space-x-1.5 cursor-pointer snappy-touch transition-colors"
              aria-label="Back to Settings"
            >
              <ArrowLeft size={18} />
              <span className="text-xs font-bold hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E5F5EC] text-[#10B981] flex items-center justify-center shrink-0 border border-[#CEEFDB]">
                <Heart size={20} className="fill-current" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-black text-[#171717] leading-tight">
                    Support Farm Weather
                  </h1>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E5F5EC] text-[#10B981] border border-[#CEEFDB]">
                    Direct UPI
                  </span>
                </div>
                <p className="text-[11px] text-[#737873] font-medium">
                  100% Direct Bank-to-Bank Transfer • Zero Commission Fees
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyUpiId}
            className="py-2 px-3.5 rounded-xl text-xs font-bold bg-[#E5F5EC] text-[#10B981] border border-[#CEEFDB] flex items-center space-x-1.5 cursor-pointer shadow-xs hover:bg-[#d8f2e2] transition-colors"
          >
            {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
            <span className="hidden sm:inline">{copiedUpi ? 'UPI ID Copied' : 'Copy UPI ID'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN PAGE CONTENT CONTAINER */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* HERO IMPACT BANNER */}
        <div className="p-6 rounded-[28px] bg-gradient-to-br from-white via-white to-[#F0FAF4] border border-[#CEEFDB] shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-[#10B981]">
            <Sparkles size={20} />
            <span className="text-xs font-black uppercase tracking-wider">
              Empower Open-Source Precision Weather
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-[#171717] tracking-tight">
            Keep Farm Weather Ad-Free, Private & Fast for Every Farmer
          </h2>

          <p className="text-xs sm:text-sm text-[#444746] leading-relaxed">
            Your contributions directly fund high-frequency satellite telemetry API requests, live radar bandwidth, soil moisture forecasts, and local weather widget synchronization without showing a single advertisement.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#E5F5EC] text-[#10B981] border border-[#CEEFDB]">
              ✓ Direct Bank Transfer
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#E5F5EC] text-[#10B981] border border-[#CEEFDB]">
              ✓ 0% Platform Deductions
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#E5F5EC] text-[#10B981] border border-[#CEEFDB]">
              ✓ Instant App Launch
            </span>
          </div>
        </div>

        {/* CONFIGURED UPI ID & PAYEE CARD */}
        <div className="p-6 rounded-[28px] bg-white border border-[#E9E7E1] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9E7E1] pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider block text-[#737873]">
                Official Payee UPI Identifier
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-base sm:text-lg font-black font-mono text-[#171717]">
                  {upiConfig.upiId}
                </span>
                <button
                  onClick={handleCopyUpiId}
                  className="p-1.5 rounded-lg bg-[#F7F6F2] hover:bg-[#EAE8E1] text-[#171717] border border-[#E9E7E1] cursor-pointer"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
                </button>
              </div>
              <span className="text-xs text-[#737873] font-medium block mt-0.5">
                Payee Name: <strong className="text-[#171717]">{upiConfig.payeeName}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                onClick={() => setShowEditUpi(!showEditUpi)}
                className="px-3 py-1.5 rounded-xl border border-[#E9E7E1] bg-[#F7F6F2] text-xs font-bold text-[#737873] hover:text-[#171717] flex items-center space-x-1 cursor-pointer"
              >
                <Edit2 size={13} />
                <span>{showEditUpi ? 'Close Config' : 'Configure UPI ID'}</span>
              </button>
            </div>
          </div>

          {/* EDIT UPI ID FORM COLLAPSIBLE */}
          {showEditUpi && (
            <form onSubmit={handleSaveUpi} className="p-4 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] space-y-3">
              <label className="text-xs font-bold text-[#171717] block">
                Custom Payee UPI VPA Identifier (e.g. username@upi or phone@paytm)
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={upiInput}
                  onChange={(e) => setUpiInput(e.target.value)}
                  placeholder="mahesh.2008here@okicici"
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs border border-[#E9E7E1] bg-white font-mono text-[#171717] outline-none"
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-bold cursor-pointer"
                  >
                    Save UPI
                  </button>
                  <button
                    type="button"
                    onClick={handleResetUpi}
                    className="px-3 py-2 rounded-xl border border-[#E9E7E1] bg-white text-xs font-bold text-[#737873] cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 1: CHOOSE AMOUNT */}
          <div className="space-y-3">
            <span className="text-xs font-black text-[#171717] uppercase tracking-wider block">
              1. Choose Contribution Amount
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {DONATION_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between cursor-pointer snappy-touch transition-all relative ${
                      isSelected
                        ? 'bg-[#171717] text-white border-[#171717] shadow-md scale-[1.02]'
                        : 'bg-white text-[#171717] border-[#E9E7E1] hover:border-gray-300 shadow-2xs'
                    }`}
                  >
                    {preset.isPopular && (
                      <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                        Popular
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/10 text-white' : 'bg-[#F7F6F2] text-[#EA580C]'}`}>
                        {renderIcon(preset.iconName)}
                      </div>
                      <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-[#171717]'}`}>
                        {preset.label}
                      </span>
                    </div>

                    <span className={`text-[10px] font-medium leading-tight ${isSelected ? 'text-gray-300' : 'text-[#737873]'}`}>
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* CUSTOM AMOUNT INPUT */}
            <div className="p-3.5 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#171717]">Or enter custom rupee amount:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black text-[#171717]">₹</span>
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="250"
                  className="w-32 px-3 py-1.5 rounded-xl text-xs font-bold font-mono border border-[#E9E7E1] bg-white text-[#171717] outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: INSTANT DEEP LINKS */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-black text-[#171717] uppercase tracking-wider block">
              2. Launch Installed Indian UPI Payment App
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {UPI_APP_OPTIONS.map((app) => (
                <a
                  key={app.id}
                  href={app.getSchemeUrl(upiUrl)}
                  className="p-3 rounded-2xl border border-[#E9E7E1] bg-white hover:bg-[#F7F6F2] flex flex-col items-center justify-center text-center space-y-1.5 shadow-2xs cursor-pointer snappy-touch transition-all active:scale-95"
                >
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs"
                    style={{ backgroundColor: app.iconBg }}
                  >
                    <Smartphone size={18} />
                  </div>
                  <span className="text-xs font-bold text-[#171717]">{app.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* STEP 3: DYNAMIC QR CODE DISPLAY */}
          <div className="p-5 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-2 text-[#EA580C]">
                <QrCode size={20} />
                <h3 className="text-sm font-black uppercase tracking-wider text-[#171717]">
                  Scan QR Code with Any Phone
                </h3>
              </div>

              <p className="text-xs text-[#737873] leading-relaxed">
                Open Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, or any bank app on another device and point the camera at this QR code.
              </p>

              <div className="p-3 rounded-xl bg-white border border-[#E9E7E1] space-y-1 text-xs font-mono">
                <div className="flex justify-between text-[11px] text-[#737873]">
                  <span>Target Payee:</span>
                  <span className="font-bold text-[#171717]">{upiConfig.upiId}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#737873]">
                  <span>Calculated Amount:</span>
                  <span className="font-bold text-[#10B981]">₹{currentAmount || 'Custom'}</span>
                </div>
              </div>

              <button
                onClick={handleCopyUpiUri}
                className="py-2 px-4 rounded-xl text-xs font-bold border border-[#E9E7E1] bg-white text-[#171717] hover:bg-gray-50 flex items-center space-x-2 cursor-pointer shadow-2xs"
              >
                {copiedUri ? <Check size={14} className="text-[#10B981]" /> : <Share2 size={14} />}
                <span>{copiedUri ? 'Raw UPI URL Copied' : 'Copy Raw UPI Deep Link'}</span>
              </button>
            </div>

            {/* QR CODE DISPLAY */}
            <div className="p-4 bg-white rounded-2xl border border-[#E9E7E1] shadow-md flex flex-col items-center space-y-2 shrink-0">
              <img 
                src={qrCodeUrl} 
                alt="UPI Payment QR Code" 
                className="w-48 h-48 object-contain rounded-lg border border-[#E9E7E1]"
                loading="eager"
              />
              <span className="text-[10px] font-bold font-mono text-[#737873]">
                SCAN TO PAY ₹{currentAmount}
              </span>
            </div>
          </div>
        </div>

        {/* STEP 4: SUPPORTER VERIFICATION FORM */}
        <div className="p-6 rounded-[28px] bg-white border border-[#E9E7E1] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-[#171717]">
            <CheckCircle2 size={20} className="text-[#10B981]" />
            <h3 className="text-sm font-black uppercase tracking-wider">
              Verify Transaction & Log Supporter Credit
            </h3>
          </div>

          <p className="text-xs text-[#737873] leading-relaxed">
            After completing payment in your UPI app, you may optionally paste your 12-digit UPI UTR / Bank Reference Number below to register your contribution.
          </p>

          {hasSubmittedUtr ? (
            <div className="p-4 rounded-2xl bg-[#E5F5EC] border border-[#CEEFDB] text-[#10B981] space-y-1">
              <span className="text-xs font-black text-[#065F46] block">✓ Thank You! Transaction UTR Logged</span>
              <p className="text-[11px] text-[#047857]">
                Reference ID: <code className="font-bold font-mono">{utrNumber}</code>. Thank you for empowering open-source agriculture weather!
              </p>
            </div>
          ) : (
            <form onSubmit={handleUtrSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="Enter 12-digit UPI UTR / Ref No (e.g. 428901234567)"
                className="flex-1 px-3.5 py-2 rounded-xl text-xs border border-[#E9E7E1] bg-[#F7F6F2] font-mono text-[#171717] outline-none focus:bg-white focus:border-[#10B981]"
              />
              <button
                type="submit"
                disabled={!utrNumber.trim()}
                className="px-5 py-2 rounded-xl bg-[#10B981] text-white text-xs font-bold cursor-pointer hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Log Supporter Credit
              </button>
            </form>
          )}
        </div>
      </main>

      {/* 3. PAGE FOOTER */}
      <footer className="w-full bg-white border-t border-[#E9E7E1] py-4 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#737873]">
          <span>Farm Weather Open-Source Agriculture Weather</span>
          <button
            onClick={onBack}
            className="text-[#EA580C] font-bold hover:underline cursor-pointer"
          >
            Return to Settings
          </button>
        </div>
      </footer>
    </div>
  );
};
