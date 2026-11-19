import React, { useState, useRef } from 'react';
import { 
  Upload, CheckCircle2, Video, Music, Image as ImageIcon, Mic, 
  Sparkles, Lock, Globe, Ticket, Play, Volume2, ShieldCheck, Eye, 
  Calculator, ArrowRight, FileCheck, X, AlertCircle
} from 'lucide-react';
import { apiCreatePost } from '../../api';

export default function PostPublisher({ onPostCreated }) {
  const [postTitle, setPostTitle] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [contentType, setContentType] = useState('video');
  const [visibility, setVisibility] = useState('subscribers');
  const [priceCfa, setPriceCfa] = useState('5000');
  
  // Médias réels sélectionnés par l'artiste
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaDataUrl, setMediaDataUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [fileError, setFileError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const pricePresets = [1000, 2500, 5000, 10000];

  // Gestion des types MIME acceptés selon le format choisi
  const getAcceptedMimeTypes = () => {
    switch (contentType) {
      case 'video':
        return 'video/mp4,video/webm,video/quicktime,video/x-matroska';
      case 'music':
      case 'podcast':
        return 'audio/mpeg,audio/mp3,audio/wav,audio/aac,audio/ogg,audio/m4a';
      case 'photo':
        return 'image/jpeg,image/png,image/webp,image/gif';
      default:
        return 'video/*,audio/*,image/*';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Ko';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Traitement du fichier sélectionné
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileError(null);
      setSelectedFile(file);
      setFileName(file.name);
      setFileSizeStr(formatFileSize(file.size));

      // Pré-remplir le titre si vide
      if (!postTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setPostTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }

      // Lecture en DataURL pour prévisualisation et persistance
      const reader = new FileReader();
      reader.onload = (event) => {
        setMediaDataUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setMediaDataUrl('');
    setFileName('');
    setFileSizeStr('');
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFileError(null);

    // Validation : Fichier réel obligatoire
    if (!selectedFile && !mediaDataUrl) {
      setFileError("Veuillez sélectionner un fichier média réel depuis votre appareil.");
      return;
    }

    setIsSubmitting(true);
    setPostSuccess(false);
    try {
      await apiCreatePost({
        title: postTitle,
        caption: postCaption,
        content_type: contentType,
        visibility: visibility,
        price_cfa: visibility === 'ppv' ? parseFloat(priceCfa) : 0,
        media_url: mediaDataUrl || `https://cdn.cdar.ci/uploads/${fileName}`,
        teaser_media_url: contentType === 'video' || contentType === 'photo' 
          ? mediaDataUrl 
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        media_filename: fileName,
        media_filesize: fileSizeStr
      });
      setPostSuccess(true);
      setPostTitle('');
      setPostCaption('');
      setSelectedFile(null);
      setMediaDataUrl('');
      setFileName('');
      setFileSizeStr('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onPostCreated) onPostCreated();
      setTimeout(() => setPostSuccess(false), 4500);
    } catch (err) {
      alert(err.message || "Erreur lors de la publication du média");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mediaTypes = [
    { id: 'video', label: 'Vidéo HD', icon: Video, color: 'text-rose-400', activeBg: 'border-rose-500/50 bg-rose-500/15 text-white shadow-glow-orange', ext: 'MP4, MOV, WebM' },
    { id: 'music', label: 'Morceau / Son', icon: Music, color: 'text-purple-400', activeBg: 'border-purple-500/50 bg-purple-500/15 text-white shadow-glow-purple', ext: 'MP3, WAV, AAC' },
    { id: 'photo', label: 'Photos / Galerie', icon: ImageIcon, color: 'text-amber-400', activeBg: 'border-amber-500/50 bg-amber-500/15 text-white shadow-glow-amber', ext: 'JPG, PNG, WebP' },
    { id: 'podcast', label: 'Vocal / Podcast', icon: Mic, color: 'text-cyan-400', activeBg: 'border-cyan-500/50 bg-cyan-500/15 text-white shadow-glow-wave', ext: 'MP3, M4A, OGG' },
  ];

  const accessOptions = [
    {
      id: 'subscribers',
      title: 'Réservé Abonnés VIP',
      desc: 'Inclus dans les abonnements VIP et Super Fan',
      icon: Lock,
      color: 'text-amber-400',
      activeBorder: 'border-amber-500/50 bg-amber-500/15 ring-1 ring-amber-400/40'
    },
    {
      id: 'ppv',
      title: 'Pay-Per-View (PPV)',
      desc: 'Vente à l\'unité avec paiement direct Mobile Money',
      icon: Ticket,
      color: 'text-orange-400',
      activeBorder: 'border-[#FF7A00]/50 bg-[#FF7A00]/15 ring-1 ring-[#FF7A00]/40'
    },
    {
      id: 'free',
      title: 'Public / Découverte',
      desc: 'Accès libre pour attirer de nouveaux abonnés',
      icon: Globe,
      color: 'text-emerald-400',
      activeBorder: 'border-emerald-500/50 bg-emerald-500/15 ring-1 ring-emerald-400/40'
    }
  ];

  const numPrice = parseFloat(priceCfa) || 0;
  const netGain = Math.round(numPrice * 0.8);

  return (
    <form onSubmit={handleSubmit} className="glass-panel border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl transition-colors bg-white/80 dark:bg-[#151522]/90">
      
      {/* Header Formulaire */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF7A00]" />
            <span>Publier un Nouveau Contenu Exclusif</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Protection DRM intégrée, transcodage automatique et monétisation 80% directe Mobile Money
          </p>
        </div>
        <span className="self-start text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Watermark Anti-Piratage</span>
        </span>
      </div>

      {postSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/10 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-extrabold text-white">Contenu publié avec succès !</p>
            <p className="text-[11px] text-emerald-300/90 mt-0.5">Le fichier a été encodé et vos fans abonnés ont été immédiatement notifiés dans leur flux.</p>
          </div>
        </div>
      )}

      {/* Disposition Ergonomique 2 Colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLONNE GAUCHE (7 Cols) : Format, Fichier Réel, Titre, Message & Aperçu */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 1. Format Média */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
              1. Format du média
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {mediaTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = contentType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setContentType(t.id);
                      // Si un fichier incompatible était chargé, avertir
                      if (selectedFile) setFileError(null);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? t.activeBg
                        : 'bg-slate-50 dark:bg-[#0E0E18] border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/15 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? t.color : 'text-slate-400 dark:text-gray-400'}`} />
                    <span className={`text-xs font-black ${isSelected ? 'text-slate-950 dark:text-white' : ''}`}>
                      {t.label}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">
                      {t.ext}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Sélection du Fichier Média Réel (Glisser-Déposer ou Clic) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
                2. Sélectionner votre fichier média réel *
              </label>
              {selectedFile && (
                <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> FICHIER PRÊT
                </span>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={getAcceptedMimeTypes()}
              className="hidden"
            />

            {/* Zone de Drop / Sélection Interactive */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-5 text-center cursor-pointer transition-all group relative overflow-hidden ${
                selectedFile 
                  ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10 hover:border-emerald-500' 
                  : 'border-orange-500/40 hover:border-orange-500 bg-slate-50 dark:bg-[#0E0E18] hover:bg-orange-500/5'
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-emerald-500/25">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {fileName}
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                        Taille : {fileSizeStr} • Format {contentType.toUpperCase()}
                      </p>
                      <span className="text-[10px] text-gray-400 underline group-hover:text-white transition-colors">
                        Cliquer pour remplacer le fichier
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-rose-500 hover:text-white flex items-center justify-center text-slate-600 dark:text-gray-300 transition-colors flex-shrink-0"
                    title="Supprimer ce fichier"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="py-4 space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5500] to-[#FFAA00] flex items-center justify-center text-white mx-auto shadow-md shadow-orange-500/25 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      Cliquez pour choisir votre fichier <span className="text-[#FF7A00] capitalize">{contentType}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                      ou glissez-déposez directement depuis votre ordinateur ou smartphone
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300">
                      {mediaTypes.find(t => t.id === contentType)?.ext}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Max 500 Mo</span>
                  </div>
                </div>
              )}
            </div>

            {fileError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          {/* 3. Titre & Message */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                3. Titre de la publication *
              </label>
              <input
                type="text"
                placeholder="Ex : Nouveau Single 'Mojo Trône' (Version Studio Non-Censurée)"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                4. Message & Contexte pour vos fans
              </label>
              <textarea
                rows="3"
                placeholder="Racontez la genèse du morceau, remerciez vos abonnés ou donnez des indices sur le prochain concert..."
                value={postCaption}
                onChange={(e) => setPostCaption(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all resize-none"
              />
            </div>
          </div>

          {/* 5. Cadre d'aperçu dynamique live */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
              Aperçu en Direct du Lecteur
            </span>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950 relative aspect-video flex items-center justify-center shadow-inner group">
              {contentType === 'photo' && mediaDataUrl ? (
                <img
                  src={mediaDataUrl}
                  alt="Aperçu photo"
                  className="w-full h-full object-contain"
                />
              ) : contentType === 'video' && mediaDataUrl ? (
                <video
                  src={mediaDataUrl}
                  className="w-full h-full object-contain"
                  controls
                  muted
                />
              ) : contentType === 'music' && mediaDataUrl ? (
                <div className="w-full p-6 flex flex-col items-center justify-center space-y-3 bg-gradient-to-b from-purple-900/40 to-black">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/30">
                    <Volume2 className="w-8 h-8 animate-pulse" />
                  </div>
                  <audio src={mediaDataUrl} controls className="w-full max-w-sm mt-2" />
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800"
                  alt="Aperçu générique"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                />
              )}

              {/* Watermark et overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none flex flex-col justify-between p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                    Aperçu Fan
                  </span>
                  <span className="text-[9px] font-mono text-amber-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                    WATERMARK CDAR PROTÉGÉ
                  </span>
                </div>

                {!mediaDataUrl && (
                  <div className="flex items-center justify-center my-auto">
                    {contentType === 'video' ? (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5500] to-[#FFAA00] text-white flex items-center justify-center shadow-glow-orange">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    ) : contentType === 'music' ? (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-glow-purple">
                        <Volume2 className="w-5 h-5 animate-pulse" />
                      </div>
                    ) : contentType === 'podcast' ? (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-glow-wave">
                        <Mic className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-glow-amber">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                )}

                <div className="text-white">
                  <p className="text-xs font-black truncate">{postTitle || (fileName ? fileName : "Titre de votre publication")}</p>
                  <p className="text-[10px] text-white/80 line-clamp-1">{postCaption || "Message d'accompagnement aux fans..."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE (5 Cols) : Monétisation, Calculateur & Validation */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
          
          {/* 6. Droits d'Accès */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1">
              5. Droits d'accès & Monétisation
            </label>
            <div className="space-y-2">
              {accessOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = visibility === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setVisibility(opt.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? opt.activeBorder
                        : 'bg-slate-50 dark:bg-[#0E0E18] border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <Icon className={`w-4 h-4 ${isSelected ? opt.color : 'text-slate-400 dark:text-gray-400'}`} />
                      <span className={`text-xs font-black ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-gray-300'}`}>
                        {opt.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-snug">{opt.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Panneau Tarif PPV si sélectionné */}
            {visibility === 'ppv' && (
              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-orange-600 dark:text-orange-300 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Prix du Ticket PPV</span>
                  </label>
                  <span className="text-xs font-black text-[#FF7A00]">
                    {netGain.toLocaleString('fr-FR')} F net / vente
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="500"
                    min="500"
                    max="50000"
                    value={priceCfa}
                    onChange={(e) => setPriceCfa(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E0E16] border border-orange-500/40 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-black text-sm text-right focus:outline-none focus:border-[#FF7A00]"
                  />
                  <span className="text-xs font-black text-[#FF7A00] flex-shrink-0">F CFA</span>
                </div>

                {/* Boutons Présélections rapides */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold">Suggestions :</span>
                  {pricePresets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriceCfa(p.toString())}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                        priceCfa === p.toString()
                          ? 'bg-[#FF7A00] text-white shadow-sm'
                          : 'bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-orange-500'
                      }`}
                    >
                      {p.toLocaleString('fr-FR')} F
                    </button>
                  ))}
                </div>

                {/* Simulateur de Gains Instantanés */}
                <div className="pt-2 border-t border-orange-500/20 text-[11px] text-slate-600 dark:text-gray-300 space-y-1">
                  <div className="flex justify-between">
                    <span>50 achats de fans :</span>
                    <strong className="text-emerald-500 font-black">{(netGain * 50).toLocaleString('fr-FR')} F CFA</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>150 achats de fans :</span>
                    <strong className="text-emerald-500 font-black">{(netGain * 150).toLocaleString('fr-FR')} F CFA</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 7. Protection & Bouton de Soumission Sticky */}
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-gray-400 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-slate-800 dark:text-gray-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Rétribution 80% Mobile Money Garanti (Wave, Orange, MTN)</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Les recettes nettes sont instantanément créditées sur votre solde retirable sans délai de carence.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-[#FF5500] via-[#FF7A00] to-yellow-500 hover:brightness-110 active:scale-[0.99] text-white font-black rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{isSubmitting ? "Encodage et publication en cours..." : "Mettre en Ligne Immédiatement"}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
