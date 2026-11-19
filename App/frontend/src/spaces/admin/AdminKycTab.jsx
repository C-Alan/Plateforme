import React, { useState } from 'react';
import { UserCheck, CheckCircle2, Clock, XCircle, FileText, Eye, X, Image as ImageIcon } from 'lucide-react';

export default function AdminKycTab({ 
  pendingArtists = [], 
  loading = false, 
  onApprove, 
  onReject 
}) {
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null); // { title: string, url: string }

  return (
    <div className="space-y-4">
      {/* Modal de Prévisualisation grand format du Document Légal */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-3xl w-full bg-[#161622] border border-white/20 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-black text-white">{selectedPreviewDoc.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedPreviewDoc(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-center bg-black/40 rounded-2xl p-2 min-h-[350px] max-h-[70vh] overflow-hidden">
              <img 
                src={selectedPreviewDoc.url} 
                alt="Document KYC" 
                className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                Fermer la prévisualisation
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-xs text-gray-500 bg-white/50 dark:bg-[#12121A] rounded-3xl border border-slate-200 dark:border-white/5">
          Chargement des dossiers en attente...
        </div>
      ) : pendingArtists.length === 0 ? (
        <div className="bg-white/80 dark:bg-[#12121A] border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">Tous les dossiers sont à jour !</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
            Aucun nouvel artiste en attente d'approbation KYC. Tous les créateurs inscrits ont été vérifiés.
          </p>
        </div>
      ) : (
        pendingArtists.map(artist => (
          <div
            key={artist.id}
            className="bg-white dark:bg-gradient-to-r dark:from-[#171724] dark:to-[#12121A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-purple-500/30 transition-all"
          >
            {/* Infos Artiste & Photos */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              {/* Photo de profil de l'artiste */}
              <div className="relative group flex-shrink-0">
                {artist.avatar_url ? (
                  <img
                    src={artist.avatar_url}
                    alt={artist.stage_name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500/60 shadow-lg cursor-pointer group-hover:scale-105 transition-transform"
                    onClick={() => setSelectedPreviewDoc({ title: `Photo de Profil — ${artist.stage_name}`, url: artist.avatar_url })}
                    title="Agrandir la photo"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-purple-500/20">
                    {artist.stage_name?.slice(0, 2).toUpperCase() || 'AR'}
                  </div>
                )}
                {artist.avatar_url && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] shadow">
                    📷
                  </span>
                )}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">{artist.stage_name}</h4>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/30">
                    DOSSIER KYC EN ATTENTE
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-300">
                  Domaine : <strong className="text-slate-900 dark:text-white">{artist.category || 'Musique'}</strong> • Pays : <strong className="text-slate-900 dark:text-white">{artist.country}</strong>
                </p>
                <p className="text-xs text-cyan-600 dark:text-cyan-300 font-mono">
                  Compte Retrait : {artist.payout_momo_number} ({artist.payout_operator?.toUpperCase()})
                </p>
                {artist.bio && (
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 bg-slate-100 dark:bg-black/20 p-2 rounded-xl border border-slate-200 dark:border-white/5 line-clamp-2">
                    "{artist.bio}"
                  </p>
                )}
              </div>
            </div>

            {/* Pièce légale d'identité (Recto & Verso) */}
            <div className="p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2 flex-shrink-0">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Pièce Légale ({artist.kyc_id_type?.toUpperCase() || 'CNI'}) :</span>
              </span>

              <div className="flex items-center gap-2">
                {/* Recto */}
                {artist.kyc_id_document_recto_url || artist.kyc_id_document_url ? (
                  <button
                    type="button"
                    onClick={() => setSelectedPreviewDoc({
                      title: `Pièce Légale Recto (${artist.kyc_id_type || 'CNI'}) — ${artist.stage_name}`,
                      url: artist.kyc_id_document_recto_url || artist.kyc_id_document_url
                    })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all shadow-sm group"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>Voir Recto</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded-lg">Pas de recto</span>
                )}

                {/* Verso */}
                {artist.kyc_id_document_verso_url ? (
                  <button
                    type="button"
                    onClick={() => setSelectedPreviewDoc({
                      title: `Pièce Légale Verso (${artist.kyc_id_type || 'CNI'}) — ${artist.stage_name}`,
                      url: artist.kyc_id_document_verso_url
                    })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition-all shadow-sm group"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span>Voir Verso</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded-lg">Pas de verso</span>
                )}
              </div>
            </div>

            {/* Actions d'approbation */}
            <div className="flex items-center gap-3 self-end lg:self-center flex-shrink-0">
              <button
                onClick={() => onReject(artist.id, artist.stage_name)}
                className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/25 rounded-xl text-xs font-bold transition-all"
              >
                Rejeter
              </button>
              <button
                onClick={() => onApprove(artist.id, artist.stage_name)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Approuver & Certifier</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
