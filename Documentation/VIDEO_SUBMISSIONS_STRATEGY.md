# Stratégie vidéo – soumissions testeurs

> Options pour charger les vidéos des testeurs (MVP) et préparation à l’analyse IA.

---

## 1. Contexte

| Élément | État actuel |
|--------|-------------|
| Schema | `submissions.video_url` (text) — prévu pour URL |
| Implémentation | Placeholder (`https://placeholder.test/submission-pending`) |
| Storage | `src/lib/storage/index.ts` — non implémenté |
| Objectif futur | Analyse IA des vidéos pour validation qualité des reviews |

---

## 2. Options MVP

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Option A: URL externe (Loom)  │  Option B: Supabase Storage  │  Option C: Mux/Stream  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Tester enregistre → colle URL │  Upload fichier → bucket    │  SDK tiers → hébergement │
│  Pas de stockage               │  Contrôle total             │  Streaming optimisé      │
│  Dépendance Loom               │  Coût stockage              │  Coût par minute         │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Critère | A – URL (Loom) | B – Supabase Storage | C – Mux/Stream |
|---------|----------------|----------------------|----------------|
| Complexité | Faible | Moyenne | Élevée |
| Coût initial | 0 | ~0,021 $/GB/mois | Par minute |
| Analyse IA | ✅ URL publique | ✅ URL signée | ✅ API dédiée |
| Indépendance | Faible | Forte | Moyenne |

---

## 3. Recommandation MVP : URL uniquement

**MoSCoW :**
- **M** : Champ URL + validation basique
- **S** : Domaine Loom autorisé (optionnel)
- **W** : Upload, stockage, enregistrement in-app

**Implémentation minimale :**
1. Remplacer le faux upload par un champ « URL de la vidéo »
2. Validation : format URL, domaine (ex. `loom.com`)
3. Persister dans `submissions.video_url`
4. `VideoPlayer` utilise déjà `src={url}`

---

## 4. Analyse IA (plus tard)

| Source vidéo | Accès IA |
|--------------|----------|
| URL publique (Loom) | Envoi direct de l’URL à l’API |
| Supabase Storage | Générer URL signée temporaire → envoi à l’API |
| Fichier local | Télécharger → base64 (éviter si possible) |

Les APIs (GPT-4o, Gemini, etc.) acceptent une URL. L’URL doit être accessible au moment de l’appel.

---

## 5. Évolution (v1 → v2 → v3)

| Phase | Approche | Déclencheur |
|-------|----------|-------------|
| **v1 (MVP)** | URL Loom | Valider flux + analyse IA |
| **v2** | Supabase Storage | Indépendance, contrôle RGPD, rétention |
| **v3** | Enregistrement in-app (MediaRecorder) | UX intégrée, moins de friction |

---

## 6. Décision

| Question | Réponse |
|----------|---------|
| Stocker les fichiers ou juste l’URL ? | **MVP : URL seule.** Stockage si besoin de contrôle/rétention. |
| Supabase Storage utile pour le MVP ? | Non. Overkill pour valider le produit. |
| L’IA peut analyser une URL ? | Oui. Les APIs acceptent une URL publique ou signée. |

---

*Dernière mise à jour : 2025-02-24*
