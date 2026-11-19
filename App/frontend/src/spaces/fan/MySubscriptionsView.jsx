import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';
import { apiGetMySubscriptions } from '../../api';

export default function MySubscriptionsView() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetMySubscriptions()
      .then(setSubscriptions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-xs text-gray-500 font-bold">Chargement de vos abonnements...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-20">
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Mes Abonnements VIP Actifs</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Accès illimité aux contenus et replays de vos créateurs</p>
        </div>
        <span className="text-xs font-black px-3.5 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 rounded-full border border-emerald-500/30 shadow-glow-emerald">
          {subscriptions.length} Actif(s)
        </span>
      </div>

      {subscriptions.length === 0 ? (
        <div className="glass-panel rounded-3xl p-10 text-center space-y-3 border border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto">
            <Flame className="w-7 h-7" />
          </div>
          <p className="text-gray-200 text-base font-extrabold">Vous n'avez aucun abonnement actif.</p>
          <p className="text-gray-400 text-xs max-w-sm mx-auto">
            Soutenez vos artistes préférés sur le fil d'actualité pour débloquer leurs exclusivités et échanger avec eux !
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map(sub => (
            <div key={sub.id} className="glass-panel glass-panel-hover rounded-3xl p-5 flex items-center justify-between border border-amber-500/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5500] via-[#FFB703] to-[#FF4500] flex items-center justify-center text-white font-black text-sm shadow-glow-orange">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-base text-white capitalize">Abonnement {sub.tier}</h4>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ACTIF (30 JOURS)
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Valide jusqu'au {new Date(sub.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-base font-black text-white">{sub.price_paid_cfa.toLocaleString('fr-FR')} <span className="text-xs text-amber-400">F CFA</span></p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Réf: {sub.reference}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
