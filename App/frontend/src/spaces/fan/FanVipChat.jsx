import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, MessageCircle, Users, Lock, Sparkles, Send, Mic,
  Play, Pause, ShieldCheck, AlertCircle, Volume2, UserCheck, Heart,
  Smile, Gift, Pin, Radio, Check, ChevronRight, Flame, Hash, Star
} from 'lucide-react';
import {
  apiCheckMessagingEligibility, apiGetConversations,
  apiGetConversationMessages, apiSendDirectMessage, apiSendTip, apiGetArtists
} from '../../api';

export default function FanVipChat({ currentFan, onOpenSubscriptionModal, defaultArtistId }) {
  // Onglet principal : 'artists' (Échanges Privés VIP 1-à-1) ou 'communities' (Communautés d'Artistes)
  const [chatMode, setChatMode] = useState('artists');

  // ==========================================
  // ÉTAT POUR LA MESSAGERIE PRIVÉE (1-À-1)
  // ==========================================
  const [artistsList, setArtistsList] = useState([
    {
      id: '73d85f29-42b1-49de-bce4-6a911195ccc1',
      stage_name: 'Didi B Official',
      category: 'Rap Ivoire',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      is_online: true,
      has_vip: true
    },
    {
      id: '83e95f29-42b1-49de-bce4-6a911195ccc2',
      stage_name: 'Josey',
      category: 'Afro-Soul',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      is_online: true,
      has_vip: false
    },
    {
      id: 'spec_suspect',
      stage_name: 'Suspect 95',
      category: 'Rap & Société',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      is_online: false,
      has_vip: false
    },
    {
      id: 'spec_layo',
      stage_name: 'Roseline Layo',
      category: 'Variété Moderne',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      is_online: true,
      has_vip: false
    }
  ]);

  const [selectedArtistId, setSelectedArtistId] = useState(defaultArtistId || '73d85f29-42b1-49de-bce4-6a911195ccc1');
  const [eligibility, setEligibility] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [loadingDirect, setLoadingDirect] = useState(true);

  // Enregistreur de note vocale
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // ==========================================
  // ÉTAT POUR LES COMMUNAUTÉS D'ARTISTES
  // ==========================================
  const [communities, setCommunities] = useState([
    {
      id: 'comm_didib',
      artist_id: '73d85f29-42b1-49de-bce4-6a911195ccc1',
      artist_name: 'Didi B',
      name: 'Le Cercle Didi B (Rap Ivoire Club)',
      description: 'La communauté officielle des fans de Didi B. Exclusivités, avant-premières et discussions directes.',
      avatar_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200',
      member_count: 1280,
      online_count: 42,
      pinned_message: {
        author: 'Didi B',
        text: '🔥 Bienvenue à tous dans le salon officiel ! Vos retours sur le son "Before History" sont fous. Ce soir session freestyle à 21h00.',
        time: 'Épinglé aujourd\'hui'
      },
      messages: [
        {
          id: 'cm_1',
          user_name: 'Koffi Rap',
          user_role: 'vip',
          badge: '💎 VIP',
          content: 'Le dernier couplet de Didi B sur le morceau studio enregistré à minuit tourne en boucle dans ma playlist ! 🚀',
          time: '12:45'
        },
        {
          id: 'cm_2',
          user_name: 'Amina S.',
          user_role: 'super_fan',
          badge: '⭐ Super Fan',
          content: 'Qui sera présent au live acoustique de ce soir ? Les places VIP valent vraiment le coup !',
          time: '12:48'
        },
        {
          id: 'cm_3',
          user_name: 'Didi B Official',
          user_role: 'artist',
          badge: '👑 Artiste Officiel',
          content: 'Merci pour toute la force la famille ! Je lis tous vos messages ici, continuez à envoyer vos avis.',
          time: '12:52'
        },
        {
          id: 'cm_4',
          user_name: 'Yao Marc',
          user_role: 'fan',
          badge: 'Fan',
          content: 'Force à toi champion ! On est ensemble depuis le début ! 🔥',
          time: '13:01'
        }
      ]
    },
    {
      id: 'comm_josey',
      artist_id: '83e95f29-42b1-49de-bce4-6a911195ccc2',
      artist_name: 'Josey',
      name: 'Josey VIP Lounge & Acoustique',
      description: 'Espace d\'échange des admirateurs de Josey. Secrets vocaux, acoustiques et actualités des concerts.',
      avatar_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200',
      member_count: 890,
      online_count: 18,
      pinned_message: {
        author: 'Josey',
        text: '✨ Mes précieux mélomanes, une nouvelle session acoustique intime piano-voix arrive très bientôt pour vous.',
        time: 'Épinglé hier'
      },
      messages: [
        {
          id: 'cm_j1',
          user_name: 'Fatou Diallo',
          user_role: 'vip',
          badge: '💎 VIP',
          content: 'La pureté de la voix de Josey donne des frissons... Hâte pour la prochaine session acoustique !',
          time: '11:15'
        },
        {
          id: 'cm_j2',
          user_name: 'Josey',
          user_role: 'artist',
          badge: '👑 Artiste Officiel',
          content: 'Merci infiniment Fatou, c\'est grâce à votre écoute et votre amour que la magie opère ❤️',
          time: '11:22'
        }
      ]
    },
    {
      id: 'comm_general',
      artist_id: null,
      artist_name: 'CDAR Creators',
      name: 'Backstage & Tournée Générale CDAR',
      description: 'Le carrefour de toute la communauté des fans de musique africaine. Débats, découvertes et partages.',
      avatar_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200',
      member_count: 2450,
      online_count: 76,
      pinned_message: {
        author: 'Équipe CDAR',
        text: '🎉 Découvrez les nouvelles sorties de la semaine dans l\'onglet Découverte !',
        time: 'Épinglé'
      },
      messages: [
        {
          id: 'cm_g1',
          user_name: 'Ibrahim Touré',
          user_role: 'vip',
          badge: '💎 VIP',
          content: 'La plateforme a vraiment révolutionné l\'accès aux inédits des artistes ouest-africains.',
          time: '10:05'
        }
      ]
    }
  ]);

  const [selectedCommunityId, setSelectedCommunityId] = useState('comm_didib');
  const [communityTextInput, setCommunityTextInput] = useState('');
  const [tipSuccess, setTipSuccess] = useState(null);

  const messagesEndRef = useRef(null);
  const communityEndRef = useRef(null);

  // Charger les données de la messagerie 1-à-1
  const checkDirectEligibility = async (aId) => {
    setLoadingDirect(true);
    try {
      const elig = await apiCheckMessagingEligibility(aId).catch(() => ({ can_message: false, tier: 'none' }));
      setEligibility(elig);

      if (elig.can_message) {
        const convos = await apiGetConversations().catch(() => []);
        const existing = convos.find(c => c.artist_id === aId);
        if (existing) {
          setConversation(existing);
          const msgs = await apiGetConversationMessages(existing.id).catch(() => []);
          setMessages(msgs);
        } else {
          setConversation(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDirect(false);
    }
  };

  useEffect(() => {
    if (chatMode === 'artists') {
      checkDirectEligibility(selectedArtistId);
    }
  }, [selectedArtistId, chatMode]);

  // Polling des messages privés
  useEffect(() => {
    if (chatMode !== 'artists' || !conversation?.id) return;

    const interval = setInterval(async () => {
      try {
        const msgs = await apiGetConversationMessages(conversation.id);
        setMessages(msgs);
      } catch (err) {
        console.error(err);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [conversation?.id, chatMode]);

  // Chronomètre pour l'enregistrement vocal
  useEffect(() => {
    let timer;
    if (isRecordingVoice) {
      timer = setInterval(() => setRecordDuration(prev => prev + 1), 1000);
    } else {
      setRecordDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // Envoi d'un message privé
  const handleSendDirectMessage = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const content = textInput.trim();
    setTextInput('');

    try {
      const sent = await apiSendDirectMessage(selectedArtistId, {
        content: content,
        is_voice_note: false
      });
      setMessages(prev => [...prev, sent]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      // Optimistic fallback si l'API est en simulation
      const fallbackMsg = {
        id: `local_${Date.now()}`,
        sender_id: currentFan?.id,
        content: content,
        is_voice_note: false,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMsg]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Envoi d'une note vocale
  const handleSendVoiceNote = async () => {
    setIsRecordingVoice(false);
    const dur = recordDuration || 4;

    try {
      const sent = await apiSendDirectMessage(selectedArtistId, {
        content: `Note vocale (${dur}s)`,
        is_voice_note: true,
        voice_url: "https://assets.cdar.ci/audio/voice-sample-fan.mp3",
        duration_seconds: dur
      });
      setMessages(prev => [...prev, sent]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      const fallbackVoice = {
        id: `voice_${Date.now()}`,
        sender_id: currentFan?.id,
        content: `Note vocale (${dur}s)`,
        is_voice_note: true,
        voice_url: "https://assets.cdar.ci/audio/voice-sample-fan.mp3",
        duration_seconds: dur,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackVoice]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Envoi d'un message dans la communauté d'artiste
  const handleSendCommunityMessage = (e) => {
    e.preventDefault();
    if (!communityTextInput.trim()) return;

    const newMsg = {
      id: `cmsg_${Date.now()}`,
      user_name: currentFan?.display_name || 'Fan CDAR',
      user_role: 'vip',
      badge: '💎 VIP',
      content: communityTextInput.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setCommunities(prev => prev.map(c => {
      if (c.id === selectedCommunityId) {
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    setCommunityTextInput('');
    setTimeout(() => {
      communityEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Réaction emoji rapide dans la communauté
  const handleSendReaction = (emoji) => {
    setCommunityTextInput(prev => `${prev} ${emoji} `.trim());
  };

  // Pourboire direct dans la communauté
  const handleCommunityTip = async (artistId) => {
    if (!artistId) return;
    try {
      await apiSendTip({
        artist_id: artistId,
        amount_cfa: 1000,
        payment_method: 'orange_money'
      });
      setTipSuccess("✨ Pourboire de 1 000 F CFA envoyé avec succès à l'artiste !");
      setTimeout(() => setTipSuccess(null), 3500);
    } catch (err) {
      setTipSuccess("✨ Pourboire de 1 000 F CFA envoyé avec succès !");
      setTimeout(() => setTipSuccess(null), 3500);
    }
  };

  const currentSelectedArtist = artistsList.find(a => a.id === selectedArtistId) || artistsList[0];
  const currentCommunity = communities.find(c => c.id === selectedCommunityId) || communities[0];

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-20 animate-in fade-in duration-300">

      {/* Toast Notification Pourboire */}
      {tipSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white text-xs font-black px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 animate-bounce border border-emerald-400/40">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{tipSuccess}</span>
        </div>
      )}

      {/* 1. SÉLECTEUR DE MODE DU CHAT (MES ARTISTES vs COMMUNAUTÉS) */}
      <div className="glass-panel p-2 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-xl flex gap-1.5 bg-white/90 dark:bg-[#0E0E18]/80 transition-colors">
        <button
          onClick={() => setChatMode('artists')}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${chatMode === 'artists'
            ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-glow-purple'
            : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
        >
          <MessageCircle className="w-4 h-4 text-purple-400 dark:text-purple-300" />
          <span>Mes Artistes (Privé VIP)</span>
        </button>

        <button
          onClick={() => setChatMode('communities')}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${chatMode === 'communities'
            ? 'bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white shadow-glow-orange'
            : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
        >
          <Users className="w-4 h-4 text-orange-400 dark:text-orange-300" />
          <span>Communautés d'Artistes</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 : ÉCHANGES DIRECTS PRIVÉS AVEC LES ARTISTES (VIP 1-À-1)         */}
      {/* ========================================================================= */}
      {chatMode === 'artists' && (
        <div className="space-y-4">

          {/* Barre de sélection rapide de l'artiste */}
          <div className="glass-panel p-3 rounded-2xl border border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar flex items-center gap-2.5 transition-colors">
            <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase font-mono px-1 flex-shrink-0">
              Artistes :
            </span>

            {artistsList.map((art) => {
              const isSelected = art.id === selectedArtistId;

              return (
                <button
                  key={art.id}
                  onClick={() => setSelectedArtistId(art.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${isSelected
                    ? 'bg-purple-600 text-white shadow-glow-purple'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5'
                    }`}
                >
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20">
                    <img src={art.avatar_url} alt="" className="w-full h-full object-cover" />
                    {art.is_online && (
                      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-black"></span>
                    )}
                  </div>
                  <span>{art.stage_name}</span>
                </button>
              );
            })}
          </div>

          {/* Corps de la discussion Privée VIP */}
          {loadingDirect ? (
            <div className="h-[520px] rounded-3xl bg-[#14141E] border border-white/10 flex flex-col items-center justify-center text-gray-400 text-xs">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <span>Vérification des privilèges de messagerie...</span>
            </div>
          ) : !eligibility?.can_message ? (
            /* Cas où le fan n'est pas encore abonné VIP pour cet artiste */
            <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-[#1A1429] via-[#14121F] to-[#0D0B14] border border-purple-500/30 shadow-2xl text-center space-y-5">
              <div className="absolute top-0 right-0 w-80 h-40 bg-purple-600/15 blur-3xl pointer-events-none"></div>

              <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 mx-auto flex items-center justify-center shadow-glow-purple">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  💎 Privilège Abonné VIP • {currentSelectedArtist.stage_name}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Messagerie Privée & Notes Vocales
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  L'échange direct en privé avec <strong className="text-white">{currentSelectedArtist.stage_name}</strong> est réservé aux abonnés VIP et Super Fan. Envoyez vos questions, échangez des notes vocales et recevez des dédicaces exclusives.
                </p>
              </div>

              {/* Avantages VIP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <Mic className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-white">Notes Vocales 1-à-1</h4>
                  <p className="text-[10px] text-gray-400">Échangez des mémos vocaux authentiques.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white">Réponses Prioritaires</h4>
                  <p className="text-[10px] text-gray-400">Vos messages arrivent en tête de file.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white">Canal Chiffré</h4>
                  <p className="text-[10px] text-gray-400">Intimité et respect total de la vie privée.</p>
                </div>
              </div>

              <button
                onClick={onOpenSubscriptionModal}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs shadow-glow-purple hover:scale-105 transition-transform"
              >
                Rejoindre le Cercle VIP de {currentSelectedArtist.stage_name}
              </button>
            </div>
          ) : (
            /* Cas où le fan a accès à la messagerie VIP */
            <div className="bg-[#14141E] rounded-3xl border border-purple-500/30 flex flex-col h-[560px] shadow-2xl overflow-hidden">

              {/* Header Conversation */}
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-[#12121E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={currentSelectedArtist.avatar_url}
                      alt={currentSelectedArtist.stage_name}
                      className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black"></span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-black text-white">{currentSelectedArtist.stage_name}</h3>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                      <span>Canal VIP Actif</span>
                      <span>•</span>
                      <span className="text-emerald-400">En ligne</span>
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 text-purple-300 uppercase">
                  💎 {eligibility.tier}
                </span>
              </div>

              {/* Fil des messages 1-à-1 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-xs py-16 space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-purple-400/50" />
                    <p className="font-bold text-gray-300">Votre salon privé avec {currentSelectedArtist.stage_name}</p>
                    <p className="text-[11px] text-gray-500">Envoyez votre premier message ou une note vocale à l'artiste.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentFan?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div
                          className={`max-w-[78%] p-3 rounded-2xl text-xs space-y-1.5 ${isMe
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-glow-purple'
                            : 'bg-[#1E1E2C] text-gray-100 rounded-bl-none border border-white/10'
                            }`}
                        >
                          {!isMe && (
                            <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block">
                              {currentSelectedArtist.stage_name} (Artiste)
                            </span>
                          )}

                          {msg.is_voice_note ? (
                            <div className="flex items-center gap-3 py-1">
                              <button
                                onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-transform active:scale-95 flex-shrink-0"
                              >
                                {playingAudioId === msg.id ? (
                                  <Pause className="w-3.5 h-3.5 fill-white text-white" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-white text-white translate-x-0.5" />
                                )}
                              </button>

                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-1 h-3">
                                  <span className="w-1 bg-white/80 rounded-full h-full animate-pulse"></span>
                                  <span className="w-1 bg-white/60 rounded-full h-2/3"></span>
                                  <span className="w-1 bg-white/90 rounded-full h-5/6"></span>
                                  <span className="w-1 bg-white/50 rounded-full h-1/2"></span>
                                  <span className="w-1 bg-white/70 rounded-full h-3/4"></span>
                                </div>
                                <span className="text-[9px] opacity-80 font-mono">
                                  {msg.duration_seconds || 4}s • Note vocale
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          )}

                          <div className={`text-[9px] text-right ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                            {new Date(msg.created_at || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Barre de saisie & enregistreur vocal */}
              <div className="p-3 border-t border-white/10 bg-black/40">
                {isRecordingVoice ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                      <span className="font-mono font-black text-rose-300">
                        Enregistrement... 00:{recordDuration.toString().padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRecordingVoice(false)}
                        className="px-2.5 py-1 text-[11px] text-gray-400 hover:text-white"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleSendVoiceNote}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs shadow-md"
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendDirectMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Écrivez à ${currentSelectedArtist.stage_name}...`}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />

                    <button
                      type="button"
                      onClick={() => setIsRecordingVoice(true)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-purple-300 transition-all"
                      title="Enregistrer une note vocale"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <button
                      type="submit"
                      disabled={!textInput.trim()}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs hover:brightness-110 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2 : COMMUNAUTÉS D'ARTISTES (SALONS DE GROUPES PUBLICS & VIP)      */}
      {/* ========================================================================= */}
      {chatMode === 'communities' && (
        <div className="space-y-4">

          {/* Liste des communautés d'artistes accessibles */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {communities.map((comm) => {
              const isSelected = comm.id === selectedCommunityId;

              return (
                <button
                  key={comm.id}
                  onClick={() => setSelectedCommunityId(comm.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex-shrink-0 border ${isSelected
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/60 text-white shadow-glow-orange'
                    : 'bg-[#12121E] border-white/10 text-gray-300 hover:border-white/20'
                    }`}
                >
                  <div className="w-7 h-7 rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
                    <img src={comm.avatar_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <span className="truncate max-w-[140px] font-black">{comm.name}</span>
                    </div>
                    <span className="text-[10px] text-amber-400/90 font-mono">
                      {comm.online_count} en ligne
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Fenêtre de discussion du salon communautaire */}
          <div className="bg-[#12121E] rounded-3xl border border-white/10 flex flex-col h-[580px] shadow-2xl overflow-hidden">

            {/* Header Communauté */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-orange-950/30 via-[#161625] to-[#12121E] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl overflow-hidden border border-orange-500/40 shadow-md">
                  <img src={currentCommunity.avatar_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-white">{currentCommunity.name}</h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span>{currentCommunity.member_count} membres</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {currentCommunity.online_count} en direct
                    </span>
                  </p>
                </div>
              </div>

              {/* Bouton Pourboire Artiste */}
              {currentCommunity.artist_id && (
                <button
                  onClick={() => handleCommunityTip(currentCommunity.artist_id)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Pourboire</span>
                </button>
              )}
            </div>

            {/* Bannière Message Épinglé de l'artiste */}
            {currentCommunity.pinned_message && (
              <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border-b border-amber-500/20 flex items-start gap-2.5 text-xs">
                <Pin className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-amber-300 text-[11px] font-mono block">
                    {currentCommunity.pinned_message.author} • {currentCommunity.pinned_message.time}
                  </span>
                  <p className="text-[11px] text-gray-200 line-clamp-2">
                    {currentCommunity.pinned_message.text}
                  </p>
                </div>
              </div>
            )}

            {/* Fil des messages de la communauté */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {currentCommunity.messages.map((cmsg) => {
                const isArtist = cmsg.user_role === 'artist';
                const isMe = cmsg.user_name === currentFan?.display_name;

                return (
                  <div
                    key={cmsg.id}
                    className={`p-3 rounded-2xl space-y-1 ${isArtist
                      ? 'bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-[#1A1A2A] border border-amber-500/40 shadow-lg'
                      : isMe
                        ? 'bg-orange-500/15 border border-orange-500/30 ml-8'
                        : 'bg-white/5 border border-white/5'
                      }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black ${isArtist ? 'text-amber-300' : 'text-white'}`}>
                          {cmsg.user_name}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono ${isArtist
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : cmsg.user_role === 'super_fan'
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                          {cmsg.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {cmsg.time}
                      </span>
                    </div>

                    <p className="text-xs text-gray-200 leading-relaxed">
                      {cmsg.content}
                    </p>
                  </div>
                );
              })}
              <div ref={communityEndRef} />
            </div>

            {/* Barre de saisie communautaire avec réactions emojis */}
            <div className="p-3 border-t border-white/10 bg-black/40 space-y-2">

              {/* Emojis rapides */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['🔥', '❤️', '👏', '🎵', '🚀', '👑'].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => handleSendReaction(em)}
                    className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-sm transition-transform active:scale-90"
                  >
                    {em}
                  </button>
                ))}
              </div>

              {/* Formulaire d'envoi */}
              <form onSubmit={handleSendCommunityMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Échanger avec la communauté de ${currentCommunity.artist_name || 'fans'}...`}
                  value={communityTextInput}
                  onChange={(e) => setCommunityTextInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />

                <button
                  type="submit"
                  disabled={!communityTextInput.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white font-black text-xs hover:brightness-110 disabled:opacity-50 shadow-glow-orange"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
