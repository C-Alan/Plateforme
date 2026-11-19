import React from 'react';
import { Compass, Sparkles, Bookmark, User, Search, Flame, MessageCircle, Radio, Trophy } from 'lucide-react';

export default function FanMobileNavbar({ activeTab, onSelectTab }) {
  const tabs = [
    {
      id: 'feed',
      label: 'Actualité',
      icon: Flame,
    },
    {
      id: 'discovery',
      label: 'Explorer',
      icon: Search,
    },
    {
      id: 'ranking',
      label: 'Podium',
      icon: Trophy,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
    },
    {
      id: 'lives',
      label: 'Lives',
      icon: Radio,
      isLive: true,
    },
    {
      id: 'subscriptions',
      label: 'Abonnés',
      icon: Bookmark,
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E0E18]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 md:hidden px-1 py-1.5 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-10px_25px_rgba(0,0,0,0.5)] transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-7 gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = (tab.id === 'chat' && (activeTab === 'chat' || activeTab === 'messages')) || activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
              }`}
            >
              {/* Indicateur lumineux actif */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/15 rounded-xl border border-orange-500/30 shadow-glow-orange -z-10"></div>
              )}

              <div className="relative">
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${
                    tab.isLive && !isActive
                      ? 'text-rose-500'
                      : isActive
                      ? tab.isLive
                        ? 'text-rose-500 scale-110'
                        : 'text-[#FF7A00] scale-110'
                      : 'text-slate-500 dark:text-gray-400'
                  }`}
                />
                {tab.isLive ? (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                ) : isActive ? (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                ) : null}
              </div>

              <span
                className={`text-[9px] tracking-tight mt-0.5 transition-all truncate max-w-full ${
                  isActive
                    ? tab.isLive
                      ? 'font-black text-rose-500'
                      : 'font-black text-orange-600 dark:text-amber-300'
                    : 'font-semibold text-slate-500 dark:text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}


