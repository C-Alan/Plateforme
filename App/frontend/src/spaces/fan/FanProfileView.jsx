import React, { useState, useEffect, useRef } from 'react';
import {
  User, Shield, HelpCircle, ArrowUpRight, ArrowDownLeft, ChevronRight,
  CreditCard, Sparkles, Plus, X, ExternalLink, LogOut, Sun, Moon,
  TrendingUp, Wallet, CheckCircle2, Smartphone, Bookmark, Radio,
  ShieldCheck, AlertCircle, ArrowUp, ArrowDown, ChevronDown, Check,
  Mail, MapPin, Lock, Save, Camera, UploadCloud
} from 'lucide-react';
import { apiUpdateProfile } from '../../api';

export default function FanProfileView({
  currentUser,
  onUpdateCurrentUser,
  onLogout,
  theme,
  setTheme,
  onGoToSubscriptions,
  onGoToLives
}) {
  if (!currentUser) return null;

  // Onglet d'écran actif parmi les vues du design INVETO (Plateforme_Credit_Fan_0.png)
  // 1: Vue Solde & Activités ('overview')
  // 2: Vue Mes Cartes & Tips ('cards')
  // 3: Vue Mon Profil & Paramètres ('settings')
  const [activeScreenTab, setActiveScreenTab] = useState('overview');

  // Soldes Fan & Crédits
  const [savingsBalance, setSavingsBalance] = useState(15615);
  const [assetsBalance, setAssetsBalance] = useState(9615);

  // Formulaire de profil Fan
  const [profileForm, setProfileForm] = useState({
    display_name: currentUser?.display_name || '',
    email: currentUser?.email || '',
    phone_number: currentUser?.phone_number || '',
    country: currentUser?.country || 'CI',
    avatar_url: currentUser?.avatar_url || '',
    payout_operator: currentUser?.payout_operator || 'orange_money',
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState(null);
  const avatarInputRef = useRef(null);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProfileErrorMsg("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileForm(prev => ({ ...prev, avatar_url: event.target.result }));
        setProfileSuccessMsg("Photo sélectionnée ! N'oubliez pas d'enregistrer.");
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setProfileForm(prev => ({
        ...prev,
        display_name: currentUser.display_name || '',
        email: currentUser.email || '',
        phone_number: currentUser.phone_number || '',
        country: currentUser.country || 'CI',
        avatar_url: currentUser.avatar_url || '',
        payout_operator: currentUser.payout_operator || 'orange_money'
      }));
    }
  }, [currentUser]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    if (profileForm.new_password) {
      if (!profileForm.current_password) {
        setProfileErrorMsg("Veuillez saisir votre mot de passe actuel.");
        setProfileLoading(false);
        return;
      }
      if (profileForm.new_password !== profileForm.confirm_new_password) {
        setProfileErrorMsg("La confirmation du mot de passe ne correspond pas.");
        setProfileLoading(false);
        return;
      }
    }

    try {
      const payload = {
        display_name: profileForm.display_name,
        email: profileForm.email,
        phone_number: profileForm.phone_number,
        country: profileForm.country,
        avatar_url: profileForm.avatar_url || undefined,
        payout_operator: profileForm.payout_operator,
        current_password: profileForm.current_password || undefined,
        new_password: profileForm.new_password || undefined
      };
      const updatedUser = await apiUpdateProfile(payload);
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(updatedUser);
      }
      setProfileSuccessMsg("✨ Vos coordonnées personnelles ont été enregistrées avec succès !");
      setProfileForm(prev => ({ ...prev, current_password: '', new_password: '', confirm_new_password: '' }));
      setTimeout(() => setProfileSuccessMsg(null), 5000);
    } catch (err) {
      setProfileErrorMsg(err.message || "Erreur de mise à jour du profil.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Modales d'Activités (Account, Privacy, Help)
  const [activeActivityModal, setActiveActivityModal] = useState(null);

  // Modale de Recharge de Crédits
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('5000');
  const [rechargeOperator, setRechargeOperator] = useState('orange');
  const [rechargeSuccess, setRechargeSuccess] = useState(null);

  // État de fermeture de la bannière tips
  const [tipsDismissed, setTipsDismissed] = useState(false);

  // Prénom ou nom d'affichage pour la salutation "Hi, Arthur!"
  const displayName = currentUser.display_name || 'Arthur';
  const firstName = displayName.split(' ')[0] || 'Arthur';

  // Liste des transactions du Fan (Écran 1)
  const [transactions, setTransactions] = useState([
    {
      id: 'tx_1',
      title: 'Recharge Crédits Mobile Money',
      subtitle: 'Orange Money • CI',
      amount: '+10 000 F',
      date: '28 Fév',
      isIncome: true,
      category: 'Recharge'
    },
    {
      id: 'tx_2',
      title: 'Abonnement VIP Didi B',
      subtitle: 'Pass Mensuel Officiel',
      amount: '-5 000 F',
      date: '25 Fév',
      isIncome: false,
      category: 'Abonnement'
    },
    {
      id: 'tx_3',
      title: 'Masterclass Flow & Business',
      subtitle: 'Ticket PPV Exclusif',
      amount: '-2 500 F',
      date: '18 Fév',
      isIncome: false,
      category: 'Contenu'
    },
    {
      id: 'tx_4',
      title: 'Pourboire Concert Live Studio',
      subtitle: 'Don Direct en Session Live',
      amount: '-1 000 F',
      date: '10 Fév',
      isIncome: false,
      category: 'Pourboire'
    }
  ]);

  // Traiter une recharge de crédits
  const handlePerformRecharge = () => {
    const amt = parseInt(rechargeAmount, 10) || 5000;
    setSavingsBalance(prev => prev + amt);

    const newTx = {
      id: `tx_${Date.now()}`,
      title: `Recharge Crédits ${rechargeOperator.toUpperCase()}`,
      subtitle: `${rechargeOperator === 'orange' ? 'Orange Money' : rechargeOperator === 'wave' ? 'Wave CI' : 'MTN MoMo'} • Instantané`,
      amount: `+${amt.toLocaleString('fr-FR')} F`,
      date: "Aujourd'hui",
      isIncome: true,
      category: 'Recharge'
    };
    setTransactions(prev => [newTx, ...prev]);

    setRechargeModalOpen(false);
    setRechargeSuccess(`✨ ${amt.toLocaleString('fr-FR')} F CFA ajoutés à votre solde de crédits avec succès !`);
    setTimeout(() => setRechargeSuccess(null), 4000);
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-28 pt-1 animate-in fade-in duration-300">

      {/* Toast Notification de Recharge */}
      {rechargeSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white text-xs font-black px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 animate-bounce border border-emerald-400/40">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{rechargeSuccess}</span>
        </div>
      )}

      {/* BOUTONS SÉLECTEURS DES VUES DU DESIGN INVETO (Plateforme_Credit_Fan_0.png) */}
      <div className="flex bg-slate-100 dark:bg-[#121820]/90 p-1 rounded-2xl border border-slate-200 dark:border-white/10 mb-3 shadow-sm dark:shadow-lg max-w-md mx-auto transition-colors">
        <button
          onClick={() => setActiveScreenTab('overview')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${activeScreenTab === 'overview'
            ? 'bg-[#00E599] text-slate-950 font-black shadow-sm'
            : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          Solde & Activités
        </button>
        <button
          onClick={() => setActiveScreenTab('cards')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${activeScreenTab === 'cards'
            ? 'bg-[#00E599] text-slate-950 font-black shadow-sm'
            : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          Mes Cartes (4)
        </button>
        <button
          onClick={() => setActiveScreenTab('settings')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeScreenTab === 'settings'
            ? 'bg-[#00E599] text-slate-950 font-black shadow-sm'
            : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Mon Profil</span>
        </button>
      </div>

      {/* CADRE MOBILE GLOBAL INSPIRÉ DE PLATEFORME_CREDIT_FAN_0.PNG */}
      <div className="bg-[#FAFBFD] dark:bg-[#0D0D14] rounded-[44px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-colors relative">

        {/* ========================================================= */}
        {/* VUE 1 : SOLDE, ACTIVITÉS & TRANSACTIONS (ÉCRAN GAUCHE)     */}
        {/* ========================================================= */}
        {activeScreenTab === 'overview' && (
          <div>
            {/* EN-TÊTE SOMBRE AVEC MOTIF TOPOGRAPHIQUE (ÉCRAN GAUCHE INVETO) */}
            <div className="relative bg-[#1A232A] p-6 pb-9 text-white overflow-hidden">

              {/* Lignes topographiques organiques en arrière-plan */}
              <svg
                className="absolute inset-0 w-full h-full opacity-15 pointer-events-none stroke-white"
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M-50,60 Q100,20 200,80 T450,50" strokeWidth="1.5" />
                <path d="M-50,110 Q120,70 220,130 T450,100" strokeWidth="1.5" />
                <path d="M-50,160 Q140,120 240,180 T450,150" strokeWidth="1.5" />
                <path d="M-50,210 Q160,170 260,230 T450,200" strokeWidth="1.5" />
                <path d="M-50,260 Q180,220 280,280 T450,250" strokeWidth="1.5" />
                <ellipse cx="320" cy="90" rx="90" ry="50" strokeWidth="1.2" />
                <ellipse cx="320" cy="90" rx="60" ry="32" strokeWidth="1.2" />
                <ellipse cx="320" cy="90" rx="30" ry="16" strokeWidth="1.2" />
              </svg>

              {/* Status Bar (09:41 + indicateurs) */}
              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-gray-300 pb-3">
                <span className="font-bold">9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">5G</span>
                  <div className="w-4 h-2 border border-current rounded-xs p-[1px]">
                    <div className="w-full h-full bg-current rounded-xs"></div>
                  </div>
                </div>
              </div>

              {/* Logo INVETO & Menu Header */}
              <div className="relative z-10 flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  {/* Icône Losange INVETO */}
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center p-1 border border-white/20">
                    <div className="w-3 h-3 bg-[#00E599] rotate-45 rounded-xs"></div>
                  </div>
                  <span className="font-black text-sm tracking-widest uppercase font-mono">
                    INVETO
                  </span>
                </div>

                {/* Icône Menu 2 barres horizontales (comme dans INVETO) */}
                <button
                  onClick={() => setActiveActivityModal('account')}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex flex-col items-end justify-center gap-1 px-2 transition-colors"
                >
                  <span className="w-4 h-0.5 bg-white rounded-full"></span>
                  <span className="w-2.5 h-0.5 bg-white rounded-full"></span>
                </button>
              </div>

              {/* Salutation : Hi, Arthur! Here's Your Balance. */}
              <div className="relative z-10 pt-5 space-y-0.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Hi, {firstName}!
                </h1>
                <p className="text-sm font-medium text-gray-300/90">
                  Here's Your Balance.
                </p>
              </div>

              {/* Dual Metrics Side-by-Side (SAVINGS & ASSETS) avec Barres de Progression */}
              <div className="relative z-10 grid grid-cols-2 gap-4 pt-4">
                {/* SAVINGS (Vert Émeraude) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 font-mono">
                    SAVINGS
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    ${savingsBalance.toLocaleString('fr-FR')}
                  </div>
                  {/* Barre de progression verte */}
                  <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-[#00E599] rounded-full shadow-glow-emerald"></div>
                  </div>
                </div>

                {/* ASSETS (Blanc / Gris) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 font-mono">
                    ASSETS
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    ${assetsBalance.toLocaleString('fr-FR')}
                  </div>
                  {/* Barre de progression blanche */}
                  <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
                    <div className="w-[60%] h-full bg-white/60 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Bouton rapide de recharge */}
              <div className="relative z-10 pt-4 flex justify-end">
                <button
                  onClick={() => setRechargeModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-[#00E599] hover:bg-[#00D088] text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Recharger</span>
                </button>
              </div>

            </div>

            {/* DÔME ARRONDIE DU BAS AVEC ACTIVITÉS & TRANSACTIONS */}
            <div className="relative z-20 bg-white dark:bg-[#12121E] rounded-t-[36px] -mt-5 p-5 sm:p-6 shadow-[0_-12px_30px_rgba(0,0,0,0.15)] space-y-6">

              {/* SECTION ACTIVITIES (3 CARTES SQUIRCLES BLANCHES) */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Activities
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {/* 1. Account */}
                  <button
                    onClick={() => setActiveActivityModal('account')}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:scale-[1.03] transition-all shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-200/60 dark:bg-white/10 flex items-center justify-center text-slate-800 dark:text-gray-200">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-gray-200">
                      Account
                    </span>
                  </button>

                  {/* 2. Privacy */}
                  <button
                    onClick={() => setActiveActivityModal('privacy')}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:scale-[1.03] transition-all shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-200/60 dark:bg-white/10 flex items-center justify-center text-slate-800 dark:text-gray-200">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-gray-200">
                      Privacy
                    </span>
                  </button>

                  {/* 3. Help */}
                  <button
                    onClick={() => setActiveActivityModal('help')}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:scale-[1.03] transition-all shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-200/60 dark:bg-white/10 flex items-center justify-center text-slate-800 dark:text-gray-200">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-gray-200">
                      Help
                    </span>
                  </button>
                </div>
              </div>

              {/* SECTION TRANSACTIONS (LISTE RÉCENTE DU FAN) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Transactions
                  </h3>
                  <span className="text-[11px] font-bold text-gray-400 font-mono">
                    {transactions.length} RÉCENTES
                  </span>
                </div>

                <div className="space-y-2.5">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Icône Cercle Vert (Recharge) ou Noir (Dépense) */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.isIncome
                          ? 'bg-[#00E599] text-slate-950'
                          : 'bg-slate-900 dark:bg-white/20 text-white'
                          }`}>
                          {tx.isIncome ? (
                            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {tx.title}
                          </h4>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                            {tx.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Montant & Date */}
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs font-extrabold font-mono block ${tx.isIncome ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                          }`}>
                          {tx.amount}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {tx.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VUE 2 : MES CARTES & TIPS (ÉCRAN CENTRE DU VISUEL INVETO) */}
        {/* ========================================================= */}
        {activeScreenTab === 'cards' && (
          <div className="p-5 sm:p-6 space-y-6">

            {/* Header Inveto Top */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-white/10 flex items-center justify-center p-1">
                  <div className="w-3 h-3 bg-[#00E599] rotate-45 rounded-xs"></div>
                </div>
                <span className="font-black text-sm tracking-widest uppercase font-mono text-slate-900 dark:text-white">
                  INVETO
                </span>
              </div>
              <span className="text-xs font-bold text-gray-400 font-mono">
                9:41
              </span>
            </div>

            {/* BANNIÈRE "Investing Tips" (Écran Centre) */}
            {!tipsDismissed && (
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Investing Tips
                </h3>

                <div className="relative p-4 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center gap-4 shadow-sm">
                  {/* Bouton fermer (X) */}
                  <button
                    onClick={() => setTipsDismissed(true)}
                    className="absolute top-3 right-3 text-emerald-700 dark:text-emerald-400 hover:opacity-75"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Illustration Tirelire / Cochon Vert */}
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-emerald-900/40 border border-emerald-300/40 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <span className="text-2xl">🐷</span>
                  </div>

                  {/* Contenu textuel */}
                  <div className="space-y-1 min-w-0 pr-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Comment maximiser vos Pass VIP ?
                    </h4>
                    <p className="text-[10px] text-slate-600 dark:text-gray-300">
                      Par l'équipe créative CDAR
                    </p>
                    <button
                      onClick={() => onGoToSubscriptions && onGoToSubscriptions()}
                      className="px-3 py-1 rounded-full bg-[#00E599] text-slate-950 font-black text-[10px] tracking-wider uppercase mt-1 hover:brightness-105"
                    >
                      LEARN MORE
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION "My Cards (4)" (SWIPEABLE HORIZONTAL) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  My Cards (4)
                </h3>
                <span className="text-xs font-bold text-[#00E599] cursor-pointer hover:underline font-mono">
                  + Ajouter
                </span>
              </div>

              {/* Carrousel de cartes bancaires & Mobile Money */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 -mx-1 px-1 snap-x scroll-smooth">
                {/* CARTE 1 : Noire Anthracite avec Chip & Solde (Écran Centre) */}
                <div className="w-64 sm:w-72 h-44 rounded-3xl p-5 bg-[#20272F] text-white flex-shrink-0 snap-start shadow-xl relative overflow-hidden flex flex-col justify-between border border-white/10 group">
                  <div className="flex items-center justify-between">
                    {/* Chip doré */}
                    <div className="w-8 h-6 rounded-md bg-amber-300/80 border border-amber-400 flex items-center justify-center shadow-inner">
                      <div className="w-4 h-3 border border-amber-600/50 rounded-xs"></div>
                    </div>
                    <span className="font-mono text-xs text-gray-400">
                      •••• 6175
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-gray-400">
                      PASS PRIVILÈGE CDAR
                    </span>
                    <div className="text-xl font-black font-mono tracking-tight">
                      $ 47,417
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold text-gray-300 font-mono">
                      {displayName.toUpperCase()}
                    </span>
                    {/* Logo Mastercard cercles */}
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full bg-rose-500 opacity-90"></div>
                      <div className="w-5 h-5 rounded-full bg-amber-400 opacity-90"></div>
                    </div>
                  </div>
                </div>

                {/* CARTE 2 : Blanche / Argentée avec Chip & Solde (Écran Centre) */}
                <div className="w-64 sm:w-72 h-44 rounded-3xl p-5 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-900 dark:text-white flex-shrink-0 snap-start shadow-xl relative overflow-hidden flex flex-col justify-between border border-slate-300 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-6 rounded-md bg-amber-400/80 border border-amber-500 flex items-center justify-center shadow-inner">
                      <div className="w-4 h-3 border border-amber-700/50 rounded-xs"></div>
                    </div>
                    <span className="font-mono text-xs text-slate-600 dark:text-gray-300">
                      •••• 4290
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 dark:text-gray-400">
                      WAVE MONEY PASS
                    </span>
                    <div className="text-xl font-black font-mono tracking-tight">
                      $ 584,400
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold font-mono">
                      VALABLE CI & SN
                    </span>
                    <span className="font-black text-sm font-mono tracking-tighter text-blue-600 dark:text-sky-400">
                      VISA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Raccourcis Rapides Abonnements & Lives */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={onGoToSubscriptions}
                className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left space-y-1 hover:border-[#00E599] transition-colors"
              >
                <Bookmark className="w-4 h-4 text-orange-500 mb-1" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mes Abonnements</h4>
                <p className="text-[10px] text-gray-500">Gérer mes pass VIP</p>
              </button>

              <button
                onClick={onGoToLives}
                className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left space-y-1 hover:border-[#00E599] transition-colors"
              >
                <Radio className="w-4 h-4 text-rose-500 mb-1 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Lives & Directs 🔴</h4>
                <p className="text-[10px] text-gray-500">Sessions en direct</p>
              </button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* VUE 3 : PARAMÈTRES DU PROFIL & COORDONNÉES PERSONNELLES   */}
        {/* ========================================================= */}
        {activeScreenTab === 'settings' && (
          <div>
            {/* EN-TÊTE SOMBRE AVEC MOTIF TOPOGRAPHIQUE (STYLE INVETO) */}
            <div className="relative bg-[#1A232A] p-6 pb-8 text-white overflow-hidden">
              <svg
                className="absolute inset-0 w-full h-full opacity-15 pointer-events-none stroke-white"
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M-50,60 Q100,20 200,80 T450,50" strokeWidth="1.5" />
                <path d="M-50,110 Q120,70 220,130 T450,100" strokeWidth="1.5" />
                <path d="M-50,160 Q140,120 240,180 T450,150" strokeWidth="1.5" />
                <ellipse cx="320" cy="90" rx="90" ry="50" strokeWidth="1.2" />
              </svg>

              {/* Status Bar */}
              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-gray-300 pb-3">
                <span className="font-bold">9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">5G</span>
                  <div className="w-4 h-2 border border-current rounded-xs p-[1px]">
                    <div className="w-full h-full bg-current rounded-xs"></div>
                  </div>
                </div>
              </div>

              {/* Titre & Identité Fan */}
              <div className="relative z-10 flex items-center gap-4 pt-1">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  title="Cliquer pour changer votre photo de profil"
                  className="relative group cursor-pointer"
                >
                  <img
                    src={profileForm.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}
                    alt={profileForm.display_name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00E599] shadow-xl group-hover:opacity-75 transition-all group-hover:scale-105"
                  />
                  {/* Overlay au survol */}
                  <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                    <Camera className="w-5 h-5 text-[#00E599]" />
                    <span className="text-[8px] font-bold mt-0.5">Modifier</span>
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00E599] border-2 border-[#1A232A] flex items-center justify-center text-[10px] text-slate-950 font-black shadow-md">
                    ✓
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{profileForm.display_name || "Arthur"}</h3>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#00E599] text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Changer photo</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#00E599] font-mono">Membre Fan CDAR • {profileForm.country}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5 font-mono">{currentUser.email || currentUser.phone_number}</p>
                </div>
              </div>
            </div>

            {/* CORPS DU FORMULAIRE */}
            <div className="p-6 space-y-5">
              {/* Alertes */}
              {profileSuccessMsg && (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-4 bg-rose-500/15 border border-rose-500/40 text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">

                {/* 1. Coordonnées Personnelles */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#00E599]" />
                    <span>Informations & Coordonnées Personnelles</span>
                  </span>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Nom ou Pseudo Fan *
                    </label>
                    <input
                      type="text"
                      name="display_name"
                      value={profileForm.display_name}
                      onChange={handleProfileChange}
                      placeholder="Ex : Arthur Koffi"
                      className="w-full bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00E599] font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Adresse Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        placeholder="votre.email@gmail.com"
                        className="w-full bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00E599] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Numéro Mobile Money
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={profileForm.phone_number}
                        onChange={handleProfileChange}
                        placeholder="+225 07 00 11 22 33"
                        className="w-full bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00E599] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Pays de Résidence
                      </label>
                      <select
                        name="country"
                        value={profileForm.country}
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00E599] font-bold"
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
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Opérateur Mobile Favori
                      </label>
                      <select
                        name="payout_operator"
                        value={profileForm.payout_operator}
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00E599] font-bold"
                      >
                        <option value="orange_money">Orange Money</option>
                        <option value="wave">Wave</option>
                        <option value="mtn">MTN MoMo</option>
                        <option value="moov">Moov Money</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Changement de mot de passe */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-3">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sécurité & Mot de Passe (Optionnel)</span>
                  </span>

                  <div className="space-y-2">
                    <input
                      type="password"
                      name="current_password"
                      value={profileForm.current_password}
                      onChange={handleProfileChange}
                      placeholder="Mot de passe actuel"
                      className="w-full bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00E599]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="password"
                        name="new_password"
                        value={profileForm.new_password}
                        onChange={handleProfileChange}
                        placeholder="Nouveau mot de passe"
                        className="w-full bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00E599]"
                      />
                      <input
                        type="password"
                        name="confirm_new_password"
                        value={profileForm.confirm_new_password}
                        onChange={handleProfileChange}
                        placeholder="Confirmer"
                        className="w-full bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00E599]"
                      />
                    </div>
                  </div>
                </div>

                {/* Bouton d'Enregistrement */}
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full py-3 rounded-2xl bg-[#00E599] hover:brightness-105 active:scale-98 text-slate-950 font-black text-xs shadow-lg shadow-[#00E599]/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileLoading ? "Enregistrement..." : "Enregistrer mes Coordonnées"}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SECTION FOOTER AVEC DÉCONNEXION & PARAMÈTRES */}
        <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-white/10 space-y-3">
          <button
            onClick={() => setActiveActivityModal('account')}
            className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>Paramètres du Compte & Thème</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-500 font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Se Déconnecter de l'Espace Fan</span>
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* MODALE RECHARGE DE CRÉDITS MOBILE MONEY                   */}
      {/* ========================================================= */}
      {rechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[36px] bg-[#12121E] border border-white/15 p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200 text-white">
            <button
              onClick={() => setRechargeModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-[#00E599] font-mono tracking-widest">
                PORTEFEUILLE FAN
              </span>
              <h3 className="text-lg font-black text-white">
                Recharger mes Crédits
              </h3>
            </div>

            {/* Choix opérateur Mobile Money */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-semibold">Opérateur Mobile Money :</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'orange', label: 'Orange Money' },
                  { id: 'wave', label: 'Wave' },
                  { id: 'mtn', label: 'MTN MoMo' },
                ].map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setRechargeOperator(op.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${rechargeOperator === op.id
                      ? 'bg-[#00E599] text-slate-950 border-[#00E599] font-black'
                      : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Montant prédéfini */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-semibold">Montant à recharger :</label>
              <div className="grid grid-cols-3 gap-2">
                {['2000', '5000', '10000'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setRechargeAmount(amt)}
                    className={`py-2 px-1 rounded-xl text-xs font-mono font-bold border transition-all ${rechargeAmount === amt
                      ? 'bg-white text-slate-950 font-black border-white'
                      : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                  >
                    {parseInt(amt, 10).toLocaleString('fr-FR')} F
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePerformRecharge}
              className="w-full py-3 rounded-2xl bg-[#00E599] hover:bg-[#00D088] text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirmer la Recharge ({parseInt(rechargeAmount, 10).toLocaleString('fr-FR')} F CFA)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALE ACTIVITÉS (Account / Privacy / Help)                */}
      {/* ========================================================= */}
      {activeActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[36px] bg-[#12121E] border border-white/15 p-6 shadow-2xl relative space-y-4 text-white animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveActivityModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {activeActivityModal === 'account' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#00E599]/20 text-[#00E599] flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">Mon Compte Fan</h3>
                    <p className="text-xs text-gray-400">Identifiant : {currentUser.id?.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="space-y-2 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-300">
                  <p><strong>Nom :</strong> {currentUser.display_name || 'Arthur'}</p>
                  <p><strong>Email :</strong> {currentUser.email || 'fan@cdar.ci'}</p>
                  <p><strong>Téléphone :</strong> {currentUser.phone_number || 'Non renseigné'}</p>
                  <p><strong>Pays :</strong> {currentUser.country || 'Côte d\'Ivoire'}</p>
                </div>

                <button
                  onClick={() => {
                    setActiveActivityModal(null);
                    setActiveScreenTab('settings');
                  }}
                  className="w-full py-2.5 rounded-2xl bg-[#00E599] hover:brightness-105 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Modifier mon Profil & Coordonnées</span>
                </button>

                {/* Apparence Thème */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-xs font-bold">Thème</span>
                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setTheme && setTheme('light')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${theme === 'light' ? 'bg-[#00E599] text-slate-950 font-black' : 'text-gray-400'
                        }`}
                    >
                      Clair
                    </button>
                    <button
                      onClick={() => setTheme && setTheme('dark')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${theme === 'dark' ? 'bg-[#00E599] text-slate-950 font-black' : 'text-gray-400'
                        }`}
                    >
                      Sombre
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeActivityModal === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">Sécurité & Confidentialité</h3>
                    <p className="text-xs text-emerald-400 font-mono font-bold">DRM & CHIFFREMENT ACTIF</p>
                  </div>
                </div>

                <div className="space-y-2 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-300 leading-relaxed">
                  <p>✓ Filigrane dynamique anti-capture d'écran appliqué sur tous les flux médias.</p>
                  <p>✓ Paiements chiffrés de bout en bout via passerelles Mobile Money certifiées.</p>
                  <p>✓ Aucune coordonnée bancaire n'est stockée en clair sur nos serveurs.</p>
                </div>
              </div>
            )}

            {activeActivityModal === 'help' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">Assistance & Support</h3>
                    <p className="text-xs text-gray-400">Équipe CDAR disponible 24/7</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-300">
                  <p>Besoin d'aide pour débloquer un contenu, assister à un live ou gérer vos crédits ?</p>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 font-mono text-[11px] space-y-1">
                    <p>📧 support@cdar.ci</p>
                    <p>📞 +225 07 00 11 22 33 (WhatsApp)</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveActivityModal(null)}
              className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
