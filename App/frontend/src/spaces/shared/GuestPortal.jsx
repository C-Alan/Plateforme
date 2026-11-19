import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Music, User, ShieldCheck, Zap, Lock, ArrowRight, 
  Shield, Award, Smartphone, CheckCircle2, ChevronRight, X, 
  Play, Radio, Volume2, Flame, Camera, Upload, Eye, CreditCard, 
  Mail, Globe, Phone, MapPin, AlertCircle, FileText
} from 'lucide-react';
import { apiLogin, apiRegisterFan, apiRegisterArtist } from '../../api';

const COUNTRIES = [
  { code: 'CI', name: "Côte d'Ivoire (+225)", dial: '+225' },
  { code: 'SN', name: 'Sénégal (+221)', dial: '+221' },
  { code: 'CM', name: 'Cameroun (+237)', dial: '+237' },
  { code: 'ML', name: 'Mali (+223)', dial: '+223' },
  { code: 'CD', name: 'RD Congo (+243)', dial: '+243' },
  { code: 'BF', name: 'Burkina Faso (+226)', dial: '+226' },
  { code: 'TG', name: 'Togo (+228)', dial: '+228' },
  { code: 'BJ', name: 'Bénin (+229)', dial: '+229' },
  { code: 'FR', name: 'France (+33)', dial: '+33' },
];

