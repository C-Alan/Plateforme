import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, CreditCard, ShieldCheck, Sparkles, Smartphone, Lock, ArrowRight } from 'lucide-react';
import { apiCheckout } from '../../api';

export default function PaymentModal({ isOpen, onClose, targetPost, targetTier, artistId, onSuccess }) {
  if (!isOpen) return null;

  const [operator, setOperator] = useState('orange_money');
  const [phoneNumber, setPhoneNumber] = useState('+225 07 88 99 00 11');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState(null);

  const isSubscription = Boolean(targetTier);
  const amountCfa = isSubscription ? (targetTier?.price_cfa || 5000) : (targetPost?.price_cfa || 5000);

  const handlePay = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setProcessingStep('Connexion sécurisée aux serveurs opérateurs...');

    try {
      // Délai de traitement sécurisé passerelle opérateur (800ms)
      await new Promise(r => setTimeout(r, 600));
      setProcessingStep('Envoi de la demande de prélèvement sur votre téléphone...');
      await new Promise(r => setTimeout(r, 600));

      const payload = {
        artist_id: artistId,
        transaction_type: isSubscription ? 'subscription' : 'ppv_purchase',
        payment_method: operator,
        amount_cfa: amountCfa,
        meta_id: isSubscription ? targetTier.tier : targetPost.id,
        phone_number: phoneNumber
      };

      const result = await apiCheckout(payload);

      if (result.status === 'successful') {
        setProcessingStep('Transaction approuvée ! Déverrouillage en cours...');
        await new Promise(r => setTimeout(r, 400));
        onSuccess(result);
        onClose();
      } else {
        setError("La transaction a été refusée par l'opérateur. Veuillez réessayer avec un solde suffisant.");
      }
    } catch (err) {
      setError(err.message || "Erreur de communication avec la passerelle Mobile Money");
    } finally {
      setLoading(false);
      setProcessingStep('');
    }
  };

  const operators = [
    {
      id: 'orange_money',
      name: 'Orange Money',
      subtitle: "Côte d'Ivoire, SN, ML",
      accent: 'border-[#FF5500] bg-[#FF5500]/10 text-white shadow-lg shadow-orange-500/10',
      dotColor: 'bg-[#FF5500]'
    },
    {
      id: 'wave',
      name: 'Wave',
      subtitle: 'Paiement sans frais 1%',
      accent: 'border-[#00B4D8] bg-[#00B4D8]/10 text-white shadow-lg shadow-cyan-500/10',
      dotColor: 'bg-[#00B4D8]'
    },
    {
      id: 'mtn_momo',
      name: 'MTN MoMo',
      subtitle: 'CI, Bénin, CM, GH',
      accent: 'border-[#FFCC00] bg-[#FFCC00]/10 text-white shadow-lg shadow-yellow-500/10',
      dotColor: 'bg-[#FFCC00]'
    },
    {
      id: 'card',
      name: 'Carte Visa / MC',
      subtitle: 'International & Diaspora',
      accent: 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10',
      dotColor: 'bg-indigo-400'
    }
  ];

  const selectedOpName = operators.find(o => o.id === operator)?.name || 'Mobile Money';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-[#161622] border border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Glow ambient background aura */}
        <div className="absolute top-0 right-0 w-72 h-40 bg-gradient-to-bl from-orange-500/20 via-yellow-500/10 to-transparent blur-3xl pointer-events-none"></div>

        {/* Header Modal */}
        <div className="relative z-10 px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-yellow-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Passerelle Sécurisée CDAR Pay</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  SSL 256-BIT
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isSubscription ? `Abonnement '${targetTier.tier?.toUpperCase()}' (30 jours)` : `Déverrouillage PPV : ${targetPost?.title?.slice(0, 30)}...`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps du Modal */}
        <form onSubmit={handlePay} className="relative z-10 p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Montant & Répartition 80/20 */}
          <div className="bg-gradient-to-br from-[#1F1710] to-[#120E0A] p-5 rounded-2xl border border-orange-500/30 text-center shadow-lg">
            <p className="text-[11px] text-orange-300 font-bold uppercase tracking-wider">Montant Net à Régler</p>
            <p className="text-3xl sm:text-4xl font-black text-white mt-1">
              {amountCfa.toLocaleString('fr-FR')} <span className="text-base font-black text-[#FF9E00]">F CFA</span>
            </p>

            {/* Garantie de paiement sécurisé */}
            <div className="mt-3 pt-3 border-t border-orange-500/20 flex items-center justify-center gap-2 text-xs text-gray-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Accès instantané après validation • Règlement 100% sécurisé</span>
            </div>
          </div>

          {/* Sélection du moyen de paiement */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2.5">
              1. Choisissez votre moyen de paiement
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {operators.map((op) => {
                const isSelected = operator === op.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperator(op.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? `${op.accent} ring-1 ring-white/20`
                        : 'border-white/5 bg-[#0E0E16] text-gray-400 hover:border-white/15'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${op.dotColor} flex-shrink-0 shadow-sm`} />
                    <div className="min-w-0">
                      <p className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {op.name}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">{op.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coordonnées de paiement */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              2. Informations de règlement
            </label>
            
            {operator !== 'card' ? (
              <div className="space-y-2">
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#FF7A00] transition-all font-mono"
                    required
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Une validation USSD ou une notification vous sera demandée sur votre mobile pour approuver le débit.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Numéro de carte bancaire (16 chiffres)"
                    className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM / AA"
                    className="bg-[#0E0E16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-indigo-500 text-center"
                    required
                  />
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="CVV / CVC"
                    maxLength={4}
                    className="bg-[#0E0E16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-indigo-500 text-center"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* CTA Validation */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#FF7A00] via-[#FF9E00] to-yellow-500 hover:brightness-110 active:scale-[0.99] text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {loading
                ? (processingStep || "Traitement sécurisé en cours...")
                : `Régler ${amountCfa.toLocaleString('fr-FR')} F CFA via ${selectedOpName}`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
