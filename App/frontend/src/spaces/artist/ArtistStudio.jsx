import React, { useState, useEffect } from 'react';
import {
  PlusCircle, Sliders, History, Sparkles, CheckCircle2, ShieldCheck,
  Zap, Radio, MessageSquare, User, ArrowDownRight, Wallet, Flame, Trophy, Users,
  BarChart3
} from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import PostPublisher from './PostPublisher';
import TiersManager from './TiersManager';
import HistoryView from './HistoryView';
import LiveBroadcaster from './LiveBroadcaster';
import ArtistVipInbox from './ArtistVipInbox';
import ArtistProfileSettingsView from './ArtistProfileSettingsView';
import ArtistLeaderboard from '../shared/ArtistLeaderboard';
import CommunityManager from './CommunityManager';
import ArtistAnalyticsView from './ArtistAnalyticsView';
import { apiGetTransactions, apiGetPayoutHistory } from '../../api';

export default function ArtistStudio({ wallet, onOpenPayout, onPostCreated, onWalletRefresh, currentUser, onUpdateCurrentUser }) {
  const [activeTab, setActiveTab] = useState('publish');
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    if (activeTab === 'history') {
      apiGetTransactions().then(setTransactions).catch(console.error);
      apiGetPayoutHistory().then(setPayouts).catch(console.error);
    }
  }, [activeTab]);

  const artistName = currentUser?.stage_name || currentUser?.display_name || 'Artiste Créateur';
  const artistCategory = currentUser?.category || 'Musique & Rap Ivoire';
  const artistAvatar = currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
  const isKycVerified = currentUser?.kyc_status === 'verified';

  const tabs = [
    { id: 'publish', label: 'Publier', icon: PlusCircle, badge: null },
    { id: 'analytics', label: 'Statistiques', icon: BarChart3, badge: '📊' },
    { id: 'community', label: 'Communauté', icon: Users, badge: '👑' },
    { id: 'live', label: 'Studio Live', icon: Radio, isLive: true, badge: '🔴' },
    { id: 'ranking', label: 'Classement', icon: Trophy, badge: '🏆' },
    { id: 'messages', label: 'Messages VIP', icon: MessageSquare, badge: '💬' },
    { id: 'tiers', label: 'Paliers VIP', icon: Sliders, badge: null },
    { id: 'history', label: 'Versements', icon: History, badge: null },
    { id: 'profile', label: 'Mon Profil', icon: User, badge: null },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 transition-colors">
      {/* 1. Header Profil Créateur Dynamique & Ergonomique */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-[#1E1712] via-[#16141D] to-[#12121A] border border-orange-500/25 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-[#FF7A00]/20 via-pink-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 sm:space-x-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-[#FF7A00] via-yellow-400 to-[#FF4500] shadow-xl shadow-orange-500/20">
                <img
                  src={artistAvatar}
                  alt={artistName}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#12121A] flex items-center justify-center text-white text-[9px] shadow-md font-black ${isKycVerified ? 'bg-emerald-500' : 'bg-amber-500'
                }`}>
                {isKycVerified ? '✓' : '!'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">{artistName}</h1>
                <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-sm ${isKycVerified
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                  <ShieldCheck className="w-3 h-3" />
                  {isKycVerified ? 'VÉRIFIÉ KYC' : 'KYC EN COURS'}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                {artistCategory} • Rémunération Directe Mobile Money (80% net)
              </p>
            </div>
          </div>

          {/* Actions Rapides Header */}
          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            <button
              onClick={onOpenPayout}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="Demander un virement Mobile Money"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Retirer MoMo</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Paramètres de profil et coordonnées Mobile Money"
            >
              <User className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>Coordonnées</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Métriques & Portefeuille Radiant */}
      <DashboardOverview
        wallet={wallet}
        onOpenPayout={onOpenPayout}
        onGoToRanking={() => setActiveTab('ranking')}
        onGoToAnalytics={() => setActiveTab('analytics')}
      />

      {/* 3. Navigation Onglets Fluide & Responsive */}
      <div className="glass-panel p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl transition-colors">
        <div className="flex gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[105px] sm:min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all duration-200 flex-shrink-0 ${isSelected
                  ? tab.id === 'live'
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/25'
                    : tab.id === 'ranking'
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/25'
                      : tab.id === 'analytics'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                        : tab.id === 'messages'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white shadow-glow-orange'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
              >
                <Icon className={`w-4 h-4 ${tab.isLive && isSelected ? 'text-white' : tab.isLive ? 'text-rose-500 animate-pulse' : tab.id === 'ranking' && isSelected ? 'text-black' : ''}`} />
                <span>{tab.label}</span>
                {tab.badge && !isSelected && (
                  <span className="text-[10px]">{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Contenu de l'onglet sélectionné */}
      <div className="transition-all animate-in fade-in duration-200">
        {activeTab === 'publish' && <PostPublisher onPostCreated={onPostCreated} />}
        {activeTab === 'analytics' && <ArtistAnalyticsView currentUser={currentUser} />}
        {activeTab === 'community' && <CommunityManager currentUser={currentUser} />}
        {activeTab === 'live' && <LiveBroadcaster onWalletRefresh={onWalletRefresh} />}
        {activeTab === 'ranking' && (
          <ArtistLeaderboard
            context="artist"
            currentUserId={currentUser?.id}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'messages' && <ArtistVipInbox />}
        {activeTab === 'tiers' && <TiersManager />}
        {activeTab === 'history' && <HistoryView transactions={transactions} payouts={payouts} />}
        {activeTab === 'profile' && (
          <ArtistProfileSettingsView
            currentUser={currentUser}
            onUpdateCurrentUser={onUpdateCurrentUser}
          />
        )}
      </div>
    </div>
  );
}