export default function GuestPortal({ onLoginSuccess, posts = [] }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register_fan' | 'register_artist'
  const [showForm, setShowForm] = useState(false);   // Toggle entre vue épurée Plateforme_Login_0 et formulaire interactif
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states communs & Fan
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('CI');

  // Form states complets Artiste
  const [stageName, setStageName] = useState('');
  const [artistRealName, setArtistRealName] = useState('');
  const [artistEmail, setArtistEmail] = useState('');
  const [artistPhone, setArtistPhone] = useState('');
  const [category, setCategory] = useState('Musique & Rap Ivoire');
  const [artistBio, setArtistBio] = useState('');
  const [momoOperator, setMomoOperator] = useState('orange_money');
  const [momoNumber, setMomoNumber] = useState('');
  const [idType, setIdType] = useState('cni'); // 'cni' | 'passeport' | 'permis' | 'carte_consulaire'

  // Photos & Justificatifs Légaux Artiste
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

  // 1. Catégories défilant en arrière-plan (Carousel visuel inspiré de Plateforme_Login_0.png)
  const categorySlides = [
    {
      id: 'concerts',
      tag: 'Concerts & Lives 🔴',
      title: 'Find your favorite stage',
      subtitle: 'Vivez l\'émotion des plus grands concerts et directs exclusifs',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400',
    },
    {
      id: 'rap',
      tag: 'Rap Ivoire & Hip-Hop',
      title: 'Find your favorite sound',
      subtitle: 'Les flows, freestyles et morceaux inédits qui font vibrer l\'Afrique',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1400',
    },
    {
      id: 'soul',
      tag: 'Afro-Soul & Voix d\'Or',
      title: 'Find your favorite voice',
      subtitle: 'Des sessions acoustiques pures, intimistes et chaleureuses',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1400',
    },
    {
      id: 'danse',
      tag: 'Danse & Énergie Afro',
      title: 'Find your favorite rhythm',
      subtitle: 'Performances vibrantes, chorégraphies et énergie scénique',
      image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1400',
    },
    {
      id: 'studio',
      tag: 'Masterclass & Studio',
      title: 'Find your favorite mentor',
      subtitle: 'Secrets de production, beatmaking et masterclass professionnelles',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1400',
    },
    {
      id: 'patrimoine',
      tag: 'Scène Créative Africaine',
      title: 'Find your favorite place',
      subtitle: 'La première plateforme de contenus exclusifs monétisés par Mobile Money',
      image: '/Plateforme_Login_0.png',
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  // Rotation automatique fluide des catégories en arrière-plan
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % categorySlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [categorySlides.length]);

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiLogin(loginInput, password);
      localStorage.setItem('cdar_token', res.access_token);
      onLoginSuccess(res);
    } catch (err) {
      setError(err.message || "Identifiants incorrects. Veuillez vérifier vos informations.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterFan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiRegisterFan({
        display_name: displayName,
        email: email || undefined,
        phone_number: phone || undefined,
        password,
        country
      });
      localStorage.setItem('cdar_token', res.access_token);
      onLoginSuccess(res);
    } catch (err) {
      setError(err.message || "Erreur lors de la création du compte Fan");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterArtist = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!stageName.trim()) {
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
      if (!password || password.length < 6) {
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
      if (!momoNumber.trim()) {
        setError("Le numéro Mobile Money de versement (80%) est obligatoire.");
        setLoading(false);
        return;
      }

      const res = await apiRegisterArtist({
        stage_name: stageName.trim(),
        display_name: artistRealName.trim() || stageName.trim(),
        category: category,
        email: artistEmail.trim(),
        phone_number: artistPhone.trim(),
        password: password,
        country: country,
        payout_momo_number: momoNumber.trim(),
        payout_operator: momoOperator,
        bio: artistBio.trim() || undefined,
        avatar_url: artistPhoto || undefined,
        kyc_id_type: idType,
        kyc_id_document_recto_url: idCardRecto,
        kyc_id_document_verso_url: idCardVerso,
        kyc_id_document_url: idCardRecto
      });
      localStorage.setItem('cdar_token', res.access_token);
      onLoginSuccess(res);
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription Artiste");
    } finally {
      setLoading(false);
    }
  };

  const currentSlideData = categorySlides[activeSlide];

  return (
    <div className="w-full flex items-center justify-center py-2 sm:py-6">
      
      {/* ÉCRAN PRINCIPAL DE CONNEXION (STYLE EXACT PLATEFORME_LOGIN_0.PNG) */}
      <section className="relative w-full max-w-md mx-auto min-h-[640px] sm:min-h-[720px] rounded-[44px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/15 flex flex-col justify-between bg-black">
        
        {/* ARRIÈRE-PLAN DÉFILANT DES CATÉGORIES (SLIDESHOW) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {categorySlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === activeSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
              style={{ transition: 'opacity 1.2s ease-in-out, transform 6s ease-out' }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
              />
              {/* Voile dégradé subtil pour lisibilité du titre */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40"></div>
            </div>
          ))}
        </div>

        {/* TOP : TYPOGRAPHIE & INDICATEURS DE CATÉGORIES (STYLE PLATEFORME_LOGIN_0.PNG) */}
        <div className="relative z-10 p-6 pt-10 text-center space-y-2">
          
          {/* Badge Catégorie Active */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-extrabold tracking-wide shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>{currentSlideData.tag}</span>
          </div>

          {/* Titre Principal exact : "Find your favorite place / scene" */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {currentSlideData.title}
          </h1>

          {/* Sous-titre élégant */}
          <p className="text-xs sm:text-sm text-gray-200/90 font-medium max-w-xs mx-auto drop-shadow-md">
            {currentSlideData.subtitle}
          </p>

          {/* Indicateurs de défilement des catégories */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {categorySlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeSlide ? 'w-6 bg-amber-400 shadow-glow-orange' : 'w-1.5 bg-white/40'
                }`}
                title={`Catégorie ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* BOTTOM : LA CARTE DÔME BLANCHE ARRONDIE (EXACT PLATEFORME_LOGIN_0.PNG) */}
        <div className="relative z-20 w-full">
          <div 
            className="w-full bg-white text-slate-900 px-6 sm:px-8 pt-8 pb-7 shadow-2xl transition-all duration-300 relative"
            style={{
              borderTopLeftRadius: '50px',
              borderTopRightRadius: '50px',
            }}
          >
            {/* Lueur subtile au-dessus de la carte */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-white/50 blur-[2px]"></div>

            {!showForm ? (
              /* VUE INITIALE ÉPURÉE CONFORME À PLATEFORME_LOGIN_0.PNG */
              <div className="text-center space-y-4 py-2 animate-in fade-in duration-300">
                
                {/* BOUTON OVALE BORDÉ "LOGIN" */}
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(true);
                    setAuthMode('login');
                  }}
                  className="w-full max-w-[260px] mx-auto py-3 px-8 rounded-full border-2 border-[#D4A373] text-[#8C5E35] font-extrabold text-sm tracking-widest uppercase hover:bg-[#D4A373]/15 active:scale-[0.98] transition-all shadow-sm block"
                >
                  LOGIN
                </button>

                {/* LIEN "Register Now!" & Inscription Artiste Directe */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(true);
                      setAuthMode('register_fan');
                    }}
                    className="text-xs font-bold text-[#A67C52] hover:text-[#7A5430] transition-colors"
                  >
                    Créer Compte Fan
                  </button>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(true);
                      setAuthMode('register_artist');
                    }}
                    className="text-xs font-black text-[#FF5500] hover:text-orange-700 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Créer Compte Artiste Certifié</span>
                  </button>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] text-gray-400 font-medium">
                    Orange Money • Wave • MTN MoMo
                  </span>
                </div>
              </div>
            ) : (
              /* VUE FORMULAIRE INTERACTIF (SE DÉPLOIE DANS LE DÔME) */
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
                
                {/* Header formulaire avec bouton replier */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`text-xs font-black transition-colors pb-1 border-b-2 ${
                        authMode === 'login'
                          ? 'border-[#FF5500] text-[#FF5500]'
                          : 'border-transparent text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      Connexion
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register_fan')}
                      className={`text-xs font-black transition-colors pb-1 border-b-2 ${
                        authMode === 'register_fan'
                          ? 'border-[#FF5500] text-[#FF5500]'
                          : 'border-transparent text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      Créer Compte Fan
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register_artist')}
                      className={`text-xs font-black transition-colors pb-1 border-b-2 flex items-center gap-1 ${
                        authMode === 'register_artist'
                          ? 'border-[#FF5500] text-[#FF5500]'
                          : 'border-transparent text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Inscription Artiste</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-slate-900 p-1 rounded-full text-xs"
                    title="Replier"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-semibold">
                    {error}
                  </div>
                )}

                {/* Formulaire Connexion */}
                {authMode === 'login' && (
                  <form onSubmit={handleCustomLogin} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Email ou Numéro Mobile</label>
                      <input
                        type="text"
                        placeholder="contact@artiste.ci ou +225 07..."
                        value={loginInput}
                        onChange={(e) => setLoginInput(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-[#FF5500] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Mot de passe</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-[#FF5500] transition-all"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-[#FF5500] to-[#FF8C00] hover:brightness-105 active:scale-[0.98] text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-orange-500/30 uppercase tracking-wider disabled:opacity-50"
                    >
                      {loading ? "Connexion..." : "Se Connecter"}
                    </button>
                  </form>
                )}

                {/* Formulaire Inscription Fan */}
                {authMode === 'register_fan' && (
                  <form onSubmit={handleRegisterFan} className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-0.5">Nom ou Pseudo Fan</label>
                      <input
                        type="text"
                        placeholder="Ex : Amina S."
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#FF5500]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-0.5">Email</label>
                      <input
                        type="email"
                        placeholder="votre.email@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-0.5">Numéro Mobile Money</label>
                      <input
                        type="tel"
                        placeholder="+225 07 00 00 00 00"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-0.5">Mot de passe</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#FF5500]"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white font-extrabold rounded-xl text-xs shadow-md uppercase tracking-wider"
                    >
                      {loading ? "Création..." : "Créer mon Compte Fan"}
                    </button>
                  </form>
                )}

                {/* Formulaire Inscription Artiste Complet */}
                {authMode === 'register_artist' && (
                  <form onSubmit={handleRegisterArtist} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1 text-left">
                    {/* Notice Dossier KYC */}
                    <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl flex items-start gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-[#FF5500] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Dossier Officiel d'Inscription Artiste
                        </h4>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                          Renseignez vos coordonnées complètes et vos pièces justificatives pour instruction administrative et activation des versements Mobile Money (80% net).
                        </p>
                      </div>
                    </div>

                    {/* Section 1 : Identité & Discipline */}
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                      <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
                        <span>1. Identité Créateur & Discipline</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Nom de Scène Officiel *
                          </label>
                          <input
                            type="text"
                            placeholder="Ex : Didi B, Josey, Fally..."
                            value={stageName}
                            onChange={(e) => setStageName(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#FF5500]"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Nom Réel d'État Civil *
                          </label>
                          <input
                            type="text"
                            placeholder="Nom officiel (conformité légale)"
                            value={artistRealName}
                            onChange={(e) => setArtistRealName(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#FF5500]"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Discipline Artistique *
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#FF5500]"
                          >
                            <option value="Musique & Rap Ivoire">Musique & Rap Ivoire</option>
                            <option value="Afro-Soul & Variété">Afro-Soul & Variété</option>
                            <option value="Danse & Chorégraphie">Danse & Chorégraphie</option>
                            <option value="Humour & Stand-up">Humour & Stand-up</option>
                            <option value="DJing & Beatmaking">DJing & Beatmaking</option>
                            <option value="Masterclass & Production">Masterclass & Production</option>
                            <option value="Arts Visuels & Mode">Arts Visuels & Mode</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Pays de Résidence & Création *
                          </label>
                          <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#FF5500]"
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 2 : Contact & Sécurité */}
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                      <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>2. Coordonnées de Contact & Sécurité</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Adresse Email Officielle *
                          </label>
                          <input
                            type="email"
                            placeholder="artiste.officiel@gmail.com"
                            value={artistEmail}
                            onChange={(e) => setArtistEmail(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#FF5500]"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Téléphone Direct / WhatsApp *
                          </label>
                          <input
                            type="tel"
                            placeholder="+225 07 00 00 00 00"
                            value={artistPhone}
                            onChange={(e) => setArtistPhone(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#FF5500]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Mot de Passe de Connexion Artiste (min 6 caractères) *
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#FF5500]"
                          required
                        />
                      </div>
                    </div>

                    {/* Section 3 : Photo de Profil */}
                    <div className="p-3 bg-gradient-to-r from-orange-50/70 to-transparent border border-orange-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-orange-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-[#FF5500]" />
                          <span>3. Photo de Profil de l'Artiste *</span>
                        </span>
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                          OBLIGATOIRE
                        </span>
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
                        className="border-2 border-dashed border-orange-300 hover:border-[#FF5500] rounded-xl p-3 flex items-center gap-3 cursor-pointer bg-white hover:bg-orange-50/50 transition-all group"
                      >
                        {artistPhoto ? (
                          <img
                            src={artistPhoto}
                            alt="Aperçu artiste"
                            className="w-14 h-14 rounded-xl object-cover border-2 border-[#FF5500] shadow-sm flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-[#FF5500] flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Upload className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#FF5500] transition-colors">
                            {artistPhoto ? "Photo sélectionnée (Cliquer pour changer)" : "Sélectionner la photo officielle"}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Portrait net ou photo de scène. Formats : JPG, PNG, WebP.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 4 : Pièce Légale d'Identité Recto-Verso */}
                    <div className="p-3 bg-purple-50/40 border border-purple-200 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                          <span>4. Pièce Légale d'Identité (Recto-Verso) *</span>
                        </span>
                        <select
                          value={idType}
                          onChange={(e) => setIdType(e.target.value)}
                          className="bg-white border border-purple-200 rounded-lg px-2 py-0.5 text-[11px] font-bold text-purple-900 focus:outline-none focus:border-purple-500"
                        >
                          <option value="cni">CNI</option>
                          <option value="passeport">Passeport</option>
                          <option value="permis">Permis</option>
                          <option value="carte_consulaire">Carte Consulaire</option>
                        </select>
                      </div>

                      <p className="text-[11px] text-gray-600">
                        Requis pour la certification officielle. Veuillez fournir les photos lisibles <strong>Recto et Verso</strong>.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
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
                            className="border-2 border-dashed border-purple-300 hover:border-purple-600 rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-purple-50 transition-all group h-28"
                          >
                            {idCardRecto ? (
                              <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                  src={idCardRecto}
                                  alt="Recto"
                                  className="max-h-full max-w-full rounded-md object-contain"
                                />
                                <span className="absolute bottom-0 right-0 bg-emerald-600 text-[9px] font-black text-white px-1.5 py-0.5 rounded shadow">
                                  ✓ RECTO
                                </span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform mb-1" />
                                <span className="text-xs font-bold text-slate-900">Photo RECTO *</span>
                                <span className="text-[9px] text-gray-500">Face avant</span>
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
                            className="border-2 border-dashed border-purple-300 hover:border-purple-600 rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-purple-50 transition-all group h-28"
                          >
                            {idCardVerso ? (
                              <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                  src={idCardVerso}
                                  alt="Verso"
                                  className="max-h-full max-w-full rounded-md object-contain"
                                />
                                <span className="absolute bottom-0 right-0 bg-emerald-600 text-[9px] font-black text-white px-1.5 py-0.5 rounded shadow">
                                  ✓ VERSO
                                </span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform mb-1" />
                                <span className="text-xs font-bold text-slate-900">Photo VERSO *</span>
                                <span className="text-[9px] text-gray-500">Face arrière</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 5 : Coordonnées Mobile Money */}
                    <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-2.5">
                      <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>5. Compte de Retrait Mobile Money (80% Net) *</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Opérateur de Versement *
                          </label>
                          <select
                            value={momoOperator}
                            onChange={(e) => setMomoOperator(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                          >
                            <option value="orange_money">Orange Money</option>
                            <option value="wave">Wave</option>
                            <option value="mtn">MTN MoMo</option>
                            <option value="moov">Moov Money</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Numéro de Compte Mobile Money *
                          </label>
                          <input
                            type="tel"
                            placeholder="+225 07 00 00 00 00"
                            value={momoNumber}
                            onChange={(e) => setMomoNumber(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500 font-mono"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 6 : Biographie */}
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-700">
                        Biographie & Parcours Artistique (Optionnel)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Présentez votre univers, vos actualités et votre démarche créative..."
                        value={artistBio}
                        onChange={(e) => setArtistBio(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#FF5500] resize-none"
                      />
                    </div>

                    {/* Bouton de Soumission */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-600 via-[#FF5500] to-amber-600 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-lg hover:shadow-orange-500/25 active:scale-[0.99] transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Traitement du dossier...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Déposer mon Dossier & Créer Compte Artiste</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
