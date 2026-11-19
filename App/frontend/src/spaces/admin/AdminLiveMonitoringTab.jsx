import React, { useState, useEffect } from 'react';
import { 
  Radio, ShieldAlert, AlertTriangle, Users, DollarSign, MessageSquare, 
  Play, Square, ShieldCheck, Flame, Bell, X, Send, EyeOff, CheckCircle, 
  RefreshCw, Clock, ArrowRight, CornerDownRight 
} from 'lucide-react';
import { apiGetAdminLives, apiInterveneLive } from '../../api';

export default function AdminLiveMonitoringTab() {
  const [lives, setLives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [processingLiveId, setProcessingLiveId] = useState(null);

  // Modale d'avertissement chat
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [targetLive, setTargetLive] = useState(null);
  const [customWarningText, setCustomWarningText] = useState('');

  const loadLives = async () => {
    setLoading(true);
    try {
      const data = await apiGetAdminLives();
      setLives(data || []);
    } catch (err) {
      console.error("Erreur chargement lives admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLives();
    // Rafraîchissement automatique de télémétrie toutes les 15 secondes
    const interval = setInterval(loadLives, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleIntervene = async (liveId, action, warningMsg = '') => {
    setProcessingLiveId(liveId);
    try {
      await apiInterveneLive(liveId, {
        action: action,
        warning_message: warningMsg
      });
      setActionSuccess(`Action de modération '${action}' exécutée avec succès sur le live.`);
      setWarningModalOpen(false);
      setCustomWarningText('');
      loadLives();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert("Erreur intervention live: " + err.message);
    } finally {
      setProcessingLiveId(null);
    }
  };

  // Compteurs
  const activeLives = lives.filter(l => l.status === 'live');
  const totalViewers = activeLives.reduce((acc, l) => acc + (l.current_viewers || 0), 0);
  const totalTips = activeLives.reduce((acc, l) => acc + (l.total_tips_cfa || 0), 0);
  const sensitiveOrFlaggedLives = lives.filter(l => l.sensitivity_status !== 'safe' || l.is_interrupted);

  const getSensitivityBadge = (live) => {
    if (live.is_interrupted) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-md">
          <Square className="w-3 h-3 fill-white" /> Interrompu d'Urgence
        </span>
      );
    }
    switch (live.sensitivity_status) {
      case 'high_risk':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            <AlertTriangle className="w-3 h-3" /> Risque Critique
          </span>
        );
      case 'sensitive':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <EyeOff className="w-3 h-3" /> Restreint (+18 ans)
          </span>
        );
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3" /> Signalé / Surveillance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" /> Flux Conforme
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Alerte toast d'action */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/10 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 2. Tableau de Bord de Surveillance (KPIs en Temps Réel) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lives Actifs */}
        <div className="bg-white/80 dark:bg-[#161624] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lives en Direct</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <p className="text-3xl font-black text-rose-500 mt-2 flex items-center gap-2">
            <Radio className="w-7 h-7 animate-pulse" />
            <span>{activeLives.length}</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Diffusions surveillées en direct</p>
        </div>

        {/* Spectateurs en direct */}
        <div className="bg-white/80 dark:bg-[#161624] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Spectateurs Connectés</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2 flex items-center gap-2">
            <Users className="w-7 h-7 text-sky-400" />
            <span>{totalViewers}</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Audience cumulée temps réel</p>
        </div>

        {/* Tips en direct */}
        <div className="bg-white/80 dark:bg-[#161624] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pourboires Lives</span>
          <p className="text-2xl font-black text-[#FF7A00] mt-2">
            {totalTips.toLocaleString('fr-FR')} <span className="text-xs font-bold">F CFA</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Volume de dons directs collectés</p>
        </div>

        {/* Alertes de Sensibilité */}
        <div className="bg-white/80 dark:bg-[#161624] border border-purple-500/30 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Surveillance Sensible</span>
          <p className="text-3xl font-black text-purple-300 mt-2 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-purple-400" />
            <span>{sensitiveOrFlaggedLives.length}</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Lives soumis à restrictions</p>
        </div>
      </div>

      {/* 3. Liste des Lives sous Surveillance */}
      <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
              <span>Console de Surveillance des Directs & Modération Immédiate</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Supervisez les interactions du chat, les images diffusées et appliquez les sanctions d'urgence en un clic.
            </p>
          </div>
          <button
            onClick={loadLives}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-gray-500 bg-slate-50 dark:bg-[#12121A] rounded-2xl">
            Connexion aux serveurs de streaming et analyse du chat en direct...
          </div>
        ) : lives.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            Aucun live stream répertorié sur la plateforme actuellement.
          </div>
        ) : (
          <div className="space-y-4">
            {lives.map((live) => (
              <div
                key={live.id}
                className={`bg-white dark:bg-[#181828] border rounded-3xl p-5 shadow-lg transition-all ${
                  live.status === 'live'
                    ? 'border-rose-500/40 shadow-rose-950/20'
                    : 'border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Gauche : Infos Live & Artiste */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="relative">
                      <img
                        src={live.artist_avatar}
                        alt={live.artist_name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-white/10 flex-shrink-0"
                      />
                      {live.status === 'live' && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{live.title}</span>
                        {getSensitivityBadge(live)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Par <strong className="text-slate-900 dark:text-white">{live.artist_name}</strong> • Catégorie : {live.artist_category} • Accès : <strong className="uppercase">{live.access_type}</strong>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 font-mono">
                        <span>Réf: {live.reference}</span>
                        {live.started_at && (
                          <span>Lancé le : {new Date(live.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Centre : Télémétrie en direct */}
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#10101C] p-3 rounded-2xl border border-slate-200 dark:border-white/5 self-start lg:self-center">
                    <div className="text-center px-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Spectateurs</span>
                      <p className="text-base font-black text-sky-400 flex items-center justify-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{live.current_viewers}</span>
                      </p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                    <div className="text-center px-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Pourboires</span>
                      <p className="text-base font-black text-orange-400">
                        {live.total_tips_cfa.toLocaleString('fr-FR')} F
                      </p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                    <div className="text-center px-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Chat</span>
                      <p className="text-base font-black text-purple-400 flex items-center justify-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{live.chat_messages_count}</span>
                      </p>
                    </div>
                  </div>

                  {/* Droite : Boutons d'Action & Sanction Admin */}
                  <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                    {/* Alerte / Avertissement officiel */}
                    <button
                      disabled={processingLiveId === live.id}
                      onClick={() => {
                        setTargetLive(live);
                        setCustomWarningText("Veuillez modérer vos propos et respecter la charte de diffusion CDAR.");
                        setWarningModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Diffuser Alerte</span>
                    </button>

                    {/* Basculer Sensible +18 */}
                    {live.sensitivity_status !== 'sensitive' && (
                      <button
                        disabled={processingLiveId === live.id}
                        onClick={() => handleIntervene(live.id, 'set_sensitive', 'Diffusion restreinte +18 ans.')}
                        className="px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Mode +18</span>
                      </button>
                    )}

                    {/* Certifier Safe */}
                    {live.sensitivity_status !== 'safe' && (
                      <button
                        disabled={processingLiveId === live.id}
                        onClick={() => handleIntervene(live.id, 'set_safe')}
                        className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Certifier Conforme</span>
                      </button>
                    )}

                    {/* Interruption d'urgence (si live actif) */}
                    {live.status === 'live' && (
                      <button
                        disabled={processingLiveId === live.id}
                        onClick={() => {
                          if (window.confirm(`⚠️ ATTENTION : Êtes-vous certain de vouloir INTERROMPRE IMMÉDIATEMENT le direct de ${live.artist_name} ? Le flux vidéo sera coupé net.`)) {
                            handleIntervene(live.id, 'interrupt', 'Direct interrompu d\'urgence par l\'administration CDAR pour manquement grave.');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Coupure d'Urgence</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Radar du Chat en direct & Avertissements */}
                {live.recent_chat_sample && live.recent_chat_sample.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-purple-400" />
                      <span>Échantillon du chat en direct (Surveillance temps réel)</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {live.recent_chat_sample.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#101018] border border-slate-200 dark:border-white/5 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <strong className="text-slate-900 dark:text-white">{m.user_name}</strong>
                            <span className="text-gray-500">{new Date(m.created_at).toLocaleTimeString('fr-FR', { minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-600 dark:text-gray-300 line-clamp-1">{m.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. MODALE D'ÉMISSION D'AVERTISSEMENT OFFICIEL */}
      {warningModalOpen && targetLive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-[#161624] border border-slate-200 dark:border-white/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Avertissement Officiel Modération</h4>
              </div>
              <button
                onClick={() => setWarningModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Ce message sera diffusé avec le badge <strong>Modération CDAR</strong> épinglé en tête du chat du direct de <strong className="text-white">{targetLive.artist_name}</strong>.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1.5">Texte de l'avertissement</label>
              
              {/* Presets rapides d'avertissement */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  "Propos inappropriés signalés",
                  "Tenue non conforme à la charte CDAR",
                  "Avertissement officiel avant interruption du live",
                  "Respectez les règles de diffusion communautaire"
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomWarningText(preset)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-all"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={customWarningText}
                onChange={(e) => setCustomWarningText(e.target.value)}
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWarningModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-gray-400 text-xs font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={processingLiveId === targetLive.id}
                onClick={() => handleIntervene(targetLive.id, 'send_warning', customWarningText)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer l'Alerte au Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
