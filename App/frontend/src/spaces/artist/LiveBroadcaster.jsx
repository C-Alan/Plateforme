import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, Video, Mic, MicOff, VideoOff, Users, Gift, Sparkles, Send, 
  Play, Square, AlertCircle, Clock, ShieldCheck, Ticket, Flame, Settings2 
} from 'lucide-react';
import { 
  apiGetActiveLives, apiCreateLive, apiStartLive, apiStopLive, 
  apiGetLiveMessages, apiSendLiveMessage 
} from '../../api';

export default function LiveBroadcaster({ onWalletRefresh }) {
  const [lives, setLives] = useState([]);
  const [activeLive, setActiveLive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Broadcaster Media controls
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [liveDuration, setLiveDuration] = useState(0);

  // New Live modal
  const [isCreating, setIsCreating] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAccessType, setFormAccessType] = useState('FREE'); // FREE | SUBSCRIBERS | PPV
  const [formTicketPrice, setFormTicketPrice] = useState('2000');
  const [formMinTier, setFormMinTier] = useState('vip');

  const messagesEndRef = useRef(null);

  // Fetch lives
  const loadLives = async () => {
    try {
      const data = await apiGetActiveLives();
      setLives(data);
      // Select the first live or keep current
      if (data.length > 0) {
        const current = activeLive ? data.find(l => l.id === activeLive.id) || data[0] : data[0];
        setActiveLive(current);
      } else {
        setActiveLive(null);
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

  // Poll chat messages if live is selected
  useEffect(() => {
    if (!activeLive) return;

    const fetchMessages = async () => {
      try {
        const msgs = await apiGetLiveMessages(activeLive.id);
        setMessages(msgs);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeLive?.id]);

  // Live timer when status === 'LIVE'
  useEffect(() => {
    let timer;
    if (activeLive?.status === 'LIVE') {
      timer = setInterval(() => {
        setLiveDuration(prev => prev + 1);
      }, 1000);
    } else {
      setLiveDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeLive?.status]);

  const handleCreateLive = async (e) => {
    e.preventDefault();
    if (!formTitle) return;
    setError(null);

    try {
      const payload = {
        title: formTitle,
        description: formDesc,
        access_type: formAccessType,
        ticket_price_cfa: formAccessType === 'PPV' ? parseFloat(formTicketPrice) : 0,
        min_tier: formAccessType === 'SUBSCRIBERS' ? formMinTier : null,
        stream_url: "https://stream.cdar.ci/live/hls/master.m3u8"
      };

      const created = await apiCreateLive(payload);
      setIsCreating(false);
      setFormTitle('');
      setFormDesc('');
      await loadLives();
      setActiveLive(created);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartLive = async () => {
    if (!activeLive) return;
    try {
      const updated = await apiStartLive(activeLive.id);
      setActiveLive(updated);
      await loadLives();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStopLive = async () => {
    if (!activeLive) return;
    if (!window.confirm("Êtes-vous sûr de vouloir arrêter le Live ? Le flux sera archivé en replay pour 48 heures.")) return;
    try {
      const updated = await apiStopLive(activeLive.id);
      setActiveLive(updated);
      await loadLives();
      if (onWalletRefresh) onWalletRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeLive) return;
    try {
      const newMsg = await apiSendLiveMessage(activeLive.id, chatInput.trim());
      setMessages(prev => [...prev, newMsg]);
      setChatInput('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert(err.message);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-[#1F1212] via-[#1A141A] to-[#12121E] border border-red-500/25 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-rose-500/20 via-orange-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Régie Live & Directs Artiste
              </h2>
            </div>
            <p className="text-xs text-gray-300 mt-1 max-w-xl">
              Diffusez des concerts exclusifs, sessions studio et écoutes privées. Monétisez par billetterie PPV Mobile Money ou réservez l'accès à vos abonnés VIP.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-glow-orange hover:brightness-110 transition-all flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Programmer un Nouveau Live</span>
          </button>
        </div>
      </div>

      {/* Modal Créer un Live */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14141E] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500" />
                Configuration du Live Stream
              </h3>
              <button 
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateLive} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Titre du Live *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Écoute exclusive en avant-première de l'album"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Description / Contexte</label>
                <textarea
                  rows="2"
                  placeholder="Parlez de ce moment unique à vos fans..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1.5">Type d'Accès & Monétisation</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'FREE', title: 'Gratuit', desc: 'Découverte libre' },
                    { id: 'SUBSCRIBERS', title: 'Abonnés VIP', desc: 'Réservé aux membres' },
                    { id: 'PPV', title: 'Pay-Per-View', desc: 'Billet Mobile Money' }
                  ].map(t => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setFormAccessType(t.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        formAccessType === t.id
                          ? 'border-rose-500 bg-rose-500/15 text-white shadow-glow-orange'
                          : 'border-white/10 bg-black/20 text-gray-400 hover:text-white'
                      }`}
                    >
                      <p className="font-extrabold text-[11px]">{t.title}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {formAccessType === 'PPV' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                  <label className="block text-amber-300 font-bold text-xs flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" />
                    Prix du Billet d'Accès (F CFA)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={formTicketPrice}
                    onChange={(e) => setFormTicketPrice(e.target.value)}
                    className="w-full bg-black/60 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-black"
                  />
                  <p className="text-[10px] text-amber-200/70">
                    Les fans règlent instantanément via Wave, Orange Money, MTN ou Moov Money.
                  </p>
                </div>
              )}

              {formAccessType === 'SUBSCRIBERS' && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-2">
                  <label className="block text-purple-300 font-bold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Palier Minimum Requis
                  </label>
                  <select
                    value={formMinTier}
                    onChange={(e) => setFormMinTier(e.target.value)}
                    className="w-full bg-black/60 border border-purple-500/40 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="vip">💎 Club VIP (10 000 F CFA/mois)</option>
                    <option value="super_fan">⭐ Super Fan (5 000 F CFA/mois)</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white font-black shadow-glow-orange"
                >
                  Créer le Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Broadcaster Screen */}
      {!activeLive ? (
        <div className="glass-panel rounded-3xl p-10 sm:p-12 text-center space-y-3 border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#151522]/90 shadow-2xl transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 mx-auto flex items-center justify-center">
            <Radio className="w-7 h-7" />
          </div>
          <h3 className="text-slate-900 dark:text-white font-black text-base">Aucun Live actif ou programmé</h3>
          <p className="text-slate-500 dark:text-gray-400 text-xs max-w-md mx-auto">
            Créez votre première session de diffusion pour interagir en temps réel avec vos fans et recevoir des dons directs.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white text-xs font-black shadow-glow-orange mt-2 hover:brightness-110 active:scale-95 transition-all"
          >
            Créer un Live maintenant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Régie Vidéo & Contrôles (2 Colonnes) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Écran de diffusion simulée */}
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-b from-[#181824] via-[#0E0E16] to-black border border-white/15 shadow-2xl flex flex-col justify-between p-4">
              
              {/* Fond visuel interactif */}
              <div className="absolute inset-0 z-0">
                {isCameraOn ? (
                  <div className="w-full h-full relative">
                    <img
                      src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000"
                      alt="Studio Stream Preview"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60"></div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 space-y-2 bg-[#09090F]">
                    <VideoOff className="w-12 h-12 text-gray-600" />
                    <p className="text-xs font-bold">Caméra Régie Désactivée</p>
                  </div>
                )}
              </div>

              {/* Watermark Régie */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    activeLive.status === 'LIVE'
                      ? 'bg-rose-600 text-white animate-pulse shadow-glow-orange'
                      : activeLive.status === 'ENDED'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    {activeLive.status === 'LIVE' ? 'EN DIRECT' : activeLive.status === 'ENDED' ? 'TERMINÉ (REPLAY 48H)' : 'PROGRAMMÉ'}
                  </span>

                  {activeLive.status === 'LIVE' && (
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono text-white border border-white/10">
                      {formatTimer(liveDuration)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white flex items-center gap-1.5 border border-white/10">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeLive.current_viewers || 0} spectateurs</span>
                  </span>

                  <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span>{(activeLive.total_tips_cfa || 0).toLocaleString('fr-FR')} F CFA</span>
                  </span>
                </div>
              </div>

              {/* Titre et détails bas */}
              <div className="relative z-10 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-extrabold text-sm truncate">{activeLive.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-300 uppercase font-bold">
                      Accès : {activeLive.access_type === 'FREE' ? 'Gratuit Libre' : activeLive.access_type === 'PPV' ? `Billet ${activeLive.ticket_price_cfa} F CFA` : 'Membres VIP'}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-[10px] text-orange-400 font-mono">{activeLive.reference}</span>
                  </div>
                </div>

                {/* Bouton de démarrage / arrêt */}
                {activeLive.status !== 'LIVE' && activeLive.status !== 'ENDED' ? (
                  <button
                    onClick={handleStartLive}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs shadow-glow-orange hover:brightness-110"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Lancer le Direct</span>
                  </button>
                ) : activeLive.status === 'LIVE' ? (
                  <button
                    onClick={handleStopLive}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-700/80 hover:bg-rose-700 text-white font-black text-xs border border-rose-500"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Terminer le Live</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-gray-400 px-3 py-1 bg-white/5 rounded-lg">
                    Replay disponible pendant 48h
                  </span>
                )}
              </div>
            </div>

            {/* Barre de contrôles techniques régie */}
            <div className="p-3.5 glass-panel bg-white/80 dark:bg-[#14141E] rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isCameraOn 
                      ? 'bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20 text-slate-800 dark:text-white' 
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-500'
                  }`}
                  title={isCameraOn ? "Couper la caméra" : "Activer la caméra"}
                >
                  {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isMicOn 
                      ? 'bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20 text-slate-800 dark:text-white' 
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-500'
                  }`}
                  title={isMicOn ? "Couper le micro" : "Activer le micro"}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Statut audio visuel simule */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                <span className="text-[10px] text-slate-600 dark:text-gray-400 font-bold">Niveau Audio :</span>
                <div className="flex items-end gap-0.5 h-3">
                  <div className="w-1 bg-emerald-500 rounded-full h-full animate-pulse"></div>
                  <div className="w-1 bg-emerald-400 rounded-full h-2/3 animate-pulse"></div>
                  <div className="w-1 bg-emerald-500 rounded-full h-5/6 animate-pulse"></div>
                  <div className="w-1 bg-amber-400 rounded-full h-1/2 animate-pulse"></div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">
                Flux Sécurisé CDAR DRM Encrypted
              </div>
            </div>
          </div>

          {/* Chat en direct & Modération (1 Colonne) */}
          <div className="glass-panel bg-white/80 dark:bg-[#14141E] rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col h-[520px] shadow-2xl overflow-hidden transition-colors">
            
            {/* Header Chat */}
            <div className="p-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-black/20">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Discussion En Direct</h4>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5">
                {messages.length} messages
              </span>
            </div>

            {/* Liste des messages du chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-xs py-12">
                  Soyez le premier à saluer la communauté !
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

            {/* Envoi de message Artiste */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/40 flex gap-2">
              <input
                type="text"
                placeholder="Écrire un message en tant qu'artiste..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white font-black text-xs flex items-center justify-center hover:brightness-110"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

