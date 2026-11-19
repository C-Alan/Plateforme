import React, { useState } from 'react';
import { X, ArrowDownCircle, AlertCircle, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { apiRequestPayout } from '../../api';

export default function PayoutModal({ isOpen, onClose, availableBalance, onSuccess }) {
  if (!isOpen) return null;

  const [amount, setAmount] = useState('10000');
  const [operator, setOperator] = useState('orange_money');
  const [momoNumber, setMomoNumber] = useState('+225 07 00 11 22 33');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const numAmount = parseFloat(amount) || 0;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (numAmount < 5000) {
      setError("Le montant minimum de retrait est de 5 000 F CFA.");
      return;
    }
    if (numAmount > availableBalance) {
      setError("Le montant demandé dépasse votre solde disponible.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiRequestPayout({
        amount_cfa: numAmount,
        operator,
        destination_number: momoNumber
      });
      onSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || "Erreur lors de la demande de retrait");
    } finally {
      setLoading(false);
    }
  };

  const handleSetQuickAmount = (val) => {
    setAmount(String(Math.min(val, availableBalance)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-[#161622] border border-emerald-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Glow ambient background aura */}
        <div className="absolute top-0 right-0 w-72 h-40 bg-gradient-to-bl from-emerald-500/20 via-teal-500/10 to-transparent blur-3xl pointer-events-none"></div>

        {/* Header Modal */}
        <div className="relative z-10 px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Retrait Mobile Money Artiste</h3>
              <p className="text-[11px] text-emerald-400 font-medium">Versement instantané vers votre compte local</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps du Formulaire */}
        <form onSubmit={handleWithdraw} className="relative z-10 p-6 space-y-6">
          {/* Solde disponible radiant */}
          <div className="bg-gradient-to-br from-[#12281D] to-[#0A1710] p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Solde Disponible Retirable</span>
              <p className="text-2xl font-black text-white mt-0.5">
                {availableBalance.toLocaleString('fr-FR')} <span className="text-xs font-black text-emerald-400">F CFA</span>
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Sans frais de virement
            </span>
          </div>

          {/* Saisie Montant & Raccourcis */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Montant à transférer (F CFA)
            </label>
            <input
              type="number"
              step="500"
              min="5000"
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl px-4 py-3 text-white font-black text-base focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
              required
            />
            {/* Quick Chips */}
            <div className="flex gap-2 mt-2">
              {[5000, 10000, 25000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSetQuickAmount(val)}
                  disabled={val > availableBalance}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 disabled:opacity-30"
                >
                  {val.toLocaleString('fr-FR')} F
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleSetQuickAmount(availableBalance)}
                disabled={availableBalance < 5000}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 disabled:opacity-30"
              >
                Tout retirer ({availableBalance.toLocaleString('fr-FR')} F)
              </button>
            </div>
          </div>

          {/* Opérateur de Réception */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Opérateur de Réception
              </label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-emerald-400 transition-all"
              >
                <option value="orange_money">Orange Money (CI, SN)</option>
                <option value="wave">Wave Mobile Money</option>
                <option value="mtn_momo">MTN Mobile Money</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                N° de Téléphone de Réception
              </label>
              <input
                type="text"
                value={momoNumber}
                onChange={(e) => setMomoNumber(e.target.value)}
                className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-emerald-400 transition-all font-mono"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* CTA Validation */}
          <button
            type="submit"
            disabled={loading || numAmount > availableBalance || numAmount < 5000}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {loading
                ? "Exécution du virement vers votre numéro..."
                : `Confirmer le Retrait de ${numAmount.toLocaleString('fr-FR')} F CFA`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
