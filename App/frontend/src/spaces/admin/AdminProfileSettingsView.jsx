import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, ShieldAlert, User, Mail, Smartphone, MapPin, 
  Lock, Save, CheckCircle2, AlertCircle, Bell, Key, Sparkles, 
  Radio, CheckSquare, Settings, Camera, UploadCloud 
} from 'lucide-react';
import { apiUpdateProfile } from '../../api';

export default function AdminProfileSettingsView({ currentUser, onUpdateCurrentUser }) {
  const [formData, setFormData] = useState({
    display_name: currentUser?.display_name || '',
    email: currentUser?.email || '',
    phone_number: currentUser?.phone_number || '',
    country: currentUser?.country || 'CI',
    avatar_url: currentUser?.avatar_url || '',
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });

  // Préférences de notifications locales admin
  const [notifySensitive, setNotifySensitive] = useState(true);
  const [notifyLives, setNotifyLives] = useState(true);
  const [notifyKyc, setNotifyKyc] = useState(true);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const avatarInputRef = useRef(null);

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
        setSuccessMsg("Photo administrateur chargée ! Cliquez sur 'Enregistrer les Modifications' pour valider.");
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        display_name: currentUser.display_name || '',
        email: currentUser.email || '',
        phone_number: currentUser.phone_number || '',
        country: currentUser.country || 'CI',
        avatar_url: currentUser.avatar_url || ''
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
        setErrorMsg("Veuillez saisir votre mot de passe administrateur actuel pour valider la modification.");
        setLoading(false);
        return;
      }
      if (formData.new_password !== formData.confirm_new_password) {
        setErrorMsg("La confirmation du mot de passe ne correspond pas.");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        display_name: formData.display_name,
        email: formData.email,
        phone_number: formData.phone_number,
        country: formData.country,
        avatar_url: formData.avatar_url || undefined,
        current_password: formData.current_password || undefined,
        new_password: formData.new_password || undefined
      };

      const updatedUser = await apiUpdateProfile(payload);
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(updatedUser);
      }
      setSuccessMsg("✨ Vos coordonnées et paramètres administrateur ont été enregistrés avec succès !");
      setFormData(prev => ({ ...prev, current_password: '', new_password: '', confirm_new_password: '' }));
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de la mise à jour des paramètres.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* 1. Header Console Profil Radiant */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#201026] via-[#161224] to-[#10101A] border border-purple-500/35 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-purple-500/20 via-pink-500/10 to-transparent blur-3xl pointer-events-none"></div>

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
              title="Cliquer pour changer votre photo administrateur"
              className="relative group cursor-pointer"
            >
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt={formData.display_name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/50 shadow-xl group-hover:opacity-75 transition-all group-hover:scale-105"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-xl shadow-purple-600/30 group-hover:opacity-75 transition-all group-hover:scale-105">
                  {formData.display_name?.slice(0, 2).toUpperCase() || 'AD'}
                </div>
              )}
              {/* Overlay au survol */}
              <div className="absolute inset-0 rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                <Camera className="w-5 h-5 text-purple-400" />
                <span className="text-[8px] font-bold mt-0.5">Modifier</span>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 border-2 border-[#10101A] flex items-center justify-center text-[10px] text-white shadow-md">
                🛡️
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {formData.display_name || "Administrateur CDAR"}
                </h2>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-2 py-0.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center gap-1 transition-colors border border-purple-500/30"
                >
                  <Camera className="w-3 h-3 text-purple-400" />
                  <span>Changer photo</span>
                </button>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  SUPER ADMIN & MODÉRATEUR
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Paramétrez vos coordonnées de contact d'urgence, adresse d'alerte et accès de gouvernance
              </p>
            </div>
          </div>

          <div className="self-start sm:self-center">
            <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2 shadow-sm">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Privilèges Maîtres Actifs</span>
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

      {/* Formulaire de Paramétrage Admin */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1 : Coordonnées Personnelles & Identifiant */}
        <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-purple-500" />
            <span>Coordonnées Personnelles & Identité Administrateur</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Nom d'Affichage / Titre Administrateur *
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                placeholder="Ex : Directeur CDAR ou Modérateur Central"
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Adresse Email Administrative (Alertes & Connexion) *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@cdar.ci"
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Numéro Direct d'Urgence / WhatsApp
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+225 07 00 11 22 33"
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Pays de Rattachement
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="CI">🇨🇮 Côte d'Ivoire (Siège Central)</option>
                <option value="SN">🇸🇳 Sénégal</option>
                <option value="CM">🇨🇲 Cameroun</option>
                <option value="ML">🇲🇱 Mali</option>
                <option value="CD">🇨🇩 RD Congo</option>
                <option value="FR">🇫🇷 France / International</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2 : Accréditations & Périmètre de Gouvernance */}
        <div className="bg-slate-50 dark:bg-[#10101A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Périmètre d'Accréditations CDAR</span>
          </h3>
          <p className="text-xs text-gray-400">
            Votre compte dispose des habilitations complètes de niveau 1 pour la gouvernance de la plateforme.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#151522] border border-slate-200 dark:border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">✓</div>
              <div>
                <strong className="text-slate-900 dark:text-white">Validation KYC Créateurs</strong>
                <p className="text-[10px] text-gray-400">Certification des pièces et comptes Mobile Money</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#151522] border border-slate-200 dark:border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">✓</div>
              <div>
                <strong className="text-slate-900 dark:text-white">Modération Contenus Sensibles</strong>
                <p className="text-[10px] text-gray-400">Floutage +18, censure et blocage des publications</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#151522] border border-slate-200 dark:border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">✓</div>
              <div>
                <strong className="text-slate-900 dark:text-white">Surveillance des Directs</strong>
                <p className="text-[10px] text-gray-400">Coupure d'urgence des lives et alertes chat</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#151522] border border-slate-200 dark:border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">✓</div>
              <div>
                <strong className="text-slate-900 dark:text-white">Suivi Financier & Commissions 20%</strong>
                <p className="text-[10px] text-gray-400">Relevés de versements et contrôle des flux MoMo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 : Préférences d'Alertes Modération */}
        <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Préférences d'Alertes Administratives</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/5 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Alertes de Contenus Signalés</span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Recevoir une notification dès qu'une publication reçoit un signalement utilisateur</p>
              </div>
              <input
                type="checkbox"
                checked={notifySensitive}
                onChange={(e) => setNotifySensitive(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/5 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Notification d'Ouverture de Live Stream</span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Surveillance immédiate dès le démarrage d'un direct par un artiste</p>
              </div>
              <input
                type="checkbox"
                checked={notifyLives}
                onChange={(e) => setNotifyLives(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/5 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Nouvelles Candidatures Créateurs KYC</span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Avertissement lors de la soumission d'un nouveau dossier d'artiste</p>
              </div>
              <input
                type="checkbox"
                checked={notifyKyc}
                onChange={(e) => setNotifyKyc(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Section 4 : Sécurité & Changement de Mot de Passe */}
        <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-500" />
            <span>Sécurité du Compte Administrateur</span>
          </h3>
          <p className="text-xs text-gray-400">
            Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe administrateur.
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
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
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
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
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
                className="w-full bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Bouton de Soumission */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:brightness-110 active:scale-98 text-white font-black text-sm shadow-xl shadow-purple-600/30 disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Enregistrement en cours..." : "Enregistrer les Paramètres Admin"}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
