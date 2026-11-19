import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Mic, Play, Pause, Send, ShieldCheck, 
  Sparkles, UserCheck, Flame, Heart, Clock, CheckCheck, ChevronLeft 
} from 'lucide-react';
import { 
  apiGetConversations, apiGetConversationMessages, apiSendDirectMessage 
} from '../../api';

export default function ArtistVipInbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Voice note simulator
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  const messagesEndRef = useRef(null);

  // Fetch conversations
  const loadConversations = async () => {
    try {
      const data = await apiGetConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConvo) {
        setSelectedConvo(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Fetch messages when selected convo changes
  useEffect(() => {
    if (!selectedConvo) return;

    const fetchMsgs = async () => {
      try {
        const msgs = await apiGetConversationMessages(selectedConvo.id);
        setMessages(msgs);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 4000);
    return () => clearInterval(interval);
  }, [selectedConvo?.id]);

  // Recording timer
  useEffect(() => {
    let timer;
    if (isRecordingVoice) {
      timer = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || !selectedConvo) return;

    try {
      const sent = await apiSendDirectMessage(selectedConvo.fan_id, {
        content: textInput.trim(),
        is_voice_note: false
      });
      setTextInput('');
      setMessages(prev => [...prev, sent]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendVoiceNote = async () => {
    if (!selectedConvo) return;
    setIsRecordingVoice(false);
    try {
      const sent = await apiSendDirectMessage(selectedConvo.fan_id, {
        content: `Note vocale artiste (${recordDuration || 6}s)`,
        is_voice_note: true,
        voice_url: "https://assets.cdar.ci/audio/voice-sample-artist.mp3",
        duration_seconds: recordDuration || 6
      });
      setMessages(prev => [...prev, sent]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickResponse = (text) => {
    setTextInput(text);
  };

  const toggleAudio = (msgId) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => setPlayingAudioId(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Boîte VIP */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-[#1E1428] via-[#16121F] to-[#12121E] border border-purple-500/25 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-40 bg-purple-500/15 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
                <MessageSquare className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Messagerie Directe VIP & Super Fans
              </h2>
            </div>
            <p className="text-xs text-gray-300 mt-1 max-w-xl">
              Fidélisez votre cercle le plus engagé. Répondez par notes vocales authentiques et messages directs à vos abonnés payants.
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{conversations.length} Abonnés VIP connectés</span>
          </span>
        </div>
      </div>

      {/* Interface Inbox (2 Colonnes avec navigation fluide mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Colonne Gauche: Liste des Abonnés VIP */}
        <div className={`glass-panel rounded-3xl border border-slate-200 dark:border-white/10 p-3 h-[560px] flex-col shadow-2xl overflow-hidden bg-white/80 dark:bg-[#14141E] ${
          selectedConvo ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-2 pb-3 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Conversations Privées
            </span>
            <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pt-2 space-y-1.5 no-scrollbar">
            {conversations.length === 0 ? (
              <div className="text-center text-slate-400 dark:text-gray-500 text-xs py-16 px-4">
                Aucune conversation active pour le moment. Vos abonnés VIP apparaîtront dès leur premier message.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConvo(c)}
                  className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 ${
                    selectedConvo?.id === c.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 shadow-glow-purple'
                      : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-white font-black text-xs">
                      {c.fan_name?.slice(0, 2).toUpperCase() || 'FN'}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-black"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {c.fan_name}
                      </p>
                      <span className="text-[9px] text-purple-600 dark:text-purple-300 font-bold">
                        💎 {c.fan_tier?.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate mt-0.5">
                      {c.last_message || "Nouvelle conversation"}
                    </p>

                    <p className="text-[9px] text-slate-400 dark:text-gray-500 mt-1">
                      {new Date(c.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Colonne Droite: Espace de discussion */}
        <div className={`md:col-span-2 glass-panel rounded-3xl border border-slate-200 dark:border-white/10 flex-col h-[560px] shadow-2xl overflow-hidden bg-white/80 dark:bg-[#14141E] ${
          selectedConvo ? 'flex' : 'hidden md:flex'
        }`}>
          {!selectedConvo ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 text-xs p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-gray-600 mb-2" />
              Sélectionnez une conversation VIP pour échanger
            </div>
          ) : (
            <>
              {/* Header discussion avec bouton retour mobile */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSelectedConvo(null)}
                    className="md:hidden p-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-300 transition-colors"
                    title="Retour aux conversations"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                    {selectedConvo.fan_name?.slice(0, 2).toUpperCase() || 'FN'}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{selectedConvo.fan_name}</h4>
                    <p className="text-[10px] text-purple-600 dark:text-purple-300 font-bold">
                      Abonné Actif • {selectedConvo.fan_tier?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Abonnement vérifié
                  </span>
                </div>
              </div>

              {/* Raccourcis de réponses rapides Artiste */}
              <div className="px-4 py-2 border-b border-white/5 bg-black/30 flex gap-2 overflow-x-auto no-scrollbar">
                {[
                  "Merci pour la force infinie ! 🔥",
                  "Le nouvel extrait arrive très vite 🎶",
                  "Ravi de t'avoir dans le cercle VIP 💎",
                  "Passe en loges au prochain show !"
                ].map((resp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickResponse(resp)}
                    className="text-[10px] text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1 flex-shrink-0 transition-colors"
                  >
                    {resp}
                  </button>
                ))}
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-xs py-16">
                    Aucun message. Envoyez votre premier mot ou mémo vocal.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isArtist = msg.author_role === 'artist';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isArtist ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div
                          className={`max-w-[78%] p-3 rounded-2xl text-xs space-y-1.5 ${
                            isArtist
                              ? 'bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-br-none shadow-glow-orange'
                              : 'bg-[#1E1E2C] text-gray-100 rounded-bl-none border border-white/10'
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-wider block ${
                            isArtist ? 'text-amber-200' : 'text-purple-300'
                          }`}>
                            {isArtist ? "Vous (Artiste)" : selectedConvo.fan_name}
                          </span>

                          {/* Rendu Note Vocale */}
                          {msg.is_voice_note ? (
                            <div className="flex items-center gap-3 py-1">
                              <button
                                onClick={() => toggleAudio(msg.id)}
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
                                  <span className="w-1 bg-white/85 rounded-full h-full animate-pulse"></span>
                                </div>
                                <span className="text-[9px] opacity-80 font-mono">
                                  {msg.duration_seconds || 5}s • Note vocale
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          )}

                          <div className={`text-[9px] text-right flex items-center justify-end gap-1 ${
                            isArtist ? 'text-amber-100' : 'text-gray-400'
                          }`}>
                            <span>{new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            {isArtist && <CheckCheck className="w-3 h-3 text-amber-200" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input & Note Vocale */}
              <div className="p-3 border-t border-white/10 bg-black/40">
                {isRecordingVoice ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                      <span className="font-mono font-black text-rose-300">
                        Enregistrement Vocal... 00:{recordDuration.toString().padStart(2, '0')}
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
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs"
                      >
                        Envoyer Mémo
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Répondre personnellement à cet abonné VIP..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-rose-500"
                    />

                    <button
                      type="button"
                      onClick={() => setIsRecordingVoice(true)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-rose-400 hover:border-rose-500/40 transition-all"
                      title="Enregistrer une note vocale"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <button
                      type="submit"
                      disabled={!textInput.trim()}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white font-black text-xs hover:brightness-110 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

