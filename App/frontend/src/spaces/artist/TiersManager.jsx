import React, { useState } from 'react';
import { Sparkles, Save, CheckCircle2, Crown, Shield, Star, Calculator, Plus, Minus } from 'lucide-react';
import { apiUpdateMyTiers } from '../../api';

export default function TiersManager() {
  const [simplePrice, setSimplePrice] = useState(5000);
  const [vipPrice, setVipPrice] = useState(10000);
  const [superFanPrice, setSuperFanPrice] = useState(25000);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await apiUpdateMyTiers([
        { tier: 'simple', price_cfa: simplePrice, description: 'Accès publications abonnés standard' },
        { tier: 'vip', price_cfa: vipPrice, description: 'Accès publications + replays lives 48h + vocal' },
        { tier: 'super_fan', price_cfa: superFanPrice, description: 'Accès total + badge exclusif + messagerie vidéo' }
      ]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const adjustPrice = (setter, current, delta, min = 1000, max = 100000) => {
    const next = Math.max(min, Math.min(max, current + delta));
    setter(next);
  };

  // Exemple de calcul de projection
  const estimatedRevenue = (vipPrice * 50 * 0.8) + (simplePrice * 100 * 0.8) + (superFanPrice * 10 * 0.8);

  return (
    <form onSubmit={handleSave} className="glass-panel border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl transition-colors bg-white/80 dark:bg-[#151522]/90">
      
      {/* Header Grille */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Tarification de vos 3 Paliers d'Abonnement</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Fixez librement vos tarifs mensuels (min 1 000 F — max 100 000 F CFA). Rémunération directe de 80% net par virement Mobile Money.
          </p>
        </div>
        <span className="self-start text-xs font-black text-[#FF9E00] bg-orange-500/15 px-3 py-1.5 rounded-full border border-orange-500/30 shadow-sm flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>80% Net Artiste</span>
        </span>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/10 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Vos nouveaux tarifs d'abonnement sont en ligne et effectifs pour vos futurs abonnés !</span>
        </div>
      )}

      {/* 3 Cartes de Paliers Radieuses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Tier 1: Fan Simple */}
        <div className="relative rounded-2xl p-5 bg-slate-50 dark:bg-[#0E0E18] border border-slate-200 dark:border-white/10 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-white/20 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                <Shield className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                1. Fan Simple
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 bg-slate-200 dark:bg-white/5 px-2 py-0.5 rounded-md">
                Standard
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed min-h-[36px]">
              Accès au flux de base, stories et publications réservées aux membres abonnés.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 block">
              Tarif Mensuel (F CFA)
            </label>
            
            {/* Input avec boutons steppers +/- */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => adjustPrice(setSimplePrice, simplePrice, -500)}
                className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center font-bold"
                title="-500 F"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                step="500"
                min="1000"
                max="100000"
                value={simplePrice}
                onChange={(e) => setSimplePrice(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-white dark:bg-[#0A0A10] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-black text-sm text-center focus:outline-none focus:border-[#FF7A00]"
              />
              <button
                type="button"
                onClick={() => adjustPrice(setSimplePrice, simplePrice, 500)}
                className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center font-bold"
                title="+500 F"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Puces de présélection */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {[2000, 3000, 5000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSimplePrice(val)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                    simplePrice === val
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black'
                      : 'bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {val.toLocaleString('fr-FR')} F
                </button>
              ))}
            </div>

            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold pt-0.5">
              Net artiste : <strong>{(simplePrice * 0.8).toLocaleString('fr-FR')} F CFA</strong> / abonné
            </p>
          </div>
        </div>

        {/* Tier 2: Fan VIP (Gold Halo) */}
        <div className="relative rounded-2xl p-5 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-[#261E0F] dark:to-[#161208] border-2 border-amber-500/50 shadow-xl shadow-amber-500/10 flex flex-col justify-between space-y-4 ring-1 ring-amber-400/30">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black uppercase tracking-wider shadow-md">
            ⭐ Plus Populaire
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 mt-1">
              <span className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                2. Fan VIP
              </span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                Idéal
              </span>
            </div>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/80 leading-relaxed min-h-[36px]">
              Publications exclusives + Replays des lives pendant 48h + Notes vocales privées.
            </p>
          </div>

          <div className="pt-3 border-t border-amber-500/20 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
              Tarif Mensuel (F CFA)
            </label>

            {/* Steppers VIP */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => adjustPrice(setVipPrice, vipPrice, -1000)}
                className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold"
                title="-1 000 F"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                step="500"
                min="1000"
                max="100000"
                value={vipPrice}
                onChange={(e) => setVipPrice(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-white dark:bg-[#0A0A10] border border-amber-500/40 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-black text-sm text-center focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => adjustPrice(setVipPrice, vipPrice, 1000)}
                className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold"
                title="+1 000 F"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Puces de présélection VIP */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {[5000, 10000, 15000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setVipPrice(val)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                    vipPrice === val
                      ? 'bg-amber-500 text-black font-black shadow-sm'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                  }`}
                >
                  {val.toLocaleString('fr-FR')} F
                </button>
              ))}
            </div>

            <p className="text-[10px] text-amber-700 dark:text-amber-300 font-bold pt-0.5">
              Net artiste : <strong>{(vipPrice * 0.8).toLocaleString('fr-FR')} F CFA</strong> / abonné
            </p>
          </div>
        </div>

        {/* Tier 3: Super Fan (Purple Neon) */}
        <div className="relative rounded-2xl p-5 bg-gradient-to-b from-purple-500/10 via-purple-500/5 to-transparent dark:from-[#24122C] dark:to-[#140A1A] border-2 border-purple-500/40 shadow-xl shadow-purple-500/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-purple-600 dark:text-purple-300 uppercase tracking-wider">
                <Star className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                3. Super Fan
              </span>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/30">
                Privilège
              </span>
            </div>
            <p className="text-xs text-purple-800/80 dark:text-purple-200/80 leading-relaxed min-h-[36px]">
              Accès total + Badge doré exclusif en live + Messagerie vidéo & dédicace annuelle.
            </p>
          </div>

          <div className="pt-3 border-t border-purple-500/20 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block">
              Tarif Mensuel (F CFA)
            </label>

            {/* Steppers Super Fan */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => adjustPrice(setSuperFanPrice, superFanPrice, -2500)}
                className="w-8 h-8 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold"
                title="-2 500 F"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                step="500"
                min="1000"
                max="100000"
                value={superFanPrice}
                onChange={(e) => setSuperFanPrice(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-white dark:bg-[#0A0A10] border border-purple-500/40 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-black text-sm text-center focus:outline-none focus:border-purple-400"
              />
              <button
                type="button"
                onClick={() => adjustPrice(setSuperFanPrice, superFanPrice, 2500)}
                className="w-8 h-8 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold"
                title="+2 500 F"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Puces de présélection Super Fan */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {[15000, 25000, 50000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSuperFanPrice(val)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                    superFanPrice === val
                      ? 'bg-purple-600 text-white font-black shadow-sm'
                      : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20'
                  }`}
                >
                  {val.toLocaleString('fr-FR')} F
                </button>
              ))}
            </div>

            <p className="text-[10px] text-purple-700 dark:text-purple-300 font-bold pt-0.5">
              Net artiste : <strong>{(superFanPrice * 0.8).toLocaleString('fr-FR')} F CFA</strong> / abonné
            </p>
          </div>
        </div>
      </div>

      {/* Estimation des revenus mensuels */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-gray-300 font-medium">
          <Calculator className="w-4 h-4 text-[#FF7A00]" />
          <span>Exemple : 100 Abonnés Simple + 50 VIP + 10 Super Fan :</span>
        </div>
        <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
          ~{estimatedRevenue.toLocaleString('fr-FR')} <span className="text-emerald-500 text-xs">F CFA Net/mois</span>
        </span>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-3.5 bg-gradient-to-r from-[#FF5500] to-[#FF8C00] hover:brightness-110 active:scale-[0.99] text-white font-black rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        <span>{isSaving ? "Enregistrement en cours..." : "Sauvegarder la Grille Tarifaire"}</span>
      </button>
    </form>
  );
}
