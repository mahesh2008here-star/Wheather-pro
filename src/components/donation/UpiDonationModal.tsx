import React, { useState } from 'react';
import { 
  Heart, 
  Copy, 
  Check, 
  QrCode, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Coffee, 
  Sprout, 
  Droplets, 
  CloudSun, 
  CheckCircle2,
  Coins,
  AlertCircle,
  Info
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { 
  LOCKED_UPI_ID,
  LOCKED_PAYEE_NAME,
  DEFAULT_NOTE,
  DONATION_PRESETS, 
  buildUpiUrl, 
  getUpiQrCodeUrl, 
  UPI_APP_OPTIONS, 
  UpiAppOption,
  copyToClipboard 
} from '../../services/upiService';

interface UpiDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpiDonationModal: React.FC<UpiDonationModalProps> = ({ isOpen, onClose }) => {
  const { customAccentColor, accentSurface, accentBorder } = useTheme();

  const [selectedPresetId, setSelectedPresetId] = useState<string>('fertilizer');
  const [customAmount, setCustomAmount] = useState<string>('250');
  const [note] = useState<string>(DEFAULT_NOTE);
  
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  
  const [showGratitudeNotice, setShowGratitudeNotice] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [hasSubmittedUtr, setHasSubmittedUtr] = useState(false);

  const [paymentStatusMessage, setPaymentStatusMessage] = useState<string | null>(null);
  const [launchNotice, setLaunchNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Selected Amount Calculation
  const selectedPreset = DONATION_PRESETS.find(p => p.id === selectedPresetId);
  const currentAmount = selectedPreset ? selectedPreset.amount : (parseFloat(customAmount) || 0);

  // Generate Locked UPI URI & QR Code
  const upiUrl = buildUpiUrl(currentAmount, note);
  const qrCodeUrl = getUpiQrCodeUrl(upiUrl, 300);

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
    const ok = await copyToClipboard(LOCKED_UPI_ID);
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

  const handleLaunchUpiApp = (app: UpiAppOption) => {
    setPaymentStatusMessage(`Redirecting to ${app.name}... Please complete the transaction inside your UPI app.`);
    setLaunchNotice(null);

    const intentUrl = app.getAppIntentUrl(currentAmount, note);
    const fallbackUrl = buildUpiUrl(currentAmount, note);

    try {
      window.location.href = intentUrl;
      setTimeout(() => {
        setLaunchNotice(`If ${app.name} is not installed on your device, select "Pay with Any UPI App" below or scan the QR code.`);
      }, 2000);
    } catch (err) {
      console.warn('[UPI] Intent launch note:', err);
      window.location.href = fallbackUrl;
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee size={16} />;
      case 'Sprout': return <Sprout size={16} />;
      case 'Droplets': return <Droplets size={16} />;
      case 'CloudSun': return <CloudSun size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-[32px] border border-[#E9E7E1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-5 border-b border-[#E9E7E1] flex items-center justify-between bg-[#F7F6F2]">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs border border-[#E9E7E1]"
              style={{ backgroundColor: accentSurface, color: customAccentColor }}
            >
              <Heart size={20} className="fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#171717] tracking-tight">
                Support Farm Weather
              </h2>
              <p className="text-xs text-[#737873] font-medium">
                Direct Indian UPI Payment • 100% Commission-Free
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E9E7E1] flex items-center justify-center text-[#737873] hover:text-[#171717] cursor-pointer snappy-touch"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* ZERO FEE TRANSPARENCY BANNER */}
          <div className="p-3.5 rounded-2xl bg-[#E5F5EC] border border-[#CEEFDB] flex items-center space-x-3 text-[#10B981]">
            <ShieldCheck size={22} className="shrink-0 text-[#10B981]" />
            <div className="text-xs leading-snug">
              <span className="font-black text-[#065F46] block">Direct Developer Support</span>
              <span className="text-[#047857] font-medium">
                100% of your donation goes directly to the developer via UPI with zero gateway fees or platform middleman cuts.
              </span>
            </div>
          </div>

          {/* PRESET DONATION AMOUNTS */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#737873] block mb-2 px-0.5">
              Choose Support Amount
            </span>
            <div className="grid grid-cols-3 gap-2">
              {DONATION_PRESETS.map((preset) => {
                const isActive = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer snappy-touch relative overflow-hidden ${
                      isActive
                        ? 'border-[#171717] shadow-xs'
                        : 'border-[#E9E7E1] hover:border-[#AAAFA9] bg-white'
                    }`}
                    style={isActive ? { backgroundColor: accentSurface } : undefined}
                  >
                    {preset.isPopular && (
                      <span 
                        className="absolute top-0 right-0 px-2 py-0.5 text-[8px] font-black uppercase text-white rounded-bl-xl"
                        style={{ backgroundColor: customAccentColor }}
                      >
                        Popular
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black text-[#171717]">{preset.label}</span>
                      <span style={{ color: isActive ? customAccentColor : '#737873' }}>
                        {renderIcon(preset.iconName)}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#737873] font-bold leading-tight block">
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Amount Field */}
            <div className="mt-2.5 flex items-center space-x-2 p-2 rounded-2xl border border-[#E9E7E1] bg-[#F7F6F2]">
              <span className="text-xs font-bold text-[#737873] pl-2">Custom Amount (₹):</span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="250"
                className="flex-1 px-3 py-1.5 rounded-xl text-sm font-black font-mono-numbers border border-[#E9E7E1] bg-white text-[#171717] outline-none"
              />
            </div>
          </div>

          {/* DYNAMIC UPI QR CODE CARD */}
          <div className="p-4 rounded-2xl border border-[#E9E7E1] bg-white text-center space-y-3 shadow-xs">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-[#171717]">
              <QrCode size={16} style={{ color: customAccentColor }} />
              <span>Scan with Any UPI App</span>
            </div>

            {/* High-res UPI QR Code Image */}
            <div className="w-48 h-48 mx-auto p-2 bg-white border-2 border-[#171717] rounded-2xl shadow-xs flex items-center justify-center relative">
              <img
                src={qrCodeUrl}
                alt="UPI Payment QR Code"
                className="w-full h-full object-contain rounded-xl"
                loading="lazy"
              />
            </div>

            <div className="text-center">
              <span className="text-lg font-black font-mono-numbers text-[#171717] block">
                ₹{currentAmount || 0}
              </span>
              <span className="text-[11px] text-[#737873] font-medium block">
                Payee: {LOCKED_PAYEE_NAME}
              </span>
            </div>

            {/* UPI ID Copy Bar */}
            <div className="p-2.5 rounded-xl bg-[#F7F6F2] border border-[#E9E7E1] flex items-center justify-between">
              <div className="min-w-0 text-left pl-1">
                <span className="text-[9px] font-bold text-[#737873] uppercase tracking-wider block">
                  Direct VPA / UPI ID
                </span>
                <span className="text-xs font-black font-mono text-[#171717] truncate block">
                  {LOCKED_UPI_ID}
                </span>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={handleCopyUpiId}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: copiedUpi ? '#E5F5EC' : accentSurface,
                    color: copiedUpi ? '#10B981' : customAccentColor,
                    border: `1px solid ${copiedUpi ? '#CEEFDB' : accentBorder}`,
                  }}
                >
                  {copiedUpi ? (
                    <>
                      <Check size={13} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ONE-TAP UPI APP LAUNCH BUTTONS */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#737873] block mb-2 px-0.5">
              Open Directly in UPI App
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {UPI_APP_OPTIONS.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleLaunchUpiApp(app)}
                  className="p-2.5 rounded-2xl border border-[#E9E7E1] bg-white hover:bg-[#F7F6F2] flex items-center space-x-2 text-xs font-bold text-[#171717] transition-colors shadow-xs cursor-pointer snappy-touch"
                >
                  <span 
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                    style={{ backgroundColor: app.iconBg, color: app.textColor }}
                  >
                    {app.name.substring(0, 2).toUpperCase()}
                  </span>
                  <span className="truncate">{app.name}</span>
                </button>
              ))}
            </div>

            {paymentStatusMessage && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#E5F5EC] border border-[#CEEFDB] text-[#065F46] text-[11px] font-semibold flex items-center space-x-1.5 animate-fade-in">
                <Info size={14} className="shrink-0 text-[#10B981]" />
                <span>{paymentStatusMessage}</span>
              </div>
            )}

            {launchNotice && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#FFF4ED] border border-[#FFE1CB] text-[#9A3412] text-[11px] font-medium flex items-start space-x-1.5 animate-fade-in">
                <AlertCircle size={14} className="shrink-0 text-[#EA580C] mt-0.5" />
                <span>{launchNotice}</span>
              </div>
            )}
          </div>

          {/* GRATITUDE / UTR VERIFICATION FEEDBACK SECTION */}
          <div className="p-3.5 rounded-2xl border border-[#E9E7E1] bg-[#F7F6F2] space-y-2">
            <button
              onClick={() => setShowGratitudeNotice(!showGratitudeNotice)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#171717] cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Coins size={15} style={{ color: customAccentColor }} />
                <span>Confirm Contribution / Send Thanks</span>
              </div>
              <span className="text-[11px] text-[#737873]">
                {showGratitudeNotice ? 'Hide' : 'Expand'}
              </span>
            </button>

            {showGratitudeNotice && (
              <div className="pt-2 border-t border-[#E9E7E1] space-y-2 text-xs text-[#444746]">
                {hasSubmittedUtr ? (
                  <div className="p-3 rounded-xl bg-[#E5F5EC] border border-[#CEEFDB] text-[#10B981] flex items-center space-x-2 font-bold">
                    <CheckCircle2 size={16} />
                    <span>Thank you so much for your support! Your encouragement keeps Farm Weather free.</span>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-[#737873]">
                      Optionally enter your UPI Transaction Ref / UTR number for developer acknowledgement:
                    </p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. 423819283120"
                        className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-[#E9E7E1] bg-white text-[#171717] font-mono outline-none"
                      />
                      <button
                        onClick={() => {
                          if (utrNumber.trim()) {
                            setHasSubmittedUtr(true);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
                        style={{ backgroundColor: customAccentColor }}
                      >
                        Submit
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-[#E9E7E1] bg-[#F7F6F2] flex items-center justify-between">
          <button
            onClick={handleCopyUpiUri}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#E9E7E1] bg-white text-[#171717] flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            {copiedUri ? <Check size={13} className="text-[#10B981]" /> : <Copy size={13} />}
            <span>{copiedUri ? 'Copied Link' : 'Copy Payment Link'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-black text-white cursor-pointer shadow-xs"
            style={{ backgroundColor: customAccentColor }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
