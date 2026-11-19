import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Sparkles, CheckCircle2, ShieldCheck, Camera, Smartphone, 
  Mail, MapPin, Tag, FileText, Lock, Save, ExternalLink, AlertCircle, 
  HelpCircle, Globe, Wallet, UploadCloud, CreditCard, Upload
} from 'lucide-react';
import { apiUpdateProfile } from '../../api';

export default function ArtistProfileSettingsView({ currentUser, onUpdateCurrentUser }) {
  const [formData, setFormData] = useState({
    stage_name: currentUser?.stage_name || '',
    display_name: currentUser?.display_name || '',
    email: currentUser?.email || '',
    phone_number: currentUser?.phone_number || '',
    country: currentUser?.country || 'CI',
    category: currentUser?.category || 'Musique & Rap Ivoire',
    bio: currentUser?.bio || '',
    avatar_url: currentUser?.avatar_url || '',
    banner_url: currentUser?.banner_url || '',
    payout_operator: currentUser?.payout_operator || 'orange_money',
    payout_momo_number: currentUser?.payout_momo_number || '',
    kyc_id_type: currentUser?.kyc_id_type || 'cni',
    kyc_id_document_recto_url: currentUser?.kyc_id_document_recto_url || '',
    kyc_id_document_verso_url: currentUser?.kyc_id_document_verso_url || '',
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const avatarInputRef = useRef(null);
  const idRectoRef = useRef(null);
  const idVersoRef = useRef(null);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatar_url: event.target.result }));
        setSuccessMsg("Photo mise à jour ! Cliquez sur 'Enregistrer les Modifications' pour valider.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdDocChange = (e, fieldKey, docName) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg(`Veuillez sélectionner une image valide pour ${docName} (JPG, PNG, WebP).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, [fieldKey]: event.target.result }));
        setSuccessMsg(`Document ${docName} chargé ! N'oubliez pas d'enregistrer.`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mettre à jour le formulaire si currentUser change
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        stage_name: currentUser.stage_name || '',
        display_name: currentUser.display_name || '',
        email: currentUser.email || '',
        phone_number: currentUser.phone_number || '',
        country: currentUser.country || 'CI',
        category: currentUser.category || 'Musique & Rap Ivoire',
        bio: currentUser.bio || '',
        avatar_url: currentUser.avatar_url || '',
        banner_url: currentUser.banner_url || '',
        payout_operator: currentUser.payout_operator || 'orange_money',
        payout_momo_number: currentUser.payout_momo_number || '',
        kyc_id_type: currentUser.kyc_id_type || 'cni',
        kyc_id_document_recto_url: currentUser.kyc_id_document_recto_url || '',
        kyc_id_document_verso_url: currentUser.kyc_id_document_verso_url || ''
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (formData.new_password) {
      if (!formData.current_password) {
        setErrorMsg("Veuillez renseigner votre mot de passe actuel pour définir un nouveau mot de passe.");
        setLoading(false);
        return;
      }
      if (formData.new_password !== formData.confirm_new_password) {
        setErrorMsg("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        stage_name: formData.stage_name,
        display_name: formData.display_name,
        email: formData.email,
        phone_number: formData.phone_number,
        country: formData.country,
        category: formData.category,
        bio: formData.bio,
        avatar_url: formData.avatar_url || undefined,
        banner_url: formData.banner_url || undefined,
        payout_operator: formData.payout_operator,
        payout_momo_number: formData.payout_momo_number,
        kyc_id_type: formData.kyc_id_type,
        kyc_id_document_recto_url: formData.kyc_id_document_recto_url || undefined,
        kyc_id_document_verso_url: formData.kyc_id_document_verso_url || undefined,
        current_password: formData.current_password || undefined,
        new_password: formData.new_password || undefined
      };

      const updatedUser = await apiUpdateProfile(payload);
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(updatedUser);
      }
      setSuccessMsg("✨ Votre profil et vos coordonnées de versement Mobile Money ont été enregistrés avec succès !");
      setFormData(prev => ({ ...prev, current_password: '', new_password: '', confirm_new_password: '' }));
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de l'enregistrement du profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* 1. Header Profil Radiant */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#24140D] via-[#1C121E] to-[#12121E] border border-orange-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-orange-500/20 via-amber-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="flex items-center space-x-4">
            <div 
              onClick={() => avatarInputRef.current?.click()}
              title="Cliquer pour changer votre photo de profil artiste"
              className="relative group cursor-pointer"
            >
              <img
                src={formData.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                alt={formData.stage_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500/50 shadow-xl group-hover:opacity-75 transition-all group-hover:scale-105"
              />
              {/* Overlay au survol */}
              <div className="absolute inset-0 rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                <Camera className="w-5 h-5 text-orange-400" />
                <span className="text-[8px] font-bold mt-0.5">Modifier</span>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#12121E] flex items-center justify-center text-[10px] text-white shadow-md">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {formData.stage_name || "Profil Créateur"}
                </h2>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-2 py-0.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[10px] font-bold flex items-center gap-1 transition-colors border border-orange-500/30"
                >
                  <Camera className="w-3 h-3 text-orange-400" />
                  <span>Changer photo</span>
                </button>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-500/40">
                  {currentUser?.kyc_status === 'verified' ? '✓ CERTIFIÉ KYC' : '⏳ KYC EN ATTENTE'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Gérez vos informations publiques, coordonnées de contact et compte Mobile Money pour la rétribution 80%
              </p>
            </div>
          </div>

          <div className="self-start sm:self-center">
            <span className="px-3.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-bold flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-orange-400" />
              <span>Versement 80% Actif</span>
            </span>
          </div>
        </div>
      </div>

      {/* Messages d'alerte */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/10 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-lg shadow-rose-500/10 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Formulaire de Paramétrage */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1 : Informations Publiques Artiste */}
        <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" />
            <span>Identité Scénique & Présentation Publique</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Nom de Scène Officiel *
              </label>
              <input
                type="text"
                name="stage_name"
                value={formData.stage_name}
                onChange={handleChange}
                placeholder="Ex : Didi B, Josey..."
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Nom Complet / Réel (Usage Privé CDAR)
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                placeholder="Ex : Bassa Zéréhoué"
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Discipline / Catégorie Principale *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-bold"
                required
              >
                <option value="Musique & Rap Ivoire">Musique & Rap Ivoire</option>
                <option value="Afro-Soul & Variété">Afro-Soul & Variété</option>
                <option value="Danse & Chorégraphie">Danse & Chorégraphie</option>
                <option value="Masterclass & Production">Masterclass & Production</option>
                <option value="Humour & Stand-up">Humour & Stand-up</option>
                <option value="Mode & Lifestyle">Mode & Lifestyle</option>
                <option value="Cinéma & Arts Visuels">Cinéma & Arts Visuels</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Pays de Résidence *
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-bold"
                required
              >
                <option value="CI">🇨🇮 Côte d'Ivoire</option>
                <option value="SN">🇸🇳 Sénégal</option>
                <option value="CM">🇨🇲 Cameroun</option>
                <option value="ML">🇲🇱 Mali</option>
                <option value="CD">🇨🇩 RD Congo</option>
                <option value="BF">🇧🇫 Burkina Faso</option>
                <option value="TG">🇹🇬 Togo</option>
                <option value="BJ">🇧🇯 Bénin</option>
                <option value="FR">🇫🇷 France / Diaspora</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Biographie & Message pour vos Fans
              </label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Présentez votre univers, vos projets en cours, ce que vos abonnés VIP découvriront en exclusivité..."
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2 : Coordonnées de Retrait Mobile Money (Part 80%) */}
        <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/35 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-orange-500" />
              <span>Coordonnées de Retrait Mobile Money (Rémunération 80%)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Vérifié
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-gray-400">
            Ces coordonnées sont utilisées pour verser automatiquement vos gains (abonnements VIP, ventes à l'unité PPV, pourboires en direct).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Opérateur Mobile Money *
              </label>
              <select
                name="payout_operator"
                value={formData.payout_operator}
                onChange={handleChange}
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-bold"
                required
              >
                <option value="orange_money">Orange Money (CI, SN, ML, BF)</option>
                <option value="wave">Wave (CI, SN)</option>
                <option value="mtn">MTN MoMo (CI, CM, BJ)</option>
                <option value="moov">Moov Money (CI, TG, BJ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Numéro de Compte Mobile Money *
              </label>
              <input
                type="tel"
                name="payout_momo_number"
                value={formData.payout_momo_number}
                onChange={handleChange}
                placeholder="+225 07 00 11 22 33"
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-mono font-bold"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3 : Coordonnées Personnelles & Contact Privé */}
        <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-400" />
            <span>Coordonnées Personnelles de Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Adresse Email Principale *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@didib.ci"
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Numéro Mobile Direct (WhatsApp / Téléphone)
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+225 07 00 11 22 33"
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4 : Pièce Légale d'Identité & Dossier KYC */}
        <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>Pièce Légale d'Identité & Conformité KYC</span>
            </h3>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
              currentUser?.kyc_status === 'verified'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}>
              {currentUser?.kyc_status === 'verified' ? '✓ CERTIFIÉ CONFORME' : '⏳ EN ATTENTE DE CONTRÔLE'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-gray-400">
            Vous pouvez mettre à jour vos pièces légales d'identité (CNI, Passeport, Permis de conduire) à tout moment. Elles seront vérifiées par l'équipe administrative de gouvernance.
          </p>

          <div className="space-y-4 pt-1">
            <div className="max-w-xs">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Type de Document Légal
              </label>
              <select
                name="kyc_id_type"
                value={formData.kyc_id_type}
                onChange={handleChange}
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="cni">CNI (Carte Nationale d'Identité)</option>
                <option value="passeport">Passeport International</option>
                <option value="permis">Permis de Conduire</option>
                <option value="carte_consulaire">Carte Consulaire</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recto */}
              <div>
                <input
                  type="file"
                  ref={idRectoRef}
                  onChange={(e) => handleIdDocChange(e, 'kyc_id_document_recto_url', 'Recto de la pièce')}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={() => idRectoRef.current?.click()}
                  className="border-2 border-dashed border-purple-500/40 hover:border-purple-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 dark:bg-black/20 hover:bg-purple-500/5 transition-all group min-h-[140px]"
                >
                  {formData.kyc_id_document_recto_url ? (
                    <div className="relative w-full flex flex-col items-center">
                      <img 
                        src={formData.kyc_id_document_recto_url} 
                        alt="Recto CNI" 
                        className="max-h-24 rounded-lg object-contain border border-purple-500/40 shadow-sm"
                      />
                      <span className="mt-2 text-[10px] font-bold text-purple-400 group-hover:underline flex items-center gap-1">
                        <Camera className="w-3 h-3" /> Cliquer pour remplacer le RECTO
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-purple-400 group-hover:scale-110 transition-transform mb-1.5" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Photo RECTO de la pièce</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Face avant avec photo et nom</span>
                    </>
                  )}
                </div>
              </div>

              {/* Verso */}
              <div>
                <input
                  type="file"
                  ref={idVersoRef}
                  onChange={(e) => handleIdDocChange(e, 'kyc_id_document_verso_url', 'Verso de la pièce')}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={() => idVersoRef.current?.click()}
                  className="border-2 border-dashed border-purple-500/40 hover:border-purple-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 dark:bg-black/20 hover:bg-purple-500/5 transition-all group min-h-[140px]"
                >
                  {formData.kyc_id_document_verso_url ? (
                    <div className="relative w-full flex flex-col items-center">
                      <img 
                        src={formData.kyc_id_document_verso_url} 
                        alt="Verso CNI" 
                        className="max-h-24 rounded-lg object-contain border border-purple-500/40 shadow-sm"
                      />
                      <span className="mt-2 text-[10px] font-bold text-purple-400 group-hover:underline flex items-center gap-1">
                        <Camera className="w-3 h-3" /> Cliquer pour remplacer le VERSO
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-purple-400 group-hover:scale-110 transition-transform mb-1.5" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Photo VERSO de la pièce</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Face arrière avec date et signature</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 : Sécurité & Mot de Passe */}
        <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-500" />
            <span>Sécurité & Changement de Mot de Passe</span>
          </h3>
          <p className="text-xs text-gray-400">
            Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe de connexion.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Mot de Passe Actuel
              </label>
              <input
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Nouveau Mot de Passe
              </label>
              <input
                type="password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Nouveau mot de passe"
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Confirmation
              </label>
              <input
                type="password"
                name="confirm_new_password"
                value={formData.confirm_new_password}
                onChange={handleChange}
                placeholder="Confirmer mot de passe"
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Bouton de Soumission */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF7A00] via-[#FF9E00] to-yellow-500 hover:brightness-110 active:scale-98 text-white font-black text-sm shadow-xl shadow-orange-500/25 disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Enregistrement en cours..." : "Enregistrer mes Coordonnées"}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
