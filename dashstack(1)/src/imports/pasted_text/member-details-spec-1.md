# FICHE MEMBRE `/members/:id` — Spec complète v2

## 👉 Objectif
Accéder, comprendre et agir sur un membre en moins de 10 secondes.

***

## 🧠 1. Structure globale (layout)

```
[ HEADER STICKY ]
Avatar | Nom | Statut | Plan | Club | Risk Score | Actions | ⋮

[ LEFT 70% ]              [ RIGHT 30% ]
Infos personnelles        Actions rapides (sticky)
Contrats                  Risk Score détaillé
Activité + mini graph     Alertes actives
Timeline unifiée          Notes internes staff
                          Stats rapides
```

***

## 🧩 2. HEADER STICKY

### Contenu
- **Avatar** avec initiales (couleur selon statut : vert=actif / orange=suspendu / gris=anonymisé)
- **Nom complet** `LastName FirstName`
- **Statut** → dropdown inline cliquable (Active / Suspended) — `PATCH /api/members/:id` au changement
- **Plan actuel** → badge (ex: "Premium")
- **Club domicile** → texte cliquable → `/clubs/:id`
- **🔴 Risk Score** → badge coloré `82/100` visible immédiatement (0-30=vert / 31-60=orange / 61-100=rouge)
- **Breadcrumb** : `Membres > Jean Dupont`

### Boutons header
| Bouton | Action |
|---|---|
| **Modifier** | Edition inline activée sur tous les champs |
| **Check-in** | `POST /api/access/member` → toast Granted ✅ / Denied ❌ |
| **⋮ Menu avancé** | Suspendre / Réactiver / Anonymiser GDPR / Exporter fiche PDF |

### UX avancée
- Header reste visible en scroll (position sticky)
- Changement de statut → optimistic UI (mise à jour immédiate côté client, rollback si erreur API)
- Feedback toast immédiat sur chaque action

***

## 👤 3. COLONNE GAUCHE (70%)

### 🔹 A. Informations personnelles
Carte avec icônes légères, bouton "Éditer" en haut à droite de la carte :

| Champ | Valeur | UX |
|---|---|---|
| Email | `jean@email.com` | Cliquable → `mailto:` |
| Téléphone | `+32 600 00 00 00` | Cliquable → `tel:` |
| Date de naissance | `12/04/1990 (35 ans)` | Âge calculé automatiquement |
| Genre | `Masculin` | — |
| Nationalité | `Belge` | — |
| Adresse | `Rue de la Loi 1, 1000 Bruxelles` | Cliquable → Google Maps |
| Objectif | `Prise de muscle` | Badge coloré |
| Source | `Réseaux sociaux` | — |
| Certificat médical | ✅ Fourni | Badge vert/rouge |
| Consentement RGPD | `Accepté le 01/01/2025` | — |
| Marketing | ✅ Accepté | Toggle modifiable inline |
| Membre depuis | `14 mois (Jan 2025)` | Calculé automatiquement |
| Parrain | `Marie Martin` | Cliquable → fiche du parrain |

### 🔹 B. Contrats
**Contrat actif** mis en avant visuellement (card avec bordure colorée) :

| Champ | Valeur |
|---|---|
| Plan | `Premium` (badge) |
| Type | `OpenEnded` |
| Statut | `Actif` (badge vert) |
| Début | `01/01/2025` |
| Fin | `—` (open-ended) |
| Gel actif | `Du 01/03 au 15/03` (si en cours) |
| Options actives | `Cours collectifs`, `Accès sauna` |

**CTA rapides sous le contrat actif :**
- `Renouveler` → `POST /api/contracts/:id/renew`
- `Geler` → modal → `POST /api/contracts/:id/freeze` (champ DurationDays)
- `+ Nouveau contrat` → modal créer contrat

**Contrats passés** en dessous, grisés et repliés par défaut :
```
Timeline visuelle :
[Jan 2024 ──── Déc 2024]  Expiré  Basic
[Jan 2025 ────────────▶]  Actif   Premium
```

### 🔹 C. Activité
Mini dashboard d'engagement :

| Donnée | Valeur | Visual |
|---|---|---|
| Dernière visite | `Hier, 18h32` | Point vert si < 7j |
| Total visites | `47 visites` | — |
| Fréquence | `3x / semaine` | — |
| Niveau d'engagement | `🔥 Très actif` | Badge (Très actif / Actif / En baisse / Inactif) |

