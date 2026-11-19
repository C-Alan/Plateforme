import React, { useState, useEffect } from 'react';
import Navbar from './spaces/shared/Navbar';
import AuthModal from './spaces/shared/AuthModal';
import GuestPortal from './spaces/shared/GuestPortal';

import FeedView from './spaces/fan/FeedView';
import MySubscriptionsView from './spaces/fan/MySubscriptionsView';
import LiveViewer from './spaces/fan/LiveViewer';
import FanVipChat from './spaces/fan/FanVipChat';
import DiscoveryView from './spaces/fan/DiscoveryView';
import FanProfileView from './spaces/fan/FanProfileView';
import FanMobileNavbar from './spaces/fan/FanMobileNavbar';
import ArtistProfileFanView from './spaces/fan/ArtistProfileFanView';
import ArtistLeaderboard from './spaces/shared/ArtistLeaderboard';
import { AudioPlayerProvider } from './spaces/fan/AudioPlayerContext';
import GlobalMiniAudioPlayer from './spaces/fan/GlobalMiniAudioPlayer';

import ArtistStudio from './spaces/artist/ArtistStudio';
import ArtistPendingValidationView from './spaces/artist/ArtistPendingValidationView';
import AdminKycView from './spaces/admin/AdminKycView';

import PaymentModal from './spaces/payment/PaymentModal';
import PayoutModal from './spaces/payment/PayoutModal';

import { apiGetFeed, apiGetMe, apiGetWalletBalance } from './api';
import { AlertCircle } from 'lucide-react';

function MainApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [fanSubTab, setFanSubTab] = useState('feed'); // 'feed' | 'subscriptions'
  const [viewingArtist, setViewingArtist] = useState(null);
  
  const handleSetFanSubTab = (tab) => {
    setViewingArtist(null);
    setFanSubTab(tab);
  };
  
  const [posts, setPosts] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modales
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [targetPost, setTargetPost] = useState(null);
  const [targetTier, setTargetTier] = useState(null);
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [selectedLiveId, setSelectedLiveId] = useState(null);
  const [feedContentTypeFilter, setFeedContentTypeFilter] = useState('ALL');
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Thème Clair / Sombre
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cdar_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('cdar_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Recharger profil et données
  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('cdar_token');
      if (token) {
        try {
          const user = await apiGetMe();
          setCurrentUser(user);
          if (user.role === 'artist') {
            const w = await apiGetWalletBalance().catch(() => null);
            setWallet(w);
          }
        } catch {
          localStorage.removeItem('cdar_token');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }

      // Feed de publications
      const feed = await apiGetFeed().catch(() => []);
      setPosts(feed);
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cdar_token');
    setCurrentUser(null);
    setWallet(null);
    loadData();
  };

  const handleUnlockPost = (post) => {
    setTargetPost(post);
    setSelectedArtistId(post.artist_id);
    if (post.visibility === 'ppv') {
      setTargetTier(null);
    } else {
      setTargetTier({ tier: 'vip', price_cfa: 10000 });
    }
    setPaymentModalOpen(true);
  };

  const handleSubscribeArtist = (artist) => {
    setTargetPost(null);
    setSelectedArtistId(artist.id);
    setTargetTier({ tier: 'vip', price_cfa: artist.min_tier_price_cfa || 10000 });
    setPaymentModalOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300 ${theme === 'light' ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0D0D11] text-gray-100'}`}>
      {/* 1. Header Global Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        walletBalance={wallet?.available_balance_cfa}
        fanSubTab={fanSubTab}
        setFanSubTab={handleSetFanSubTab}
        theme={theme}
        setTheme={setTheme}
      />

      {/* 2. Routeur d'Accès par Rôles */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-3">
            <div className="w-8 h-8 border-2 border-[#FF7A00] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Chargement de votre espace sécurisé...</p>
          </div>
        ) : !currentUser ? (
          /* PORTAIL VISITEUR (NON AUTHENTIFIÉ) */
          <GuestPortal
            onLoginSuccess={() => loadData()}
            posts={posts}
          />
        ) : currentUser.role === 'fan' ? (
          /* ESPACE FAN STRICTEMENT RÉSERVÉ */
          <div className="space-y-4 pb-20 md:pb-6">
            {viewingArtist ? (
              <ArtistProfileFanView
                artist={viewingArtist}
                posts={posts}
                onBack={() => setViewingArtist(null)}
                onUnlockPost={handleUnlockPost}
                onSubscribeArtist={handleSubscribeArtist}
                onGoToLives={() => {
                  setViewingArtist(null);
                  setFanSubTab('lives');
                }}
                onGoToVipChat={() => {
                  setViewingArtist(null);
                  setFanSubTab('messages');
                }}
                currentFan={currentUser}
              />
            ) : (
              <>
                {fanSubTab === 'feed' && (
                  <FeedView
                    posts={posts}
                    onUnlockPost={handleUnlockPost}
                    onSubscribeArtist={handleSubscribeArtist}
                    currentFan={currentUser}
                    onGoToLives={(liveId) => {
                      setSelectedLiveId(liveId || null);
                      setFanSubTab('lives');
                    }}
                    onGoToVipChat={() => setFanSubTab('messages')}
                    initialContentType={feedContentTypeFilter}
                    initialArtistId={selectedArtistId || null}
                    onViewArtistProfile={(artist) => setViewingArtist(artist)}
                  />
                )}

                {fanSubTab === 'discovery' && (
                  <DiscoveryView
                    posts={posts}
                    onUnlockPost={handleUnlockPost}
                    onSubscribeArtist={handleSubscribeArtist}
                    onGoToLives={(liveId) => {
                      setSelectedLiveId(liveId || null);
                      setFanSubTab('lives');
                    }}
                    onGoToFeedWithArtist={(artistId) => {
                      setSelectedArtistId(artistId);
                      setFeedContentTypeFilter('ALL');
                      setFanSubTab('feed');
                    }}
                    onGoToFeedWithCategory={(catType) => {
                      setFeedContentTypeFilter(catType);
                      setSelectedArtistId(null);
                      setFanSubTab('feed');
                    }}
                    onGoToRanking={() => setFanSubTab('ranking')}
                    onViewArtistProfile={(artist) => setViewingArtist(artist)}
                    currentFan={currentUser}
                  />
                )}

                {fanSubTab === 'ranking' && (
                  <ArtistLeaderboard
                    context="fan"
                    currentUserId={currentUser?.id}
                    currentUser={currentUser}
                    onViewArtistProfile={(artist) => setViewingArtist(artist)}
                    onSubscribeArtist={handleSubscribeArtist}
                  />
                )}

                {fanSubTab === 'subscriptions' && (
                  <MySubscriptionsView />
                )}

                {fanSubTab === 'profile' && (
                  <FanProfileView
                    currentUser={currentUser}
                    onUpdateCurrentUser={setCurrentUser}
                    onLogout={handleLogout}
                    theme={theme}
                    setTheme={setTheme}
                    onGoToSubscriptions={() => setFanSubTab('subscriptions')}
                    onGoToLives={(liveId) => {
                      setSelectedLiveId(liveId || null);
                      setFanSubTab('lives');
                    }}
                  />
                )}

                {fanSubTab === 'lives' && (
                  <LiveViewer
                    currentFan={currentUser}
                    initialLiveId={selectedLiveId}
                    onOpenSubscriptionModal={() => {
                      setTargetTier({ tier: 'vip', price_cfa: 10000 });
                      setPaymentModalOpen(true);
                    }}
                  />
                )}

                {(fanSubTab === 'chat' || fanSubTab === 'messages') && (
                  <FanVipChat
                    currentFan={currentUser}
                    onOpenSubscriptionModal={() => {
                      setTargetTier({ tier: 'vip', price_cfa: 10000 });
                      setPaymentModalOpen(true);
                    }}
                  />
                )}
              </>
            )}
          </div>
        ) : currentUser.role === 'artist' ? (
          /* ESPACE ARTISTE STRICTEMENT RÉSERVÉ */
          <div className="space-y-4">
            {/* Si l'artiste n'est pas encore validé par l'admin, il n'a aucune vue du studio :
                uniquement le message d'attente et le récapitulatif de ses informations d'inscription */}
            {currentUser.kyc_status !== 'verified' ? (
              <ArtistPendingValidationView 
                currentUser={currentUser} 
                onRefresh={() => loadData()}
                onLogout={handleLogout}
              />
            ) : (
              <ArtistStudio
                wallet={wallet}
                onOpenPayout={() => setPayoutModalOpen(true)}
                onPostCreated={loadData}
                onWalletRefresh={loadData}
                currentUser={currentUser}
                onUpdateCurrentUser={setCurrentUser}
              />
            )}
          </div>
        ) : currentUser.role === 'super_admin' || currentUser.role === 'moderator' ? (
          /* ESPACE ADMINISTRATION & MODÉRATION STRICTEMENT RÉSERVÉ */
          <AdminKycView 
            currentUser={currentUser}
            onUpdateCurrentUser={setCurrentUser}
          />
        ) : (
          <div className="text-center py-12 text-rose-400 text-sm">
            Rôle non reconnu ou accès restreint.
          </div>
        )}
      </main>

      {/* 3. Modales Globales */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        targetPost={targetPost}
        targetTier={targetTier}
        artistId={selectedArtistId || targetPost?.artist_id || (posts[0]?.artist_id || '')}
        onSuccess={() => loadData()}
      />

      <PayoutModal
        isOpen={payoutModalOpen}
        onClose={() => setPayoutModalOpen(false)}
        availableBalance={wallet?.available_balance_cfa || 0}
        onSuccess={() => loadData()}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={() => loadData()}
      />

      {/* 4. Mini Lecteur Audio Global Flottant Persistant */}
      {currentUser && currentUser.role === 'fan' && (
        <GlobalMiniAudioPlayer 
          onOpenFullPlayer={() => {
            setViewingArtist(null);
            setFeedContentTypeFilter('music');
            setFanSubTab('feed');
          }}
        />
      )}

      {/* 5. Barre de Navigation Mobile Fan Fixée en Bas (Actualité, Découverte, Abonnement, Profil) */}
      {currentUser && currentUser.role === 'fan' && (
        <FanMobileNavbar
          activeTab={viewingArtist ? '' : fanSubTab}
          onSelectTab={(tab) => handleSetFanSubTab(tab)}
        />
      )}
    </div>
  );
}

// Wrapper avec le Provider Audio Global
export default function App() {
  return (
    <AudioPlayerProvider>
      <MainApp />
    </AudioPlayerProvider>
  );
}
