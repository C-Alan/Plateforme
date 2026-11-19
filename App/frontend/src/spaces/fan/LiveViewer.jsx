import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, Play, Users, Gift, Sparkles, Send, Lock, ShieldCheck, 
  Ticket, Flame, Heart, Music, ThumbsUp, Volume2, AlertCircle, Clock 
} from 'lucide-react';
import { 
  apiGetActiveLives, apiGetLiveDetail, apiPurchaseLiveTicket, 
  apiGetLiveMessages, apiSendLiveMessage, apiSendLiveTip 
} from '../../api';

export default function LiveViewer({ currentFan, onOpenSubscriptionModal, initialLiveId }) {
  const [lives, setLives] = useState([]);
  const [selectedLive, setSelectedLive] = useState(null);
  const [liveDetail, setLiveDetail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Floating reactions state
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  // Tipping popup
  const [isTipping, setIsTipping] = useState(false);
  const [tipAmount, setTipAmount] = useState('1000');
  const [tipMethod, setTipMethod] = useState('orange_money');
  const [isProcessingTip, setIsProcessingTip] = useState(false);
  const [tipSuccessMsg, setTipSuccessMsg] = useState(null);

  // Ticket purchasing
  const [isPurchasingTicket, setIsPurchasingTicket] = useState(false);
  const [ticketMethod, setTicketMethod] = useState('wave');

  const messagesEndRef = useRef(null);

  // Load lives
  const loadLives = async () => {
    try {
      const data = await apiGetActiveLives();
      setLives(data);
      if (data.length > 0) {
        if (initialLiveId) {
          const found = data.find(l => l.id === initialLiveId);
          setSelectedLive(found || data[0]);
        } else if (!selectedLive) {
          setSelectedLive(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLives();
  }, []);

  useEffect(() => {
    if (initialLiveId && lives.length > 0) {
      const found = lives.find(l => l.id === initialLiveId);
      if (found) setSelectedLive(found);
    }
  }, [initialLiveId, lives]);

  // Fetch detailed live when selected
  useEffect(() => {
    if (!selectedLive) return;

    const fetchDetail = async () => {
      try {
        const detail = await apiGetLiveDetail(selectedLive.id);
        setLiveDetail(detail);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDetail();
    const interval = setInterval(fetchDetail, 5000);
    return () => clearInterval(interval);
  }, [selectedLive?.id]);

  // Poll chat messages
  useEffect(() => {
    if (!selectedLive) return;

    const fetchMessages = async () => {
      try {
        const msgs = await apiGetLiveMessages(selectedLive.id);
        setMessages(msgs);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedLive?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedLive) return;
    try {
      const newMsg = await apiSendLiveMessage(selectedLive.id, chatInput.trim());
      setMessages(prev => [...prev, newMsg]);
      setChatInput('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert(err.message);
    }
  };

  const triggerReaction = (emoji) => {
    const id = Date.now() + Math.random();
    setFloatingEmojis(prev => [...prev, { id, emoji, left: Math.floor(Math.random() * 70) + 15 }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(item => item.id !== id));
    }, 2000);
  };

  const handleSendTip = async () => {
    if (!selectedLive) return;
    setIsProcessingTip(true);
    try {
      await apiSendLiveTip(selectedLive.id, {
        amount_cfa: parseFloat(tipAmount),
        payment_method: tipMethod
      });
      setIsTipping(false);
      setTipSuccessMsg(`✨ Don de ${parseFloat(tipAmount).toLocaleString('fr-FR')} F CFA envoyé avec succès !`);
      setTimeout(() => setTipSuccessMsg(null), 4000);
      // Reload detail and messages
      const msgs = await apiGetLiveMessages(selectedLive.id);
      setMessages(msgs);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessingTip(false);
    }
  };

  const handleBuyTicket = async () => {
    if (!selectedLive) return;
    setIsPurchasingTicket(true);
    try {
      await apiPurchaseLiveTicket(selectedLive.id, {
        payment_method: ticketMethod,
        phone_number: '+2250700000001'
      });
      // Refresh detail
      const detail = await apiGetLiveDetail(selectedLive.id);
      setLiveDetail(detail);
      alert("🎉 Billet validé avec succès ! Bon direct !");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsPurchasingTicket(false);
    }
  };

  const hasAccess = liveDetail ? liveDetail.has_access : false;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Toast Notification de Don */}
      {tipSuccessMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white text-xs font-black px-5 py-3 rounded-full shadow-glow-emerald flex items-center gap-2.5 animate-bounce border border-emerald-400/40">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{tipSuccessMsg}</span>
        </div>
      )}

      {/* Liste des Lives disponibles (Tabs en haut) */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {lives.map(l => (
          <button
            key={l.id}
            onClick={() => setSelectedLive(l)}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all flex-shrink-0 text-left ${
              selectedLive?.id === l.id
                ? 'bg-rose-500/15 border-rose-500/40 shadow-glow-orange'
                : 'bg-[#14141E] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gray-800 overflow-hidden flex items-center justify-center">
                <Radio className="w-6 h-6 text-rose-500 animate-pulse" />
              </div>
              {l.status === 'LIVE' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping"></span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  l.status === 'LIVE' ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 text-gray-300'
                }`}>
                  {l.status === 'LIVE' ? 'En Direct' : l.status === 'ENDED' ? 'Replay 48h' : 'Programmé'}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">
                  {l.access_type === 'FREE' ? 'Gratuit' : l.access_type === 'PPV' ? `${l.ticket_price_cfa} F` : 'VIP'}
                </span>
              </div>
              <p className="text-xs font-extrabold text-white mt-1 max-w-[180px] truncate">
                {l.title}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Live Stream Main Screen */}
      {!selectedLive ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-gray-400 text-xs">
          Aucun live disponible actuellement. Revenez très bientôt !
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Lecteur Vidéo & Interactions (2 Colonnes) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-white/15 shadow-2xl flex flex-col justify-between p-4">
              
              {/* Emojis flottants de réaction */}
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {floatingEmojis.map(item => (
                  <div
                    key={item.id}
                    className="absolute bottom-6 text-3xl animate-bounce"
                    style={{ left: `${item.left}%`, animationDuration: '1.8s' }}
                  >
                    {item.emoji}
                  </div>
                ))}
              </div>

              {/* Watermark DRM Anti-Piratage */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-20 text-[11px] font-mono font-black text-white/50 rotate-[-15deg] select-none text-center">
                CDAR SECURE STREAM • {currentFan?.id?.slice(0, 8)} • PROTÉGÉ PAR DRM
              </div>

              {/* Contenu Vidéo ou Écran de Verrouillage */}
              {hasAccess ? (
                <>
                  {/* Flux Vidéo Simulé HD */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000"
                      alt="Concert Live Stream"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50"></div>
                  </div>

                  {/* Top Bar Player */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-red-600 text-white animate-pulse shadow-glow-orange">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        EN DIRECT
                      </span>

                      <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white flex items-center gap-1.5 border border-white/10">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{liveDetail?.current_viewers || 1} spectateurs</span>
                      </span>
                    </div>

                    <button
                      onClick={() => setIsTipping(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-glow-orange hover:scale-105 transition-transform"
                    >
                      <Gift className="w-4 h-4 fill-slate-950" />
                      <span>Envoyer un Pourboire</span>
                    </button>
                  </div>

                  {/* Bottom Bar Player */}
                  <div className="relative z-10 flex items-end justify-between">
                    <div>
                      <h2 className="text-white font-black text-base sm:text-lg drop-shadow-md">
                        {selectedLive.title}
                      </h2>
                      <p className="text-gray-300 text-xs mt-0.5 line-clamp-1">
                        {selectedLive.description || "Diffusion exclusive en direct"}
                      </p>
                    </div>

                    {/* Boutons de réactions rapides */}
                    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                      {[
                        { emoji: '❤️', label: 'Cœur' },
                        { emoji: '🔥', label: 'Flamme' },
                        { emoji: '👏', label: 'Bravo' },
                        { emoji: '🎵', label: 'Musique' },
                      ].map(r => (
                        <button
                          key={r.label}
                          onClick={() => triggerReaction(r.emoji)}
                          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm hover:scale-125 transition-transform active:scale-95"
                          title={r.label}
                        >
                          {r.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* ÉCRAN DE VERROUILLAGE SÉCURISÉ */
                <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#121016] via-[#16121D] to-black flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-glow-orange">
                    <Lock className="w-8 h-8" />
                  </div>

                  <div className="max-w-md space-y-2">
                    <h3 className="text-lg font-black text-white">
                      {selectedLive.access_type === 'SUBSCRIBERS' 
                        ? "Direct Réservé aux Membres VIP" 
                        : "Billet d'Accès Pay-Per-View Requis"}
                    </h3>
                    <p className="text-xs text-gray-300">
                      {selectedLive.access_type === 'SUBSCRIBERS'
                        ? "Ce direct intimiste est réservé aux abonnés du Club VIP ou Super Fan. Rejoignez les abonnés pour y accéder et poser vos questions."
                        : `Ce live est un événement exclusif à la carte au tarif de ${selectedLive.ticket_price_cfa?.toLocaleString('fr-FR')} F CFA.`}
                    </p>
                  </div>

                  {selectedLive.access_type === 'SUBSCRIBERS' ? (
                    <button
                      onClick={onOpenSubscriptionModal}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs shadow-glow-purple hover:scale-105 transition-transform"
                    >
                      💎 Rejoindre le Club VIP pour Débloquer
                    </button>
                  ) : (
                    <div className="w-full max-w-sm space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex justify-between text-xs font-bold text-gray-200">
                        <span>Prix du ticket :</span>
                        <span className="text-amber-400 font-black">{selectedLive.ticket_price_cfa?.toLocaleString('fr-FR')} F CFA</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {['wave', 'orange_money', 'mtn'].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setTicketMethod(m)}
                            className={`py-2 px-1 text-[11px] font-bold rounded-lg border capitalize ${
                              ticketMethod === m 
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' 
                                : 'bg-black/30 text-gray-400 border-white/10'
                            }`}
                          >
                            {m.replace('_', ' ')}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleBuyTicket}
                        disabled={isPurchasingTicket}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-glow-orange hover:brightness-110 flex items-center justify-center gap-2"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>{isPurchasingTicket ? 'Validation du paiement...' : 'Acheter mon Billet Mobile Money'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description & Infos additionnelles */}
            <div className="p-4 bg-white dark:bg-[#14141E] rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 shadow-sm dark:shadow-none transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
                  Référence : <span className="font-mono text-slate-900 dark:text-white">{selectedLive.reference}</span>
                </span>
                <span className="text-xs text-amber-500 dark:text-amber-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  Flux Officiel Certifié
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-300">
                {selectedLive.description || "Profitez de cette session exclusive en direct sur CDAR."}
              </p>
            </div>
          </div>

          {/* Chat Interactif Fan (1 Colonne) */}
          <div className="bg-white dark:bg-[#14141E] rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col h-[520px] shadow-lg dark:shadow-2xl overflow-hidden transition-colors">
            
            {/* Header Chat */}
            <div className="p-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-black/20">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Chat en Direct</h4>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-gray-400 font-medium">
                {messages.length} messages
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-xs py-12">
                  Soyez le premier à commenter ce direct !
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`p-2.5 rounded-xl text-xs space-y-1 transition-all ${
                      msg.is_tip_notification
                        ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 text-amber-200 shadow-glow-orange'
                        : msg.author_role === 'artist'
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-200'
                        : 'bg-white/5 border border-white/5 text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[11px] text-white">
                          {msg.author_name}
                        </span>

                        {msg.author_role === 'artist' && (
                          <span className="text-[9px] bg-rose-500 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                            Artiste
                          </span>
                        )}

                        {msg.author_tier === 'vip' && (
                          <span className="text-[9px] bg-purple-500/30 text-purple-300 font-bold px-1.5 py-0.2 rounded-full border border-purple-500/40">
                            💎 VIP
                          </span>
                        )}

                        {msg.author_tier === 'super_fan' && (
                          <span className="text-[9px] bg-amber-500/30 text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-500/40">
                            ⭐ Super Fan
                          </span>
                        )}
                      </div>

                      <span className="text-[9px] text-gray-500">
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className={`text-[11px] ${msg.is_tip_notification ? 'font-black text-amber-300' : 'text-gray-300'}`}>
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input d'envoi */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex gap-2">
              <input
                type="text"
                placeholder={hasAccess ? "Envoyer un message..." : "Accès requis pour chatter"}
                disabled={!hasAccess}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-rose-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!hasAccess || !chatInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white font-black text-xs flex items-center justify-center hover:brightness-110 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pourboire Live Stream */}
      {isTipping && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14141E] border border-amber-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                Envoyer un Pourboire en Direct
              </h3>
              <button 
                onClick={() => setIsTipping(false)}
                className="text-gray-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Soutenez l'artiste pendant sa prestation. Votre don apparaîtra en surbrillance dans le live !
            </p>

            <div className="grid grid-cols-4 gap-2">
              {['500', '1000', '2500', '5000'].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTipAmount(amt)}
                  className={`py-2 text-xs font-black rounded-xl border transition-all ${
                    tipAmount === amt
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-glow-orange'
                      : 'bg-black/30 border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  {amt} F
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {['orange_money', 'wave', 'mtn'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTipMethod(m)}
                  className={`py-2 px-1 text-[10px] font-bold rounded-lg border capitalize ${
                    tipMethod === m
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-white/10 bg-black/20 text-gray-400'
                  }`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsTipping(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSendTip}
                disabled={isProcessingTip}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-glow-orange"
              >
                {isProcessingTip ? 'Envoi...' : 'Envoyer le Don'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