**Mini graphique** (7 derniers jours / 30 jours, toggle) :
- Barres simples montrant les visites par jour
- Chargé depuis `GET /api/members/:id` → `recentVisits[]`

### 🔹 D. Timeline unifiée 🔥
Au lieu de sections séparées, une timeline chronologique de tout ce qui s'est passé :

```
▼ Aujourd'hui
  🏋️ Visite — Club Bruxelles — 09h14

▼ Il y a 3 jours
  💳 Paiement enregistré — 49,99€ — Carte bancaire

▼ Il y a 5 jours
  🏋️ Visite — Club Namur — 18h02

▼ Il y a 2 mois
  ⏸️ Contrat gelé — 14 jours

▼ Il y a 14 mois
  ✅ Inscription — Plan Basic
```

Chargé depuis `GET /api/members/:id/timeline` → scroll interne avec lazy load (20 événements par page).

***

## ⚡ 4. COLONNE DROITE (30%) — sticky

### 🔹 A. Actions rapides (card sticky)
Boutons larges et accessibles :

| Action | Endpoint | Rôle requis |
|---|---|---|
| ✉️ Envoyer email | `mailto:` | Tous |
| 📞 Appeler | `tel:` | Tous |
| 🏋️ Check-in maintenant | `POST /api/access/member` | Tous |
| ⏸️ Suspendre / ▶️ Réactiver | `PATCH /api/members/:id` | admin |
| 📝 Ajouter note | Modal inline | Tous |
| 💳 Créer paiement manuel | Modal → `POST /api/billing/payments` | billing, admin |
| 🗑️ Anonymiser GDPR | Modal confirmation → `DELETE /api/members/:id/gdpr` | dpo, admin |

### 🔹 B. Risk Score détaillé 🔥
Card avec score et détail des facteurs :

```
🔴 Score de risque : 82/100
━━━━━━━━━━━━━━━━━━━━ (barre rouge)

Facteurs détectés :
• ❌ 3 factures impayées
• ⚠️ 12 accès refusés (60 derniers jours)
• ⚠️ Aucune visite depuis 18 jours
```

### 🔹 C. Alertes actives
Card rouge/orange si alertes présentes, verte si tout va bien :

```
⚠️ Abonnement expiré depuis 5 jours
💳 Dernière facture impayée (89,99€)
❌ Aucun passage depuis 30 jours
```

Chargé depuis `alerts[]` dans la réponse principale. Si aucune alerte → `✅ Aucune alerte — membre en règle`.

### 🔹 D. Notes internes staff
- Textarea rapide + bouton "Ajouter" → `POST /api/members/:id/notes`
- Liste des notes existantes :
```
👤 Sophie (admin) — 15/03/2026
"Membre intéressé par le plan VIP, rappeler en avril"

👤 Marc (billing) — 02/03/2026
"Accord de paiement en 2x pour facture #INV-2024-089"
```

### 🔹 E. Stats rapides
```
💰 Total encaissé    : 1 249,97€
📅 Client depuis     : 14 mois
📊 Fréquence moy.   : 2,8x/semaine
🎯 Objectif          : Prise de muscle
👥 Filleuls          : 2 membres parrainés
```

***

## 🔄 5. UX INTERACTIONS CLÉS

### Navigation fluide
- Retour liste → conserve filtres + scroll position
- Breadcrumb : `Membres > Jean Dupont`
- Navigation `← →` entre membres (précédent/suivant dans la liste filtrée)

### Édition inline 🔥
- Clic sur n'importe quel champ → devient editable directement
- `Enter` ou clic ailleurs → `PATCH /api/members/:id` automatique
- Pas de page `/edit` séparée — tout se fait sur la fiche
- Rollback immédiat si erreur API

### Loading states
- Skeleton loader par bloc (pas full page)
- Chaque card charge indépendamment
- Timeline lazy load au scroll

### Error handling
- Toast notifications (succès vert / erreur rouge)
- Retry automatique discret sur erreur réseau (3 tentatives)
- Message d'erreur contextuel par section

***

## 🎨 6. FIGMA — CE QUE TU DOIS CRÉER

### Frames à créer
1. **Fiche complète** avec toutes les données remplies
2. **Loading state** avec skeletons sur chaque bloc
3. **Membre à risque** (risk score élevé + alertes actives)
4. **Membre anonymisé** (données masquées, actions limitées)
5. **Quick Side Panel** (version réduite depuis la liste)

