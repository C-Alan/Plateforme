import React, { useState, useEffect } from 'react';
import { 
  Users, Crown, Shield, ShieldAlert, Sparkles, Plus, Check, 
  X, AlertTriangle, MessageSquare, Megaphone, BarChart3, 
  Settings, UserCheck, Flame, Heart, Award, Star, Bell, 
  CheckCircle2, Trash2, Edit3, Send, ChevronRight, Lock, Eye
} from 'lucide-react';
import { 
  apiGetMyCommunity, 
  apiCreateCommunity, 
  apiUpdateCommunitySettings,
  apiCreateCommunityAnnouncement,
  apiDeleteCommunityAnnouncement,
  apiCreateCommunityPoll,
  apiVoteCommunityPoll,
  apiManageCommunityMember 
} from '../../api';

export default function CommunityManager({ currentUser }) {
  const [loading, setLoading] = useState(true);
  const [communityData, setCommunityData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('members'); // 'members' | 'announcements' | 'polls' | 'rules'
  
  // Modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [newAnnouncementModalOpen, setNewAnnouncementModalOpen] = useState(false);
  const [newPollModalOpen, setNewPollModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Alertes de succès
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Formulaire de création
  const [createForm, setCreateForm] = useState({
    name: `Le Cercle ${currentUser?.stage_name || 'Artiste'}`,
    slogan: 'Force, respect et authenticité',
    badge_icon: '👑',
    access_type: 'all_fans',
    description: 'Espace officiel d\'échange privilégié, d\'annonces exclusives et de décisions partagées avec les fans.',
    rules: '1. Respect absolu et bienveillance envers tous les membres.\n2. Pas d\'insultes, pas de spam ni de publicité extérieure.\n3. Soutien actif et respect des œuvres artistiques.',
    welcome_message: 'Bienvenue dans notre communauté officielle ! Vous êtes au cœur du mouvement.'
  });

  // Formulaire d'annonce
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    is_pinned: true
  });

  // Formulaire de sondage
  const [pollForm, setPollForm] = useState({
    question: '',
    options: ['', '']
  });

  // Filtre membres
  const [memberFilter, setMemberFilter] = useState('all');
  const [memberSearch, setMemberSearch] = useState('');

  // Charger la communauté
  const loadCommunity = async () => {
    setLoading(true);
    try {
      const res = await apiGetMyCommunity();
      if (res && res.has_community) {
        setCommunityData(res.community);
      } else {
        setCommunityData(null);
      }
    } catch (err) {
      console.error("Erreur chargement communauté:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunity();
  }, []);

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // 1. Créer la communauté
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    try {
      const res = await apiCreateCommunity(createForm);
      setCommunityData(res.community);
      setCreateModalOpen(false);
      showFeedback("Félicitations ! Votre communauté officielle a été créée avec succès.");
    } catch (err) {
      alert(err.message);
    }
  };

  // 2. Mettre à jour les paramètres
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiUpdateCommunitySettings(communityData);
      setCommunityData(res.community);
      setSettingsModalOpen(false);
      showFeedback("Paramètres de la communauté enregistrés.");
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Publier une annonce
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;
    try {
      await apiCreateCommunityAnnouncement(announcementForm);
      setNewAnnouncementModalOpen(false);
      setAnnouncementForm({ title: '', content: '', is_pinned: true });
      loadCommunity();
      showFeedback("Annonce officielle publiée dans la communauté.");
    } catch (err) {
      alert(err.message);
    }
  };

  // 4. Supprimer une annonce
  const handleDeleteAnnouncement = async (announcementId) => {
    if (!confirm("Voulez-vous vraiment retirer cette annonce ?")) return;
    try {
      await apiDeleteCommunityAnnouncement(announcementId);
      loadCommunity();
      showFeedback("Annonce retirée.");
    } catch (err) {
      alert(err.message);
    }
  };

  // 5. Créer un sondage
  const handlePollSubmit = async (e) => {
    e.preventDefault();
    const validOptions = pollForm.options.filter(o => o.trim().length > 0);
    if (!pollForm.question.trim() || validOptions.length < 2) {
      alert("Veuillez renseigner la question et au moins 2 options.");
      return;
    }
    try {
      await apiCreateCommunityPoll({
        question: pollForm.question,
        options: validOptions
      });
      setNewPollModalOpen(false);
      setPollForm({ question: '', options: ['', ''] });
      loadCommunity();
      showFeedback("Sondage interactif ouvert aux votes !");
    } catch (err) {
      alert(err.message);
    }
  };

  // 6. Voter sur un sondage
  const handleVote = async (pollId, optionId) => {
    try {
      await apiVoteCommunityPoll(pollId, optionId);
      loadCommunity();
      showFeedback("Votre vote a été pris en compte !");
    } catch (err) {
      alert(err.message);
    }
  };

  // 7. Administrer un membre
  const handleMemberAction = async (memberId, payload) => {
    try {
      await apiManageCommunityMember(memberId, payload);
      loadCommunity();
      setSelectedMember(null);
      showFeedback("Action administrative enregistrée.");
    } catch (err) {
      alert(err.message);
    }
  };

  // Filtrer les membres
  const filteredMembers = (communityData?.members || []).filter(m => {
    if (memberFilter === 'moderators' && m.role !== 'moderator') return false;
    if (memberFilter === 'top_fans' && m.role !== 'top_fan') return false;
    if (memberFilter === 'warned' && m.status !== 'warned') return false;
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      return m.name.toLowerCase().includes(q) || (m.role && m.role.toLowerCase().includes(q));
    }
    return true;
  });

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-gray-500">
        Chargement de l'espace communautaire...
      </div>
    );
  }

  // SI L'ARTISTE N'A PAS ENCORE CRÉÉ SA COMMUNAUTÉ
  if (!communityData) {
    return (
      <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-orange-500/20 via-yellow-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FF5500] to-yellow-400 text-white flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/30">
          <Users className="w-10 h-10" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Fondez Votre Communauté Officielle
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300">
            Rassemblez vos fans les plus fidèles dans votre propre fan club. Diffusez des annonces en coulisses, impliquez votre public avec des sondages décisionnaires et nommez des modérateurs parmi vos pairs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-amber-500 font-black">📢 Annonces Privées</span>
            <p className="text-[11px] text-gray-400">Diffusions prioritaires avant les sorties publiques.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-purple-400 font-black">📊 Sondages Décisionnels</span>
            <p className="text-[11px] text-gray-400">Faites voter vos fans sur vos prochains choix artistiques.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-emerald-400 font-black">🛡️ Modération Active</span>
            <p className="text-[11px] text-gray-400">Déléguez des rôles clés à vos ambassadeurs.</p>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-[#FFAA00] hover:from-[#FF4500] hover:to-[#FF9000] text-white font-black text-sm shadow-xl shadow-orange-500/25 active:scale-95 transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Créer mon Fan Club Officiel</span>
        </button>

        {/* MODALE DE CRÉATION */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="relative bg-white dark:bg-[#161624] border border-slate-200 dark:border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-7 space-y-5 text-left max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Création du Fan Club</h3>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Nom de la Communauté *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Slogan / Devise</label>
                  <input
                    type="text"
                    value={createForm.slogan}
                    onChange={(e) => setCreateForm({ ...createForm, slogan: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Émoji / Symbole</label>
                    <select
                      value={createForm.badge_icon}
                      onChange={(e) => setCreateForm({ ...createForm, badge_icon: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="👑">👑 Couronne (Royal)</option>
                      <option value="🔥">🔥 Flamme (Énergie)</option>
                      <option value="🦁">🦁 Lion (Puissance)</option>
                      <option value="⚡">⚡ Éclair (Flow)</option>
                      <option value="💎">💎 Diamant (Élite)</option>
                      <option value="🎵">🎵 Note (Mélodie)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Condition d'Accès</label>
                    <select
                      value={createForm.access_type}
                      onChange={(e) => setCreateForm({ ...createForm, access_type: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="all_fans">Tous les Fans (Libre)</option>
                      <option value="vip_only">Abonnés VIP uniquement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Règles & Charte de la Communauté</label>
                  <textarea
                    rows={3}
                    value={createForm.rules}
                    onChange={(e) => setCreateForm({ ...createForm, rules: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-[11px]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-gray-400 font-bold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-lg shadow-orange-500/20"
                  >
                    Créer la Communauté
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // SI LA COMMUNAUTÉ EST CRÉÉE ET ACTIVE (ESPACE D'ADMINISTRATION COMPLET)
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast d'action */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/10 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 1. Header du Fan Club & Bannière de Notoriété */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-[#1E1712] via-[#16141D] to-[#12121A] border-2 border-orange-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-[#FF7A00]/25 via-pink-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-400 to-yellow-400 text-black flex items-center justify-center text-3xl shadow-xl shadow-orange-500/25 flex-shrink-0">
              {communityData.badge_icon || '👑'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {communityData.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500/20 text-orange-300 border border-orange-500/40">
                  {communityData.access_type === 'vip_only' ? 'VIP ONLY 🔒' : 'OUVERT AUX FANS 🌍'}
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                "{communityData.slogan || 'Club officiel des passionnés'}"
              </p>
              <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2 font-mono">
                <span>{communityData.members_count} membre{communityData.members_count > 1 ? 's' : ''} inscrits</span>
                <span>•</span>
                <span>{communityData.announcements?.length || 0} annonces</span>
                <span>•</span>
                <span>{communityData.polls?.length || 0} sondages</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-gray-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-orange-400" />
              <span>Paramètres Club</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Barre d'outils et Onglets Internes de Gestion */}
      <div className="glass-panel p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
        <div className="flex gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'members', label: `Membres (${communityData.members_count})`, icon: Users },
            { id: 'announcements', label: `Annonces (${communityData.announcements?.length || 0})`, icon: Megaphone },
            { id: 'polls', label: `Sondages (${communityData.polls?.length || 0})`, icon: BarChart3 },
            { id: 'rules', label: 'Charte & Règles', icon: Shield },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-md font-black'
                    : 'text-slate-600 dark:text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CONTENU : ONGLET 1 - MEMBRES & MODÉRATEURS */}
      {activeSubTab === 'members' && (
        <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                <span>Répertoire des Membres & Administration des Rôles</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Gérez les statuts de vos fans, nommez vos modérateurs bénévoles et appliquez les sanctions si nécessaire.
              </p>
            </div>

            {/* Filtres & Recherche */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white w-40 sm:w-48"
              />
              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
              >
                <option value="all">Tous</option>
                <option value="moderators">Modérateurs 🛡️</option>
                <option value="top_fans">Top Fans 🌟</option>
                <option value="warned">Avertis ⚠️</option>
              </select>
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              Aucun membre ne correspond à cette recherche.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredMembers.map((member) => (
                <div key={member.member_id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{member.name}</span>
                        <span className="text-[10px] text-gray-400">({member.country || 'CI'})</span>
                        {member.role === 'moderator' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5" /> Modérateur
                          </span>
                        )}
                        {member.role === 'top_fan' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                            <Star className="w-2.5 h-2.5" /> Top Fan
                          </span>
                        )}
                        {member.status === 'warned' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ⚠️ Averti ({member.warning_count})
                          </span>
                        )}
                        {member.status === 'suspended' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            🚫 Suspendu
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 block">
                        Membre depuis le {new Date(member.joined_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Actions Rapides sur le Membre */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {/* Nommer / Rétrograder Modérateur */}
                    {member.role !== 'moderator' ? (
                      <button
                        onClick={() => handleMemberAction(member.member_id, { role: 'moderator' })}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 text-[11px] font-bold flex items-center gap-1 transition-all"
                        title="Déléguer les droits de modération du fan club"
                      >
                        <Shield className="w-3 h-3 text-purple-400" />
                        <span>Nommer Modo</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMemberAction(member.member_id, { role: 'member' })}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-gray-400 text-[11px] font-bold transition-all"
                        title="Retirer les droits de modérateur"
                      >
                        Rétrograder
                      </button>
                    )}

                    {/* Attribuer Top Fan */}
                    {member.role !== 'top_fan' && (
                      <button
                        onClick={() => handleMemberAction(member.member_id, { role: 'top_fan' })}
                        className="p-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/25 text-xs transition-all"
                        title="Distinguer comme Top Fan du mois"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Avertir */}
                    <button
                      onClick={() => handleMemberAction(member.member_id, { add_warning: true })}
                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 text-xs transition-all"
                      title="Émettre un avertissement officiel"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>

                    {/* Suspendre / Réintégrer */}
                    {member.status === 'suspended' ? (
                      <button
                        onClick={() => handleMemberAction(member.member_id, { status: 'active' })}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[11px] font-bold transition-all"
                      >
                        Réintégrer
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMemberAction(member.member_id, { status: 'suspended' })}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-xs transition-all"
                        title="Suspendre l'accès au club"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. CONTENU : ONGLET 2 - ANNONCES OFFICIELLES */}
      {activeSubTab === 'announcements' && (
        <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-400" />
                <span>Annonces Officielles Épinglées</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Informations prioritaires diffusées exclusivement auprès des membres de votre communauté.
              </p>
            </div>

            <button
              onClick={() => setNewAnnouncementModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvelle Annonce</span>
            </button>
          </div>

          <div className="space-y-3">
            {communityData.announcements?.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                Aucune annonce publiée pour l'instant. Partagez votre première actualité avec vos fans !
              </div>
            ) : (
              communityData.announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#11111A] border border-slate-200 dark:border-white/5 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900 dark:text-white">{ann.title}</span>
                      {ann.is_pinned && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          📌 Épinglé
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                      <span>{new Date(ann.created_at).toLocaleDateString('fr-FR')}</span>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-400 transition-colors"
                        title="Supprimer l'annonce"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. CONTENU : ONGLET 3 - SONDAGES & VOTES DÉCISIONNAIRES */}
      {activeSubTab === 'polls' && (
        <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-yellow-400" />
                <span>Sondages Communautaires & Démocratie Participative</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Impliquez vos fans dans le choix de vos prochains singles, villes de tournée ou visuels.
              </p>
            </div>

            <button
              onClick={() => setNewPollModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer un Sondage</span>
            </button>
          </div>

          <div className="space-y-4">
            {communityData.polls?.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                Aucun sondage en cours. Lancez une consultation pour sonder vos admirateurs !
              </div>
            ) : (
              communityData.polls.map((poll) => {
                const total = poll.total_votes || 1;
                return (
                  <div
                    key={poll.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-[#11111A] border border-slate-200 dark:border-white/5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{poll.question}</span>
                      </h4>
                      <span className="text-[10px] text-gray-400 font-bold bg-white/5 px-2.5 py-1 rounded-full">
                        {poll.total_votes} vote{poll.total_votes > 1 ? 's' : ''} au total
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {poll.options.map((opt) => {
                        const pct = Math.round(((opt.votes || 0) / total) * 100);
                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleVote(poll.id, opt.id)}
                            className="p-3 rounded-xl bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/10 hover:border-yellow-500/50 cursor-pointer transition-all relative overflow-hidden group"
                          >
                            <div
                              className="absolute top-0 bottom-0 left-0 bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-all rounded-xl"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative z-10 flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-black text-gray-400">
                                  {opt.id}
                                </span>
                                <span>{opt.text}</span>
                              </span>
                              <div className="flex items-center gap-2 font-mono text-[11px]">
                                <span className="text-gray-400">{opt.votes || 0} votes</span>
                                <strong className="text-yellow-400 font-bold">{pct}%</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 6. CONTENU : ONGLET 4 - CHARTE & RÈGLES */}
      {activeSubTab === 'rules' && (
        <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Charte de Bonne Conduite & Modération</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Règles officielles applicables à tous les membres de la communauté de {currentUser?.stage_name}.
              </p>
            </div>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-gray-300 text-xs font-bold"
            >
              Modifier
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#101018] border border-slate-200 dark:border-white/5 font-mono text-xs text-slate-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {communityData.rules || "Aucune règle spécifique n'a été rédigée."}
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              En tant qu'administrateur de votre communauté, vous et vos modérateurs êtes garants du respect des lois et de la charte de diffusion CDAR.
            </p>
          </div>
        </div>
      )}

      {/* MODALE : PARAMÈTRES DE LA COMMUNAUTÉ */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative bg-white dark:bg-[#161624] border border-slate-200 dark:border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-400" />
                <span>Paramètres de la Communauté</span>
              </h3>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Nom du Fan Club</label>
                <input
                  type="text"
                  required
                  value={communityData.name}
                  onChange={(e) => setCommunityData({ ...communityData, name: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Slogan / Devise</label>
                <input
                  type="text"
                  value={communityData.slogan || ''}
                  onChange={(e) => setCommunityData({ ...communityData, slogan: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Émoji / Symbole</label>
                  <select
                    value={communityData.badge_icon || '👑'}
                    onChange={(e) => setCommunityData({ ...communityData, badge_icon: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="👑">👑 Couronne</option>
                    <option value="🔥">🔥 Flamme</option>
                    <option value="🦁">🦁 Lion</option>
                    <option value="⚡">⚡ Éclair</option>
                    <option value="💎">💎 Diamant</option>
                    <option value="🎵">🎵 Musique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Condition d'Accès</label>
                  <select
                    value={communityData.access_type || 'all_fans'}
                    onChange={(e) => setCommunityData({ ...communityData, access_type: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="all_fans">Tous les Fans (Libre)</option>
                    <option value="vip_only">Abonnés VIP uniquement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Charte & Règles</label>
                <textarea
                  rows={4}
                  value={communityData.rules || ''}
                  onChange={(e) => setCommunityData({ ...communityData, rules: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-gray-400 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE : NOUVELLE ANNONCE */}
      {newAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative bg-white dark:bg-[#161624] border border-slate-200 dark:border-white/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-400" />
                <span>Publier une Annonce Épinglée</span>
              </h3>
              <button
                onClick={() => setNewAnnouncementModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAnnouncementSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Titre de l'Annonce</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Répétition générale ce vendredi !"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Contenu du message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Partagez les coulisses ou les consignes officielles..."
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-gray-400 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE : NOUVEAU SONDAGE */}
      {newPollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative bg-white dark:bg-[#161624] border border-slate-200 dark:border-white/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-yellow-400" />
                <span>Nouveau Sondage Communautaire</span>
              </h3>
              <button
                onClick={() => setNewPollModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePollSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Question du sondage</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Quel morceau voulez-vous en prochain clip ?"
                  value={pollForm.question}
                  onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-400 font-bold">Options de réponse</label>
                {pollForm.options.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    required={idx < 2}
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...pollForm.options];
                      newOpts[idx] = e.target.value;
                      setPollForm({ ...pollForm, options: newOpts });
                    }}
                    className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                ))}

                {pollForm.options.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setPollForm({ ...pollForm, options: [...pollForm.options, ''] })}
                    className="text-[11px] text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter une option
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPollModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-gray-400 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black shadow-md"
                >
                  Lancer le Sondage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
