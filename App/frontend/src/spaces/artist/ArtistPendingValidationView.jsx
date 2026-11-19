import React, { useState } from 'react';
import { 
  Clock, ShieldAlert, AlertCircle, User, Mail, Smartphone, 
  MapPin, Tag, FileText, CreditCard, Eye, X, CheckCircle2, 
  Sparkles, RefreshCw, LogOut
} from 'lucide-react';

export default function ArtistPendingValidationView({ currentUser, onRefresh, onLogout }) {
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);

  if (!currentUser) return null;

  const idTypeLabels = {
    cni: "Carte Nationale d'Identité (CNI)",
    passeport: "Passeport International",
    permis: "Permis de Conduire",
    carte_consulaire: "Carte Consulaire"
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300 px-2 sm:px-0">
      
      {/* Modal d'agrandissement pour les justificatifs */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-2xl w-full bg-[#161622] border border-white/20 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-black text-white">{selectedDocPreview.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedDocPreview(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-center bg-black/50 rounded-2xl p-2 min-h-[300px] max-h-[65vh] overflow-hidden">
              <img 
                src={selectedDocPreview.url} 
                alt="Document KYC" 
                className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Carte Bannière Principale : "Vous êtes en attente de validation" */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#291705] via-[#1E1218] to-[#12121E] border border-amber-500/40 shadow-2xl text-center space-y-4">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-amber-500/25 via-orange-500/15 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 animate-bounce" style={{ animationDuration: '3s' }}>
            <Clock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider">
            <span>Statut : Dossier Soumis</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Vous êtes en attente de validation
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Votre dossier d'artiste a bien été transmis aux équipes de régie et de gouvernance CDAR. L'accès à votre studio créateur sera débloqué dès qu'un administrateur aura vérifié vos pièces.
          </p>

          <div className="pt-2 flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/35 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Vérifier mon statut</span>
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Se déconnecter</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Récapitulatif Exhaustif des Informations Fournies lors de l'Inscription */}
      <div className="glass-panel border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 bg-white/80 dark:bg-[#151522]/90">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              <span>Récapitulatif des Informations Fournies pour votre Inscription</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Ces éléments font actuellement l'objet de vérifications de conformité.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/10">
            LECTURE SEULE
          </span>
        </div>

        {/* 2.1 Identité & Photo de Profil */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/5">
          <div className="relative flex-shrink-0 mx-auto sm:mx-0">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.stage_name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500/50 shadow-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedDocPreview({ title: "Photo de Profil Artiste", url: currentUser.avatar_url })}
                title="Cliquer pour agrandir"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-xl font-black">
                {currentUser.stage_name?.slice(0, 2).toUpperCase() || 'AR'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow">
              ⏳
            </span>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {currentUser.stage_name || "Nom de Scène"}
              </h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                {currentUser.category || "Musique"}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-400">
              Pays de rattachement : <strong className="text-slate-900 dark:text-white">{currentUser.country || "CI"}</strong>
            </p>
            {currentUser.bio && (
              <p className="text-xs text-slate-500 dark:text-gray-300 italic pt-1 line-clamp-2">
                "{currentUser.bio}"
              </p>
            )}
          </div>
        </div>

        {/* 2.2 Coordonnées & Paiement Mobile Money */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/5 space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>Contact Privé</span>
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              Email : <span className="font-mono text-slate-700 dark:text-gray-300">{currentUser.email || "Non renseigné"}</span>
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              Téléphone : <span className="font-mono text-slate-700 dark:text-gray-300">{currentUser.phone_number || "Non renseigné"}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/5 space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compte de Retrait Mobile Money (Part 80%)</span>
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Opérateur : <span className="font-mono uppercase text-emerald-600 dark:text-emerald-400">{currentUser.payout_operator || "Orange Money"}</span>
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Numéro de Versement : <span className="font-mono text-slate-700 dark:text-gray-300">{currentUser.payout_momo_number || "Non renseigné"}</span>
            </p>
          </div>
        </div>

        {/* 2.3 Pièce Légale d'Identité Fournie (Recto & Verso) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-purple-400" />
              <span>Justificatif Légal d'Identité Fourni</span>
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/35">
              {idTypeLabels[currentUser.kyc_id_type] || "CNI"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Recto */}
            <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-white/5 flex-shrink-0 border border-slate-300 dark:border-white/10">
                  {currentUser.kyc_id_document_recto_url || currentUser.kyc_id_document_url ? (
                    <img 
                      src={currentUser.kyc_id_document_recto_url || currentUser.kyc_id_document_url} 
                      alt="Recto miniature" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Photo RECTO</p>
                  <p className="text-[10px] text-gray-400">Face avant de la pièce</p>
                </div>
              </div>

              {(currentUser.kyc_id_document_recto_url || currentUser.kyc_id_document_url) && (
                <button
                  type="button"
                  onClick={() => setSelectedDocPreview({
                    title: `Photo Recto — ${idTypeLabels[currentUser.kyc_id_type] || "Pièce légale"}`,
                    url: currentUser.kyc_id_document_recto_url || currentUser.kyc_id_document_url
                  })}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Voir</span>
                </button>
              )}
            </div>

            {/* Verso */}
            <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-white/5 flex-shrink-0 border border-slate-300 dark:border-white/10">
                  {currentUser.kyc_id_document_verso_url ? (
                    <img 
                      src={currentUser.kyc_id_document_verso_url} 
                      alt="Verso miniature" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Photo VERSO</p>
                  <p className="text-[10px] text-gray-400">Face arrière de la pièce</p>
                </div>
              </div>

              {currentUser.kyc_id_document_verso_url && (
                <button
                  type="button"
                  onClick={() => setSelectedDocPreview({
                    title: `Photo Verso — ${idTypeLabels[currentUser.kyc_id_type] || "Pièce légale"}`,
                    url: currentUser.kyc_id_document_verso_url
                  })}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Voir</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2.4 Note d'information de l'administration */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300/90 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Pour des raisons de sécurité et de conformité aux réglementations de paiement Mobile Money en Côte d'Ivoire et dans la sous-région, les fonctionnalités de publication de contenu, de diffusion en direct et de monétisation restent suspendues jusqu'à la certification officielle par la régie.
          </p>
        </div>

      </div>
    </div>
  );
}