### Composants réutilisables
| Composant | Variants |
|---|---|
| `ProfileHeader` | Actif / Suspendu / Anonymisé |
| `InfoCard` | Normal / Edit mode |
| `ContractCard` | Actif / Expiré / Gelé |
| `ActivityCard` | Très actif / En baisse / Inactif |
| `RiskScoreCard` | Faible (vert) / Moyen (orange) / Élevé (rouge) |
| `AlertBadge` | Info / Warning / Critical |
| `TimelineItem` | Visite / Paiement / Contrat / Suspension |
| `NoteCard` | — |
| `ActionButton` | Primary / Danger / Ghost |

***

## 🧠 7. API — Modifications backend recommandées

### Endpoint principal enrichi
`GET /api/members/:id` doit retourner en **une seule requête** :

```json
{
  "id": "uuid",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@email.com",
  "phone": "+32600000000",
  "status": "Active",
  "gender": "Male",
  "dateOfBirth": "1990-04-12",
  "nationality": "BE",
  "address": { "street": "...", "city": "Bruxelles", "postalCode": "1000" },
  "primaryGoal": "MuscleGain",
  "acquisitionSource": "SocialMedia",
  "medicalCertificateProvided": true,
  "gdprConsentAt": "2025-01-01T00:00:00Z",
  "marketingConsent": true,
  "referralMemberId": "uuid-parrain",
  "referralMemberName": "Marie Martin",
  "memberSince": "2025-01-01",
  "totalVisits": 47,
  "lastVisitDate": "2026-03-17",
  "weeklyFrequency": 3.2,
  "engagementLevel": "High",
  "riskScore": 82,
  "riskFactors": ["OverdueInvoices", "FrequentDenials", "LowActivity"],
  "alerts": ["NoVisit30Days", "PaymentFailed"],
  "pendingInvoicesCount": 3,
  "totalPaid": 1249.97,
  "sponsoredMembersCount": 2,
  "activeContract": {
    "id": "uuid",
    "planName": "Premium",
    "homeClub": "Bruxelles",
    "contractType": "OpenEnded",
    "status": "Active",
    "startDate": "2025-01-01",
    "endDate": null,
    "freezeStartDate": null,
    "freezeEndDate": null,
    "activeOptions": ["Cours collectifs", "Sauna"]
  },
  "pastContracts": [ ],
  "recentVisits": [
    { "date": "2026-03-17", "club": "Bruxelles", "type": "Entry" }
  ]
}
```

### Nouveaux endpoints à créer
| Endpoint | Usage |
|---|---|
| `GET /api/members/:id/timeline` | Timeline unifiée (visites + paiements + contrats) paginée |
| `POST /api/members/:id/notes` | Ajouter note interne staff |
| `GET /api/members/:id/notes` | Liste des notes |
| `PATCH /api/members/:id` | Édition inline champ par champ |

***

## ⚙️ 8. ANGULAR — STATE MANAGEMENT

```
MemberDetailComponent (Smart)
├── Fetch GET /api/members/:id
├── Cache membre (évite reload au retour arrière)
├── State local : editMode, loading, error, alerts
│
├── ProfileHeaderComponent (Dumb)
├── InfoCardComponent (Dumb) — édition inline
├── ContractCardComponent (Dumb)
├── ActivityCardComponent (Dumb)
├── TimelineComponent (Dumb) — lazy load
├── ActionsCardComponent (Dumb) — sticky
├── RiskScoreCardComponent (Dumb)
├── AlertsCardComponent (Dumb)
└── NotesCardComponent (Dumb)
```

Cache : si retour depuis `/members`, réutilise les données déjà chargées sans re-fetch.

***

## 💣 9. FEATURES PREMIUM (différenciation)

### Quick Side Panel depuis `/members`
Clic sur une ligne → panel latéral (40% de la page) avec :
- Header + alertes + actions rapides
- Bouton "Ouvrir fiche complète" → `/members/:id`
- Zéro navigation inutile

### Navigation entre membres
Flèches `← →` dans le header de la fiche pour naviguer entre les membres de la liste filtrée sans repasser par la liste.

### Export PDF de la fiche
Bouton dans le menu `⋮` → génère un PDF de la fiche membre (infos + contrat + historique).

***

## ⚠️ ERREURS À ÉVITER
- ❌ Trop d'infos visibles d'un coup → sections repliables par défaut
- ❌ Scroll infini sans structure → timeline avec pagination
- ❌ Modals partout → édition inline prioritaire
- ❌ Navigation lente → cache + skeleton loaders
- ❌ Page `/edit` séparée → tout inline sur la fiche