import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Eye, EyeOff, Ban, CheckCircle, 
  Trash2, Search, Filter, AlertCircle, Clock, Film, Music, Image, 
  FileText, ExternalLink, X, RefreshCw, Sparkles, MessageSquare, Tag
} from 'lucide-react';
import { apiGetAdminPosts, apiModeratePost, apiDeletePostAdmin } from '../../api';

export default function AdminContentModerationTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all'); // all | pending_review | flagged | sensitive | blocked | safe
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null); // Modale de détail
  const [actionSuccess, setActionSuccess] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [revealSensitive, setRevealSensitive] = useState({}); // toggle blur par post

  // États pour la modale de modération
  const [modalReason, setModalReason] = useState('Tenue suggestive / Sensible (+18)');
  const [modalNote, setModalNote] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await apiGetAdminPosts({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchQuery || undefined
      });
      setPosts(data || []);
    } catch (err) {
      console.error("Erreur chargement posts admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPosts();
  };

  const handleModerate = async (postId, status, reason, isBlocked = false, note = '') => {
    setProcessingId(postId);
    try {
      await apiModeratePost(postId, {
        sensitivity_status: status,
        sensitivity_reason: reason,
        is_blocked: isBlocked,
        is_published: !isBlocked,
        moderation_note: note
      });
      setActionSuccess(`Contenu mis à jour avec le statut : ${status.toUpperCase()}`);
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(null);
      }
      loadPosts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert("Erreur de modération: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeletePost = async (postId, ref) => {
    if (!window.confirm(`Confirmez-vous la suppression définitive du contenu ${ref} ?`)) return;
    setProcessingId(postId);
    try {
      await apiDeletePostAdmin(postId);
      setActionSuccess(`Le contenu ${ref} a été supprimé définitivement.`);
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(null);
      }
      loadPosts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert("Erreur lors de la suppression: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Compteurs par statut
  const countPending = posts.filter(p => p.sensitivity_status === 'pending_review').length;
  const countFlagged = posts.filter(p => p.sensitivity_status === 'flagged' || (p.reported_count && p.reported_count > 0)).length;
  const countSensitive = posts.filter(p => p.sensitivity_status === 'sensitive').length;
  const countBlocked = posts.filter(p => p.is_blocked).length;

  const getStatusBadge = (post) => {
    if (post.is_blocked) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <Ban className="w-3 h-3" /> Bloqué / Censuré
        </span>
      );
    }
    switch (post.sensitivity_status) {
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <AlertTriangle className="w-3 h-3" /> Signalé ({post.reported_count || 1})
          </span>
        );
      case 'sensitive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <EyeOff className="w-3 h-3" /> Sensible (+18)
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/40">
            <Clock className="w-3 h-3" /> Examen en cours
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" /> Conforme / Tout Public
          </span>
        );
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Film className="w-3.5 h-3.5 text-rose-400" />;
      case 'music': return <Music className="w-3.5 h-3.5 text-amber-400" />;
      case 'photo': return <Image className="w-3.5 h-3.5 text-purple-400" />;
      default: return <FileText className="w-3.5 h-3.5 text-cyan-400" />;
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

      {/* 2. Barre d'outils & Filtres de Statut */}
      <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>Gestion & Vérification des Contenus Sensibles</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Contrôlez les flux, traitez les signalements communautaires et appliquez les restrictions de sensibilité.
            </p>
          </div>

          {/* Recherche */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher titre, artiste, motif..."
                className="pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 w-56 sm:w-64 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); loadPosts(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs p-0.5"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-gray-200 text-xs font-bold transition-all"
            >
              Filtrer
            </button>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedStatus('all'); loadPosts(); }}
              title="Rafraîchir"
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Pilules de Statut (Défilement fluide) */}
        <div className="flex items-center gap-2 pt-3 pb-1 border-t border-slate-100 dark:border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${
              selectedStatus === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-white'
            }`}
          >
            <span>Tous ({posts.length})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('flagged')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${
              selectedStatus === 'flagged'
                ? 'bg-amber-500 text-black shadow-md font-black'
                : 'bg-slate-100 dark:bg-white/5 text-amber-500 dark:text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Signalés ({countFlagged})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('sensitive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${
              selectedStatus === 'sensitive'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-white/5 text-purple-500 dark:text-purple-300 hover:bg-purple-500/10'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Sensibles +18 ({countSensitive})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('pending_review')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${
              selectedStatus === 'pending_review'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-white/5 text-sky-500 dark:text-sky-300 hover:bg-sky-500/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>En attente ({countPending})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('blocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${
              selectedStatus === 'blocked'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-white/5 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Bloqués ({countBlocked})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('safe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${
              selectedStatus === 'safe'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-white/5 text-emerald-500 dark:text-emerald-300 hover:bg-emerald-500/10'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Conformes Tout Public</span>
          </button>
        </div>
      </div>

      {/* 3. Liste des publications à modérer */}
      {loading ? (
        <div className="text-center py-16 text-xs text-gray-500 bg-white/50 dark:bg-[#12121A] rounded-3xl border border-slate-200 dark:border-white/5">
          Chargement des contenus et analyse de sensibilité...
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white/80 dark:bg-[#12121A] border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">Aucun contenu trouvé</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
            Aucune publication ne correspond à ce filtre de sensibilité ou terme de recherche.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => {
            const isBlurred = (post.sensitivity_status === 'sensitive' || post.sensitivity_status === 'flagged') && !revealSensitive[post.id];

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-[#161624] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Haut de carte : Artiste & Statut */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.artist_avatar}
                        alt={post.artist_name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-white/10"
                      />
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{post.artist_name}</span>
                          <span className="text-[10px] text-gray-400 font-normal">({post.artist_country})</span>
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                          {getContentTypeIcon(post.content_type)}
                          <span className="capitalize">{post.content_type}</span>
                          <span>•</span>
                          <span className="uppercase font-semibold">{post.visibility}</span>
                          {post.price_cfa > 0 && (
                            <span className="text-orange-400 font-bold">({post.price_cfa.toLocaleString('fr-FR')} F)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {getStatusBadge(post)}
                    </div>
                  </div>

                  {/* Vignette média avec Floutage si sensible */}
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/40 border border-slate-200 dark:border-white/5">
                    <img
                      src={post.teaser_media_url || post.media_url}
                      alt={post.title}
                      className={`w-full h-full object-cover transition-all duration-300 ${isBlurred ? 'blur-md brightness-75 scale-105' : ''}`}
                    />
                    
                    {/* Overlay si flouté */}
                    {isBlurred && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                        <EyeOff className="w-8 h-8 text-amber-400 mb-2" />
                        <span className="text-xs font-bold text-white">Contenu à Sensibilité Restreinte</span>
                        <span className="text-[10px] text-gray-300 mt-0.5">{post.sensitivity_reason || "Classé sensible"}</span>
                        <button
                          onClick={() => setRevealSensitive(prev => ({ ...prev, [post.id]: true }))}
                          className="mt-3 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Dévoiler pour inspection</span>
                        </button>
                      </div>
                    )}

                    {/* Badge type et reference */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl text-white">
                      <span className="font-mono text-gray-300">{post.reference}</span>
                      <span>{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Titre & Description */}
                  <div>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">{post.title}</h5>
                    {post.caption && (
                      <p className="text-[11px] text-slate-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                        {post.caption}
                      </p>
                    )}
                  </div>

                  {/* Alerte motif de sensibilité ou signalement */}
                  {post.sensitivity_reason && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                      <Tag className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <strong>Motif de sensibilité :</strong> {post.sensitivity_reason}
                        {post.moderation_note && (
                          <p className="text-[10px] text-gray-400 mt-1 italic">Note modération : "{post.moderation_note}"</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Boutons d'Action Rapide de Modération */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Marquer Conforme */}
                    <button
                      disabled={processingId === post.id}
                      onClick={() => handleModerate(post.id, 'safe', 'Validé conforme par modérateur', false)}
                      title="Valider comme Conforme Tout Public"
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Conforme</span>
                    </button>

                    {/* Marquer Sensible (+18) */}
                    <button
                      disabled={processingId === post.id}
                      onClick={() => {
                        setSelectedPost(post);
                        setModalReason(post.sensitivity_reason || 'Tenue suggestive / Sensible (+18)');
                        setModalNote(post.moderation_note || '');
                      }}
                      title="Configurer la Sensibilité (+18 / Floutage)"
                      className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Sensible (+18)</span>
                    </button>

                    {/* Bloquer / Débloquer */}
                    {post.is_blocked ? (
                      <button
                        disabled={processingId === post.id}
                        onClick={() => handleModerate(post.id, 'safe', 'Débloqué par admin', false)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Débloquer</span>
                      </button>
                    ) : (
                      <button
                        disabled={processingId === post.id}
                        onClick={() => handleModerate(post.id, 'blocked', 'Bloqué pour non-respect des règles', true, 'Censuré suite à examen')}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Bloquer</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Bouton d'inspection détaillée */}
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 transition-colors"
                      title="Inspection détaillée"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    {/* Supprimer définitivement */}
                    <button
                      disabled={processingId === post.id}
                      onClick={() => handleDeletePost(post.id, post.reference)}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODALE D'INSPECTION & DÉCISION DE SENSIBILITÉ */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-[#161624] border border-slate-200 dark:border-white/15 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            {/* Header Modale */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Inspection de Modération & Sensibilité</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">ID: {selectedPost.reference}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Média plein écran sans restriction */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Aperçu du média original</span>
              <div className="rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-slate-200 dark:border-white/10">
                <img
                  src={selectedPost.media_url || selectedPost.teaser_media_url}
                  alt={selectedPost.title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Informations du Créateur & Publication */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-[#0E0E16] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
              <div>
                <span className="text-gray-400">Artiste Créateur :</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedPost.artist_name} ({selectedPost.artist_country})</p>
                <p className="text-[10px] text-gray-500">{selectedPost.artist_category}</p>
              </div>
              <div>
                <span className="text-gray-400">Type de Contenu :</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5 uppercase">{selectedPost.content_type} • {selectedPost.visibility}</p>
                <p className="text-[10px] text-gray-500">Signalements reçus : {selectedPost.reported_count || 0}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Titre :</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedPost.title}</p>
                {selectedPost.caption && (
                  <p className="text-[11px] text-gray-400 mt-1">{selectedPost.caption}</p>
                )}
              </div>
            </div>

            {/* Formulaire de Classification de Sensibilité */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" />
                <span>Qualification du motif de sensibilité</span>
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1.5">
                  Motif ou catégorie de sensibilité
                </label>
                <select
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Tenue suggestive / Sensible (+18)">Tenue suggestive / Sensible (+18)</option>
                  <option value="Paroles explicites & Thème adulte">Paroles explicites & Thème adulte</option>
                  <option value="Scène de violence / Armes scéniques">Scène de violence / Armes scéniques</option>
                  <option value="Vérification automatisée droits audio / Copyright">Vérification droits audio / Copyright</option>
                  <option value="Comportement provocateur / Allusions sensibles">Comportement provocateur / Allusions</option>
                  <option value="Contenu conforme / Aucun risque détecté">Contenu conforme / Aucun risque</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1.5">
                  Note d'équipe modération (interne)
                </label>
                <textarea
                  rows={2}
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="Ex : Avertissement transmis à l'artiste, diffusion maintenue avec floutage 18+..."
                  className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Boutons d'Action Décisionnelle */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => handleModerate(selectedPost.id, 'safe', 'Validé conforme tout public', false, modalNote)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Classer Tout Public (Safe)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModerate(selectedPost.id, 'sensitive', modalReason, false, modalNote)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Appliquer Sensible (+18 & Floutage)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModerate(selectedPost.id, 'blocked', modalReason, true, modalNote)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  <span>Bloquer / Censurer</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
