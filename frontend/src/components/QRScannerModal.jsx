import React, { useState } from 'react';
import axios from 'axios';
import { QrCode, X, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, onVerified }) {
  const [tokenCode, setTokenCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!tokenCode.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post('/api/orders/qr-verify', { qr_code: tokenCode.trim() });
      if (res.data.valid) {
        setResult(res.data);
        if (onVerified) onVerified();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or already redeemed QR code token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Counter QR Token Scanner</h3>
            <p className="text-xs text-slate-500">Scan or enter student order token to verify pickup</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
              Token # / QR Code String
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. CX-1001 or CX-QR-CX-1001"
                value={tokenCode}
                onChange={(e) => setTokenCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Validate & Handover Order'}
          </button>
        </form>

        {/* VERIFICATION RESULT */}
        {result && (
          <div className="mt-5 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>TOKEN #{result.token_number} VALIDATED!</span>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-200">
              Customer: <span className="font-bold">{result.customer_name}</span> ({result.order_number})
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Order status updated to COMPLETED. Food handed over.</p>
          </div>
        )}

        {error && (
          <div className="mt-5 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold">
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
