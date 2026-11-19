import React, { useState, useRef } from 'react';
import { 
  X, Sparkles, User, Music, ArrowRight, ShieldCheck, Lock, Smartphone, 
  Camera, FileText, CheckCircle2, AlertCircle, Upload, Eye, CreditCard,
  Mail, Globe, Phone, MapPin
} from 'lucide-react';
import { apiLogin, apiRegisterFan, apiRegisterArtist } from '../../api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [roleType, setRoleType] = useState('fan'); // 'fan' | 'artist'

  // Champs de connexion
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Champs Inscription Fan
  const [fanDisplayName, setFanDisplayName] = useState('');
  const [fanEmail, setFanEmail] = useState('');
  const [fanPhone, setFanPhone] = useState('');
  const [fanCountry, setFanCountry] = useState('CI');
  const [fanPassword, setFanPassword] = useState('');

  // Champs Inscription Complète Artiste
  const [artistStageName, setArtistStageName] = useState('');
  const [artistRealName, setArtistRealName] = useState('');
  const [artistEmail, setArtistEmail] = useState('');
  const [artistPhone, setArtistPhone] = useState('');
  const [artistCountry, setArtistCountry] = useState('CI');
  const [artistCategory, setArtistCategory] = useState('Musique & Rap Ivoire');
  const [artistBio, setArtistBio] = useState('');
  const [artistPassword, setArtistPassword] = useState('');
  const [payoutOperator, setPayoutOperator] = useState('orange_money');
  const [payoutMomoNumber, setPayoutMomoNumber] = useState('');
  const [idType, setIdType] = useState('cni'); // 'cni' | 'passeport' | 'permis' | 'carte_consulaire'

  // Photos & Justificatifs Légaux de l'Artiste
  const [artistPhoto, setArtistPhoto] = useState(null); // DataURL
  const [idCardRecto, setIdCardRecto] = useState(null); // DataURL
  const [idCardVerso, setIdCardVerso] = useState(null); // DataURL

  // Références d'input file
  const artistPhotoRef = useRef(null);
  const idRectoRef = useRef(null);
  const idVersoRef = useRef(null);

  // Gestion des fichiers images -> Base64 DataURL
  const handleFileChange = (e, setter, fieldName) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(`Veuillez sélectionner un fichier image valide pour ${fieldName} (JPG, PNG, WebP).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setter(event.target.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const res = await apiLogin(login, password);
        localStorage.setItem('cdar_token', res.access_token);
        onLoginSuccess(res);
        onClose();
      } else {
        // Mode Inscription
        if (roleType === 'fan') {
          if (!fanDisplayName.trim()) {
            setError("Veuillez renseigner votre nom ou pseudo.");
            setLoading(false);
            return;
          }
          if (!fanEmail && !fanPhone) {
            setError("Veuillez renseigner un email ou un numéro de téléphone.");
            setLoading(false);
            return;
          }
          const res = await apiRegisterFan({
            display_name: fanDisplayName,
            email: fanEmail || undefined,
            phone_number: fanPhone || undefined,
            password: fanPassword,
            country: fanCountry
          });
          localStorage.setItem('cdar_token', res.access_token);
          onLoginSuccess(res);
          onClose();
        } else {
          // Validation complète des informations de l'artiste
          if (!artistStageName.trim()) {
            setError("Le nom de scène de l'artiste est obligatoire.");
            setLoading(false);
            return;
          }
          if (!artistEmail.trim()) {
            setError("L'adresse email officielle de l'artiste est obligatoire.");
            setLoading(false);
            return;
          }
          if (!artistPhone.trim()) {
            setError("Le numéro de téléphone officiel est obligatoire.");
            setLoading(false);
            return;
          }
          if (!artistPassword || artistPassword.length < 6) {
            setError("Le mot de passe doit comporter au moins 6 caractères.");
            setLoading(false);
            return;
          }
          if (!artistPhoto) {
            setError("La photo de profil de l'artiste est obligatoire pour son dossier d'inscription.");
            setLoading(false);
            return;
          }
          if (!idCardRecto) {
            setError("La photo RECTO de la pièce légale d'identité est obligatoire.");
            setLoading(false);
            return;
          }
          if (!idCardVerso) {
            setError("La photo VERSO de la pièce légale d'identité est obligatoire.");
            setLoading(false);
            return;
          }
          if (!payoutMomoNumber.trim()) {
            setError("Le numéro Mobile Money de versement (80%) est obligatoire.");
            setLoading(false);
            return;
          }

          const res = await apiRegisterArtist({
            stage_name: artistStageName,
            display_name: artistRealName || undefined,
            category: artistCategory,
            bio: artistBio || undefined,
            country: artistCountry,
            email: artistEmail,
            phone_number: artistPhone,
            password: artistPassword,
            payout_operator: payoutOperator,
            payout_momo_number: payoutMomoNumber,
            avatar_url: artistPhoto,
            kyc_id_type: idType,
            kyc_id_document_recto_url: idCardRecto,
            kyc_id_document_verso_url: idCardVerso
          });

          localStorage.setItem('cdar_token', res.access_token);
          onLoginSuccess(res);
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la validation du formulaire.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className={`relative bg-[#161622] border border-white/15 rounded-3xl w-full ${roleType === 'artist' && mode === 'register' ? 'max-w-2xl' : 'max-w-md'} overflow-hidden shadow-2xl my-auto transition-all`}>
        {/* Glow ambient background aura */}
        <div className="absolute top-0 right-0 w-80 h-44 bg-gradient-to-bl from-orange-500/20 via-purple-500/15 to-transparent blur-3xl pointer-events-none"></div>

        {/* Header Modal */}
        <div className="relative z-10 px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${
              roleType === 'artist' && mode === 'register'
                ? 'bg-gradient-to-tr from-[#FF7A00] to-amber-500 shadow-orange-500/25'
                : 'bg-gradient-to-tr from-[#FF5500] to-yellow-500 shadow-orange-500/20'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                {mode === 'login' 
                  ? "Connexion Sécurisée CDAR" 
                  : roleType === 'artist' 
                  ? "Dossier d'Inscription Artiste Créateur" 
                  : "Inscription Fan CDAR"}
              </h3>
              <p className="text-[11px] text-gray-400">Authentification chiffrée SSL 256-bit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="relative z-10 p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          {/* Switcher Se connecter / S'inscrire */}
          <div className="flex bg-[#0F0F1A] p-1.5 rounded-xl border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white shadow-glow-orange'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Se Connecter
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white shadow-glow-orange'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Créer un Compte
            </button>
          </div>

          {/* Choix du rôle si Inscription */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => { setRoleType('fan'); setError(null); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  roleType === 'fan'
                    ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compte Fan</span>
              </button>
              <button
                type="button"
                onClick={() => { setRoleType('artist'); setError(null); }}
                className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  roleType === 'artist'
                    ? 'bg-gradient-to-r from-orange-500/30 to-amber-500/30 text-amber-300 border border-orange-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-orange-400" />
                <span>Compte Artiste (Créateur)</span>
              </button>
            </div>
          )}

          {/* FORMULAIRE PRINCIPAL */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ========================================================= */}
            {/* 1. CAS CONNEXION                                         */}
            {/* ========================================================= */}
            {mode === 'login' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Email ou Numéro Mobile
                  </label>
                  <input
                    type="text"
                    placeholder="contact@domaine.ci ou +225 07..."
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF7A00] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Mot de Passe
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF7A00] transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. CAS INSCRIPTION FAN                                   */}
            {/* ========================================================= */}
            {mode === 'register' && roleType === 'fan' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Nom ou Pseudo Fan *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Koffi Fan"
                    value={fanDisplayName}
                    onChange={(e) => setFanDisplayName(e.target.value)}
                    className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF7A00]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="koffi@gmail.com"
                      value={fanEmail}
                      onChange={(e) => setFanEmail(e.target.value)}
                      className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF7A00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="+225 07 00 11 22"
                      value={fanPhone}
                      onChange={(e) => setFanPhone(e.target.value)}
                      className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF7A00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Pays de Résidence
                    </label>
                    <select
                      value={fanCountry}
                      onChange={(e) => setFanCountry(e.target.value)}
                      className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF7A00] font-bold"
                    >
                      <option value="CI">🇨🇮 Côte d'Ivoire</option>
                      <option value="SN">🇸🇳 Sénégal</option>
                      <option value="CM">🇨🇲 Cameroun</option>
                      <option value="ML">🇲🇱 Mali</option>
                      <option value="CD">🇨🇩 RD Congo</option>
                      <option value="BF">🇧🇫 Burkina Faso</option>
                      <option value="FR">🇫🇷 France / Diaspora</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Mot de Passe *
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={fanPassword}
                      onChange={(e) => setFanPassword(e.target.value)}
                      className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF7A00]"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 3. CAS INSCRIPTION COMPLÈTE ARTISTE (INFORMATIONS DÉTAILLÉES) */}
            {/* ========================================================= */}
            {mode === 'register' && roleType === 'artist' && (
              <div className="space-y-4">
                
                {/* 3.1 Identité Scénique & Réelle */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-orange-400" />
                    <span>1. Identité Créateur & Discipline</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                        Nom de Scène Officiel *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex : Didi B, Josey, Suspect 95..."
                        value={artistStageName}
                        onChange={(e) => setArtistStageName(e.target.value)}
                        className="w-full bg-[#0E0E16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                        Nom d'État Civil (Usage Privé CDAR)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex : Bassa Zéréhoué"
                        value={artistRealName}
                        onChange={(e) => setArtistRealName(e.target.value)}
                        className="w-full bg-[#0E0E16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                        Discipline / Catégorie Artistique *
                      </label>
                      <select
                        value={artistCategory}
                        onChange={(e) => setArtistCategory(e.target.value)}
                        className="w-full bg-[#0E0E16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-bold"
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
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                        Pays de Résidence & Création *
                      </label>
                      <select
                        value={artistCountry}
                        onChange={(e) => setArtistCountry(e.target.value)}
                        className="w-full bg-[#0E0E16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-bold"
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
                  </div>
                </div>

                {/* 3.2 Coordonnées Personnelles & Sécurité */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    <span>2. Coordonnées de Contact & Sécurité</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                        Adresse Email Officielle *
                      </label>
                      <input
                        type="email"
                        placeholder="contact@didib.ci"
                        value={artistEmail}
                        onChange={(e) => setArtistEmail(e.target.value)}
                        className="w-full bg-[#0E0E16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                        Numéro Mobile Officiel / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        placeholder="+225 07 00 11 22 33"
                        value={artistPhone}
                        onChange={(e) => setArtistPhone(e.target.value)}
                        className="w-full bg-[#0E0E16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                      Mot de Passe de Connexion Artiste *
                    </label>
                    <input
                      type="password"
                      placeholder="•••••••••••• (au moins 6 caractères)"
                      value={artistPassword}
                      onChange={(e) => setArtistPassword(e.target.value)}
                      className="w-full bg-[#0E0E16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* 3.3 Photo de Profil de l'Artiste */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-orange-400" />
                      <span>3. Photo de Profil de l'Artiste *</span>
                    </span>
                    <span className="text-[10px] font-bold text-orange-400/80 font-mono">OBLIGATOIRE</span>
                  </div>

                  <input
                    type="file"
                    ref={artistPhotoRef}
                    onChange={(e) => handleFileChange(e, setArtistPhoto, "la photo de profil")}
                    accept="image/*"
                    className="hidden"
                  />

                  <div 
                    onClick={() => artistPhotoRef.current?.click()}
                    className="border-2 border-dashed border-orange-500/40 hover:border-orange-500 rounded-2xl p-3 flex items-center gap-4 cursor-pointer bg-black/20 hover:bg-black/40 transition-all group"
                  >
                    {artistPhoto ? (
                      <img 
                        src={artistPhoto} 
                        alt="Aperçu artiste" 
                        className="w-14 h-14 rounded-xl object-cover border-2 border-orange-500 shadow-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {artistPhoto ? "Photo sélectionnée (Cliquer pour changer)" : "Sélectionner la photo officielle"}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        JPG, PNG ou WebP. Photo de scène ou portrait professionnel net.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3.4 Pièce Légale d'Identité (Recto & Verso) */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-purple-400" />
                      <span>4. Pièce Légale d'Identité (Recto-Verso) *</span>
                    </span>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="bg-[#0E0E16] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-gray-200 font-bold focus:outline-none focus:border-purple-500"
                    >
                      <option value="cni">CNI (Carte Nationale)</option>
                      <option value="passeport">Passeport International</option>
                      <option value="permis">Permis de Conduire</option>
                      <option value="carte_consulaire">Carte Consulaire</option>
                    </select>
                  </div>

                  <p className="text-[11px] text-gray-400">
                    Pour garantir l'authenticité des créateurs et sécuriser les versements 80%, veuillez joindre les photos <strong className="text-white">Recto et Verso</strong> lisibles de votre pièce d'identité.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Recto */}
                    <div>
                      <input
                        type="file"
                        ref={idRectoRef}
                        onChange={(e) => handleFileChange(e, setIdCardRecto, "le Recto de la pièce")}
                        accept="image/*"
                        className="hidden"
                      />
                      <div 
                        onClick={() => idRectoRef.current?.click()}
                        className="border-2 border-dashed border-purple-500/40 hover:border-purple-500 rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer bg-black/20 hover:bg-black/40 transition-all group h-32"
                      >
                        {idCardRecto ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img 
                              src={idCardRecto} 
                              alt="Recto" 
                              className="max-h-full max-w-full rounded-lg object-contain"
                            />
                            <span className="absolute bottom-0 right-0 bg-emerald-500 text-[9px] font-black text-black px-1.5 py-0.5 rounded-md shadow">
                              ✓ RECTO
                            </span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform mb-1.5" />
                            <span className="text-xs font-bold text-white">Photo RECTO *</span>
                            <span className="text-[10px] text-gray-400">Face avant avec photo</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Verso */}
                    <div>
                      <input
                        type="file"
                        ref={idVersoRef}
                        onChange={(e) => handleFileChange(e, setIdCardVerso, "le Verso de la pièce")}
                        accept="image/*"
                        className="hidden"
                      />
                      <div 
                        onClick={() => idVersoRef.current?.click()}
                        className="border-2 border-dashed border-purple-500/40 hover:border-purple-500 rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer bg-black/20 hover:bg-black/40 transition-all group h-32"
                      >
                        {idCardVerso ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img 
                              src={idCardVerso} 
                              alt="Verso" 
                              className="max-h-full max-w-full rounded-lg object-contain"
                            />
                            <span className="absolute bottom-0 right-0 bg-emerald-500 text-[9px] font-black text-black px-1.5 py-0.5 rounded-md shadow">
                              ✓ VERSO
                            </span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform mb-1.5" />
                            <span className="text-xs font-bold text-white">Photo VERSO *</span>
                            <span className="text-[10px] text-gray-400">Face arrière de la pièce</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3.5 Retrait Mobile Money (Rémunération 80%) */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>5. Coordonnées de Versement Mobile Money (80% Net)</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                        Opérateur Mobile Money *
                      </label>
                      <select
                        value={payoutOperator}
                        onChange={(e) => setPayoutOperator(e.target.value)}
                        className="w-full bg-[#0E0E16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-bold"
                      >
                        <option value="orange_money">Orange Money</option>
                        <option value="wave">Wave</option>
                        <option value="mtn">MTN MoMo</option>
                        <option value="moov">Moov Money</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                        Numéro de Compte de Versement *
                      </label>
                      <input
                        type="tel"
                        placeholder="+225 07 00 11 22 33"
                        value={payoutMomoNumber}
                        onChange={(e) => setPayoutMomoNumber(e.target.value)}
                        className="w-full bg-[#0E0E16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 font-mono font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 3.6 Biographie & Présentation */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Présentation / Biographie Artistique (Optionnelle)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Présentez brièvement votre univers créatif, vos projets et ce que vos fans découvriront..."
                    value={artistBio}
                    onChange={(e) => setArtistBio(e.target.value)}
                    className="w-full bg-[#0E0E16] border border-white/10 rounded-2xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Message d'erreur s'il y a lieu */}
            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#FF7A00] via-[#FF9E00] to-yellow-500 hover:brightness-110 active:scale-[0.99] text-white font-black rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-orange-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {loading
                  ? "Vérification et transmission en cours..."
                  : mode === 'login'
                  ? "Accéder à mon Espace"
                  : roleType === 'artist'
                  ? "Transmettre mon Dossier d'Inscription Complet"
                  : "Finaliser mon Inscription Fan"}
              </span>
            </button>
          </form>

          <div className="pt-1 text-center">
            <p className="text-[11px] text-gray-400">
              Transactions & pièces sécurisées sous protocole CDAR SSL 256-bit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
