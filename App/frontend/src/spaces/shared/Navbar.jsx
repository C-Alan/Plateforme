import React from 'react';
import { Smartphone, LayoutDashboard, ShieldCheck, UserCheck, LogOut, Flame, Wallet, Sparkles, Bookmark, User, Compass, Sun, Moon, Radio, MessageSquare, Trophy } from 'lucide-react';

export default function Navbar({ currentUser, onOpenAuth, onLogout, walletBalance, fanSubTab, setFanSubTab, theme, setTheme }) {
  const getSpaceBadgeInfo = () => {
    if (!currentUser) return { title: 'Portail Découverte', bg: 'from-amber-500/20 to-orange-500/20 text-orange-300 border-orange-500/30' };
    if (currentUser.role === 'artist') return { title: 'Studio Artiste', bg: 'from-orange-500/25 to-amber-500/25 text-amber-300 border-amber-500/40 shadow-glow-orange' };
    if (currentUser.role === 'super_admin' || currentUser.role === 'moderator') return { title: 'Console Admin', bg: 'from-purple-500/25 to-pink-500/25 text-purple-300 border-purple-500/40 shadow-glow-purple' };
    return { title: 'Espace Fan', bg: 'from-sky-500/25 to-cyan-500/25 text-cyan-300 border-cyan-500/40 shadow-glow-wave' };
  };

  const badge = getSpaceBadgeInfo();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0E0E18]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] px-4 py-3 shadow-sm dark:shadow-xl transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        
        {/* Logo de la Plateforme Luminous */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4500] via-[#FF8C00] to-[#FFD700] rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5500] to-[#FFAA00] flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white drop-shadow-sm flex items-center">
                CDAR
              </span>
              <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border bg-gradient-to-r ${badge.bg}`}>
                {badge.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-amber-200/60 font-medium -mt-0.5 tracking-wide">
              La Scène Créative Africaine
            </p>
          </div>
        </div>

        {/* Sous-navigation Fan (Tabs lumineuses) */}
        {currentUser && currentUser.role === 'fan' && (
          <div className="hidden lg:flex items-center bg-slate-100/90 dark:bg-[#151522]/90 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner gap-1">
            <button
              onClick={() => setFanSubTab('feed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                fanSubTab === 'feed'
                  ? 'bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white shadow-glow-orange'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Actualité</span>
            </button>
            <button
              onClick={() => setFanSubTab('discovery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                fanSubTab === 'discovery'
                  ? 'bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white shadow-glow-orange'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Découverte</span>
            </button>
            <button
              onClick={() => setFanSubTab('ranking')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                fanSubTab === 'ranking'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black shadow-md'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className={`w-3.5 h-3.5 ${fanSubTab === 'ranking' ? 'text-black' : 'text-yellow-500'}`} />
              <span>Classement</span>
            </button>
            <button
              onClick={() => setFanSubTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                fanSubTab === 'chat' || fanSubTab === 'messages'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow-purple'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setFanSubTab('lives')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                fanSubTab === 'lives'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-glow-orange'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Lives 🔴</span>
            </button>
            <button
              onClick={() => setFanSubTab('subscriptions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                fanSubTab === 'subscriptions'
                  ? 'bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white shadow-glow-orange'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Abonnement</span>
            </button>
            <button
              onClick={() => setFanSubTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                fanSubTab === 'profile'
                  ? 'bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white shadow-glow-orange'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profil</span>
            </button>
          </div>
        )}

        {/* Profil & Actions de Déconnexion */}
        <div className="flex items-center space-x-2.5">
          {/* Boutons Changement de Thème (Clair / Sombre) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                theme === 'light'
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Activer le Mode Clair"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="hidden sm:inline">Clair</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white shadow-glow-orange font-black'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Activer le Mode Sombre"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-300 fill-indigo-300" />
              <span className="hidden sm:inline">Sombre</span>
            </button>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.role === 'artist' && walletBalance !== undefined && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/35 px-3.5 py-1.5 rounded-xl text-emerald-300 text-xs font-extrabold shadow-glow-emerald">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{walletBalance.toLocaleString('fr-FR')} F CFA</span>
                </div>
              )}

              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-end gap-1.5">
                  {currentUser.stage_name || currentUser.display_name}
                  {currentUser.role === 'artist' && (
                    <span className="text-[10px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                      {currentUser.kyc_status === 'verified' ? '✓ Vérifié' : '⏳ KYC en attente'}
                    </span>
                  )}
                  {currentUser.role === 'super_admin' && (
                    <span className="text-[10px] bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-purple-500" /> Admin
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  {currentUser.role === 'fan' ? 'Membre Fan' : currentUser.role === 'super_admin' ? 'Super Administrateur' : currentUser.role}
                </p>
              </div>

              <button
                onClick={onLogout}
                title="Déconnexion"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-rose-500 hover:border-rose-500/40 hover:bg-rose-500/10 transition-all text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="relative group flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white overflow-hidden shadow-glow-orange"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF4500] via-[#FF8C00] to-[#FFB703] group-hover:brightness-110 transition-all"></div>
              <Sparkles className="w-4 h-4 relative z-10 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="relative z-10 tracking-wide font-extrabold">Se Connecter</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
