import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Wallet, ArrowDownRight, ArrowUpRight, 
  Smartphone, Search, Download, History, Eye, X, CheckCircle2, 
  Sparkles, Filter, Building2, User 
} from 'lucide-react';
import { apiGetArtistsRevenues } from '../../api';

export default function AdminArtistRevenuesTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('all');
  const [inspectArtist, setInspectArtist] = useState(null); // Modale de transactions

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiGetArtistsRevenues();
      setData(res);
    } catch (err) {
      console.error("Erreur chargement revenus artistes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportCSV = () => {
    if (!data || !data.artists) return;
    const headers = "Artiste,Catégorie,Pays,Opérateur,Numéro MoMo,Volume Brut (F CFA),Part Nette 80% (F CFA),Commission CDAR 20% (F CFA),Solde Disponible,Retraits Effectués\n";
    const rows = data.artists.map(a => 
      `"${a.stage_name}","${a.category}","${a.country}","${a.payout_operator}","${a.payout_momo_number}",${a.gross_revenue_cfa},${a.net_artist_cfa},${a.commission_cdar_cfa},${a.available_balance_cfa},${a.total_withdrawn_cfa}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cdar_revenus_artistes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredArtists = (data?.artists || []).filter(a => {
    const matchesSearch = 
      a.stage_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOperator = selectedOperator === 'all' || a.payout_operator === selectedOperator;
    return matchesSearch && matchesOperator;
  });

  const summary = data?.summary || {
    total_artists: 0,
    total_gross_volume_cfa: 0,
    total_platform_commission_cfa: 0,
    total_artists_net_share_cfa: 0,
    total_payouts_completed_cfa: 0
  };

  return (
    <div className="space-y-6">
      {/* 1. KPIs Financiers Globaux de la Plateforme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Volume Brut */}
        <div className="bg-white/80 dark:bg-[#161624] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Volume Brut Encaissé</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            {summary.total_gross_volume_cfa.toLocaleString('fr-FR')} <span className="text-xs font-bold text-[#FF7A00]">F CFA</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-2">100% monétisation créateurs</p>
        </div>

        {/* Part Nette Artistes 80% */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/35 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Part Nette Artistes (80%)</span>
          <p className="text-2xl font-black text-emerald-300 mt-1.5">
            {summary.total_artists_net_share_cfa.toLocaleString('fr-FR')} <span className="text-xs font-bold text-emerald-400">F CFA</span>
          </p>
          <p className="text-[10px] text-emerald-400/80 mt-2">Directement due aux créateurs</p>
        </div>

        {/* Commission CDAR 20% */}
        <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/35 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Commission CDAR (20%)</span>
          <p className="text-2xl font-black text-purple-200 mt-1.5">
            {summary.total_platform_commission_cfa.toLocaleString('fr-FR')} <span className="text-xs font-bold text-purple-400">F CFA</span>
          </p>
          <p className="text-[10px] text-purple-300/80 mt-2">Revenus nets d'exploitation</p>
        </div>

        {/* Retraits Mobile Money */}
        <div className="bg-white/80 dark:bg-[#161624] border border-cyan-500/30 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Retraits Effectués</span>
          <p className="text-2xl font-black text-cyan-200 mt-1.5">
            {summary.total_payouts_completed_cfa.toLocaleString('fr-FR')} <span className="text-xs font-bold text-cyan-400">F CFA</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-2">Versés sur comptes MoMo</p>
        </div>
      </div>

      {/* 2. Barre d'outils, Recherche & Export */}
      <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span>Suivi & Relevé des Revenus par Créateur</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Consultez les encaissements, la répartition 80/20 et les portefeuilles Mobile Money de chaque artiste.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* Filtres & Recherche */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher artiste, catégorie..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs p-0.5"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto py-1">
            <span className="text-[11px] font-bold text-gray-400 mr-1 flex items-center gap-1 flex-shrink-0">
              <Smartphone className="w-3.5 h-3.5" /> Opérateur :
            </span>
            {['all', 'orange_money', 'wave', 'mtn'].map((op) => (
              <button
                key={op}
                onClick={() => setSelectedOperator(op)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize whitespace-nowrap flex-shrink-0 transition-all ${
                  selectedOperator === op
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-white'
                }`}
              >
                {op === 'all' ? 'Tous' : op.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Tableau Détaillé des Artistes */}
      {loading ? (
        <div className="text-center py-16 text-xs text-gray-500 bg-white/50 dark:bg-[#12121A] rounded-3xl border border-slate-200 dark:border-white/5">
          Calcul des commissions et agrégation des transactions...
        </div>
      ) : filteredArtists.length === 0 ? (
        <div className="bg-white/80 dark:bg-[#12121A] border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center space-y-3">
          <p className="text-sm font-bold text-gray-400">Aucun créateur ne correspond aux critères de recherche.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#141422] border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#10101A] text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="py-4 px-5">Artiste Créateur</th>
                  <th className="py-4 px-4 text-right">Volume Brut</th>
                  <th className="py-4 px-4 text-right text-emerald-400">Part Artiste (80%)</th>
                  <th className="py-4 px-4 text-right text-purple-400">Com. CDAR (20%)</th>
                  <th className="py-4 px-4 text-right">Solde Dispo</th>
                  <th className="py-4 px-4 text-right">Retraits MoMo</th>
                  <th className="py-4 px-4">Canal Versement</th>
                  <th className="py-4 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {filteredArtists.map((artist) => (
                  <tr key={artist.artist_id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    {/* Artiste */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={artist.avatar_url}
                          alt={artist.stage_name}
                          className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-white/10"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900 dark:text-white">{artist.stage_name}</span>
                            <span className="text-[10px] text-gray-400 font-bold">({artist.country})</span>
                          </div>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">{artist.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* Brut */}
                    <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white">
                      {artist.gross_revenue_cfa.toLocaleString('fr-FR')} F
                    </td>

                    {/* Part Nette 80% */}
                    <td className="py-4 px-4 text-right font-black text-emerald-400">
                      {artist.net_artist_cfa.toLocaleString('fr-FR')} F
                    </td>

                    {/* Commission 20% */}
                    <td className="py-4 px-4 text-right font-black text-purple-400">
                      +{artist.commission_cdar_cfa.toLocaleString('fr-FR')} F
                    </td>

                    {/* Solde dispo */}
                    <td className="py-4 px-4 text-right font-bold text-slate-700 dark:text-gray-300">
                      {artist.available_balance_cfa.toLocaleString('fr-FR')} F
                    </td>

                    {/* Retraits */}
                    <td className="py-4 px-4 text-right font-mono text-cyan-400 font-bold">
                      {artist.total_withdrawn_cfa.toLocaleString('fr-FR')} F
                    </td>

                    {/* Paiement Mobile Money */}
                    <td className="py-4 px-4">
                      <div className="text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 font-bold uppercase text-[10px] text-slate-700 dark:text-gray-300">
                          {artist.payout_operator}
                        </span>
                        <p className="font-mono text-gray-400 text-[10px] mt-0.5">{artist.payout_momo_number}</p>
                      </div>
                    </td>

                    {/* Bouton détail */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setInspectArtist(artist)}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center gap-1 mx-auto transition-colors"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Détails</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODALE D'INSPECTION TRANSACTIONNELLE DE L'ARTISTE */}
      {inspectArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-[#161624] border border-slate-200 dark:border-white/15 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            {/* Header Modale */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={inspectArtist.avatar_url}
                  alt={inspectArtist.stage_name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-white/10"
                />
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{inspectArtist.stage_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Relevé financier • {inspectArtist.category} ({inspectArtist.country})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectArtist(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Répartition des types de gains */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ventilation par source de monétisation</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/5">
                  <span className="text-gray-500">Abonnements VIP :</span>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {inspectArtist.breakdown.subscriptions_cfa.toLocaleString('fr-FR')} F CFA
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/5">
                  <span className="text-gray-500">Ventes PPV (À l'unité) :</span>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {inspectArtist.breakdown.ppv_cfa.toLocaleString('fr-FR')} F CFA
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/5">
                  <span className="text-gray-500">Pourboires (Tips) :</span>
                  <p className="text-base font-black text-orange-400 mt-1">
                    {inspectArtist.breakdown.tips_cfa.toLocaleString('fr-FR')} F CFA
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/5">
                  <span className="text-gray-500">Tickets de Lives :</span>
                  <p className="text-base font-black text-purple-400 mt-1">
                    {inspectArtist.breakdown.live_tickets_cfa.toLocaleString('fr-FR')} F CFA
                  </p>
                </div>
              </div>
            </div>

            {/* Transactions Récentes */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-purple-400" />
                <span>5 Dernières Transactions de l'artiste</span>
              </span>

              {inspectArtist.recent_transactions.length === 0 ? (
                <p className="text-xs text-gray-500 py-3 text-center">Aucune transaction enregistrée pour l'instant.</p>
              ) : (
                <div className="space-y-2">
                  {inspectArtist.recent_transactions.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">{t.type}</span>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{t.reference} • {new Date(t.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 dark:text-white">{t.gross.toLocaleString('fr-FR')} F</span>
                        <p className="text-[10px] text-emerald-400">Net: {t.net.toLocaleString('fr-FR')} F • Com: {t.commission.toLocaleString('fr-FR')} F</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
