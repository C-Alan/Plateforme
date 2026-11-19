import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, UserCheck, XCircle, CheckCircle2, Clock, DollarSign,
  Users, TrendingUp, History, Sparkles, Building, ChevronRight,
  ShieldAlert, Radio, Trophy, EyeOff, User
} from 'lucide-react';
import { apiGetPendingArtists, apiApproveArtist, apiRejectArtist, apiGetPlatformStats } from '../../api';

import AdminContentModerationTab from './AdminContentModerationTab';
import AdminLiveMonitoringTab from './AdminLiveMonitoringTab';
import AdminArtistRevenuesTab from './AdminArtistRevenuesTab';
import AdminArtistRankingTab from './AdminArtistRankingTab';
import AdminKycTab from './AdminKycTab';
import AdminProfileSettingsView from './AdminProfileSettingsView';

export default function AdminKycView({ currentUser, onUpdateCurrentUser }) {
  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' | 'monitoring' | 'revenues' | 'ranking' | 'kyc' | 'stats'
  const [pendingArtists, setPendingArtists] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      apiGetPendingArtists().catch(() => []),
      apiGetPlatformStats().catch(() => null)
    ]).then(([artists, statsData]) => {
      setPendingArtists(artists);
      setStats(statsData);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (artistId, name) => {
    try {
      await apiApproveArtist(artistId);
      setSuccessMsg(`L'artiste ${name} a été certifié KYC avec succès ! Son profil est désormais actif.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (artistId, name) => {
    try {
      await apiRejectArtist(artistId);
      setSuccessMsg(`Dossier de candidature de ${name} rejeté.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-24 px-2 sm:px-0">
      {/* 1. Header Console Radiant */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-[#1E122A] via-[#161224] to-[#11111B] border border-purple-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-purple-500/20 via-pink-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 sm:space-x-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-600/30 flex-shrink-0">
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">Console de Gouvernance CDAR</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  SUPER ADMIN & MODÉRATION
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Modération de contenu sensible, régie des directes, contrôle des revenus et classement officiel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            <button
              onClick={() => setActiveTab('kyc')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 shadow-sm transition-all ${pendingArtists.length > 0
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse'
                : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{pendingArtists.length} KYC en attente</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>Profil Admin</span>
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/10 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Navigation Onglets Principaux Fluide (Piliers de Gouvernance) */}
      <div className="glass-panel p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl transition-colors">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {/* Pilier 1 : Modération / Vérification Contenu Sensible */}
          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex-1 min-w-[130px] sm:min-w-[145px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black whitespace-nowrap transition-all duration-200 flex-shrink-0 ${activeTab === 'moderation'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
          >
            <ShieldAlert className={`w-4 h-4 ${activeTab === 'moderation' ? 'text-white' : 'text-rose-500'}`} />
            <span>Vérification Contenus</span>
          </button>

          {/* Pilier 2 : Suivi Contenus & Lives (Sensibilité) */}
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`flex-1 min-w-[130px] sm:min-w-[145px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black whitespace-nowrap transition-all duration-200 flex-shrink-0 ${activeTab === 'monitoring'
              ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
          >
            <Radio className={`w-4 h-4 ${activeTab === 'monitoring' ? 'text-white' : 'text-rose-500 animate-pulse'}`} />
            <span>Suivi des Lives</span>
          </button>

          {/* Pilier 3 : Suivi des Revenus par Artiste */}
          <button
            onClick={() => setActiveTab('revenues')}
            className={`flex-1 min-w-[130px] sm:min-w-[145px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black whitespace-nowrap transition-all duration-200 flex-shrink-0 ${activeTab === 'revenues'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
          >
            <DollarSign className={`w-4 h-4 ${activeTab === 'revenues' ? 'text-white' : 'text-emerald-500'}`} />
            <span>Revenus Artistes</span>
          </button>

          {/* Pilier 4 : Classement des Artistes */}
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 min-w-[130px] sm:min-w-[145px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black whitespace-nowrap transition-all duration-200 flex-shrink-0 ${activeTab === 'ranking'
              ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/30'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
          >
            <Trophy className={`w-4 h-4 ${activeTab === 'ranking' ? 'text-black' : 'text-yellow-500'}`} />
            <span>Classement Artistes</span>
          </button>

          {/* Pilier 5 : Candidatures KYC Artistes */}
          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex-1 min-w-[130px] sm:min-w-[145px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black whitespace-nowrap transition-all duration-200 flex-shrink-0 ${activeTab === 'kyc'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
          >
            <UserCheck className={`w-4 h-4 ${activeTab === 'kyc' ? 'text-white' : 'text-purple-400'}`} />
            <span>Candidatures KYC {pendingArtists.length > 0 && `(${pendingArtists.length})`}</span>
          </button>

          {/* Pilier 6 : Télémétrie Globale Plateforme */}
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 min-w-[130px] sm:min-w-[145px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black whitespace-nowrap transition-all duration-200 flex-shrink-0 ${activeTab === 'stats'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
          >
            <TrendingUp className={`w-4 h-4 ${activeTab === 'stats' ? 'text-white' : 'text-indigo-400'}`} />
            <span>Télémétrie Globale</span>
          </button>

          {/* Pilier 7 : Profil Administrateur */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[130px] sm:min-w-[145px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black whitespace-nowrap transition-all duration-200 flex-shrink-0 ${activeTab === 'profile'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-white' : 'text-purple-400'}`} />
            <span>Profil Admin</span>
          </button>
        </div>
      </div>

      {/* 3. CONTENU DE L'ONGLET ACTIF */}

      {/* Onglet 1: Gestion & Vérification de Contenus Sensibles */}
      {activeTab === 'moderation' && (
        <AdminContentModerationTab />
      )}

      {/* Onglet 2: Suivi des Contenus & Lives */}
      {activeTab === 'monitoring' && (
        <AdminLiveMonitoringTab />
      )}

      {/* Onglet 3: Suivi des Revenus par Artiste */}
      {activeTab === 'revenues' && (
        <AdminArtistRevenuesTab />
      )}

      {/* Onglet 4: Classement des Artistes */}
      {activeTab === 'ranking' && (
        <AdminArtistRankingTab />
      )}

      {/* Onglet 5: Candidatures KYC */}
      {activeTab === 'kyc' && (
        <AdminKycTab
          pendingArtists={pendingArtists}
          loading={loading}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Onglet 6: Statistiques Financières Globales */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* Grille des 4 Métriques Clés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Chiffre brut */}
            <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Volume Brut Encaissé</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                {stats.gross_volume_cfa.toLocaleString('fr-FR')} <span className="text-xs font-bold text-[#FF7A00]">F CFA</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-2">100% paiements Mobile Money</p>
            </div>

            {/* Commissions Plateforme 20% */}
            <div className="bg-gradient-to-br from-[#24132F] to-[#170E1E] border border-purple-500/40 rounded-3xl p-5 shadow-xl shadow-purple-950/30">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Commission CDAR (20%)</span>
              <p className="text-2xl font-black text-purple-200 mt-1.5">
                {stats.platform_commission_cfa.toLocaleString('fr-FR')} <span className="text-xs font-bold text-purple-400">F CFA</span>
              </p>
              <p className="text-[10px] text-purple-300/80 mt-2">Revenus nets société prélevés</p>
            </div>

            {/* Rémunération Artistes 80% */}
            <div className="bg-gradient-to-br from-[#12281E] to-[#0B1A13] border border-emerald-500/40 rounded-3xl p-5 shadow-xl shadow-emerald-950/30">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Part Artistes (80%)</span>
              <p className="text-2xl font-black text-emerald-200 mt-1.5">
                {stats.artist_net_share_cfa.toLocaleString('fr-FR')} <span className="text-xs font-bold text-emerald-400">F CFA</span>
              </p>
              <p className="text-[10px] text-emerald-300/80 mt-2">En solde disponible ou déjà retirée</p>
            </div>

            {/* Retraits Mobile Money */}
            <div className="bg-white/80 dark:bg-[#151522] border border-cyan-500/30 rounded-3xl p-5 shadow-xl">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Retraits Effectués</span>
              <p className="text-2xl font-black text-cyan-200 mt-1.5">
                {stats.total_payouts_completed_cfa.toLocaleString('fr-FR')} <span className="text-xs font-bold text-cyan-400">F CFA</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-2">Orange, Wave, MTN validés</p>
            </div>
          </div>

          {/* Utilisateurs par rôles */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/80 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Total Comptes</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total_users}</p>
            </div>
            <div className="bg-white/80 dark:bg-[#12121A] border border-orange-500/20 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-orange-500 font-bold uppercase tracking-wider">Artistes Créateurs</span>
              <p className="text-2xl font-black text-[#FF9E00] mt-1">{stats.total_artists}</p>
            </div>
            <div className="bg-white/80 dark:bg-[#12121A] border border-cyan-500/20 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-cyan-500 font-bold uppercase tracking-wider">Fans Abonnés</span>
              <p className="text-2xl font-black text-cyan-400 mt-1">{stats.total_fans}</p>
            </div>
          </div>

          {/* Flux de Transactions Récentes */}
          <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Dernières Transactions Traitées sur la Plateforme</span>
            </h4>
            <div className="space-y-2">
              {stats.recent_transactions.map(t => (
                <div
                  key={t.id}
                  className="p-3 bg-slate-50 dark:bg-[#0E0E16] rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white uppercase">{t.type}</span> • <span className="text-gray-500 dark:text-gray-400 lowercase">{t.method}</span>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{t.reference} • {new Date(t.date).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 dark:text-white">{t.gross.toLocaleString('fr-FR')} F CFA</span>
                    <p className="text-[10px] text-purple-400 font-bold">Com. CDAR (20%) : +{t.commission.toLocaleString('fr-FR')} F</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Onglet 7: Profil Administrateur */}
      {activeTab === 'profile' && (
        <AdminProfileSettingsView
          currentUser={currentUser}
          onUpdateCurrentUser={onUpdateCurrentUser}
        />
      )}
    </div>
  );
}
