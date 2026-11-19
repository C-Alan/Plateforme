import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, ShieldCheck, Filter, Wallet, TrendingUp } from 'lucide-react';

export default function HistoryView({ transactions = [], payouts = [] }) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'EARNINGS' | 'PAYOUTS'

  const totalEarnings = transactions.reduce((acc, t) => acc + (t.net_artist_cfa || 0), 0);
  const totalPayouts = payouts.reduce((acc, p) => acc + (p.amount_cfa || 0), 0);

  return (
    <div className="glass-panel border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl transition-colors bg-white/80 dark:bg-[#151522]/90">
      
      {/* En-tête & Résumé Financier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-500" />
            <span>Historique des Flux Financiers</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Suivez chaque paiement fan à la seconde près et l'historique complet de vos virements Mobile Money.
          </p>
        </div>

        {/* Badges Totaux */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black">
            +{(totalEarnings).toLocaleString('fr-FR')} F reçus
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-black">
            -{(totalPayouts).toLocaleString('fr-FR')} F retirés
          </div>
        </div>
      </div>

      {/* Switcher Filtres Rapides */}
      <div className="flex bg-slate-100 dark:bg-[#0E0E18] p-1 rounded-2xl border border-slate-200 dark:border-white/10 gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilterType('ALL')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black transition-all ${
            filterType === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Toutes les opérations ({transactions.length + payouts.length})
        </button>

        <button
          onClick={() => setFilterType('EARNINGS')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black transition-all ${
            filterType === 'EARNINGS'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          💰 Recettes Fans ({transactions.length})
        </button>

        <button
          onClick={() => setFilterType('PAYOUTS')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black transition-all ${
            filterType === 'PAYOUTS'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          📤 Retraits Mobile Money ({payouts.length})
        </button>
      </div>

      {/* 1. Recettes Fans Reçues */}
      {(filterType === 'ALL' || filterType === 'EARNINGS') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <ArrowDownRight className="w-4 h-4 text-emerald-500" />
              <span>Dernières Recettes Net Reçues (80%)</span>
            </h4>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Crédité Instantanément
            </span>
          </div>

          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-400 dark:text-gray-500 bg-slate-50 dark:bg-[#0E0E16] rounded-2xl border border-slate-200 dark:border-white/5">
                Aucune recette enregistrée pour le moment.
              </div>
            ) : (
              transactions.map(txn => (
                <div
                  key={txn.id}
                  className="p-3.5 bg-slate-50 dark:bg-[#0E0E16] hover:bg-slate-100 dark:hover:bg-[#13131E] rounded-2xl border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight truncate">
                        {txn.transaction_type === 'subscription' ? 'Abonnement Fan' : 'Vente Contenu PPV'}
                        <span className="text-slate-500 dark:text-gray-400 font-normal lowercase ml-1.5">• via {txn.payment_method?.replace('_', ' ')}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono mt-0.5">
                        Réf: {txn.reference} • {new Date(txn.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      +{txn.net_artist_cfa.toLocaleString('fr-FR')} <span className="text-xs">F</span>
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-gray-400">
                      Brut : {txn.gross_amount_cfa.toLocaleString('fr-FR')} F
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. Retraits Mobile Money */}
      {(filterType === 'ALL' || filterType === 'PAYOUTS') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-cyan-500" />
              <span>Historique des Retraits Mobile Money Effectués</span>
            </h4>
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              0% de frais de retrait
            </span>
          </div>

          <div className="space-y-2">
            {payouts.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-400 dark:text-gray-500 bg-slate-50 dark:bg-[#0E0E16] rounded-2xl border border-slate-200 dark:border-white/5">
                Aucun retrait effectué pour le moment.
              </div>
            ) : (
              payouts.map(p => (
                <div
                  key={p.id}
                  className="p-3.5 bg-slate-50 dark:bg-[#0E0E16] hover:bg-slate-100 dark:hover:bg-[#13131E] rounded-2xl border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-all flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 flex-shrink-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 dark:text-white text-xs">
                        Vers <span className="uppercase text-cyan-600 dark:text-cyan-400">{p.operator?.replace('_', ' ')}</span> • {p.destination_number}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono mt-0.5">
                        Réf: {p.reference} • {new Date(p.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="font-black text-rose-500 text-sm">
                      -{p.amount_cfa.toLocaleString('fr-FR')} F
                    </span>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase">
                        {p.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
