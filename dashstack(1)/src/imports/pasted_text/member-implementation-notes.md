J'ai tout lu. Voici l'analyse complète des deux fichiers et ce qu'il faut implémenter pour que ça soit vraiment fluide et complet.

***

## Ce qui est déjà bien fait ✅

Les deux composants sont visuellement excellents. La structure, les animations, le drawer latéral, les modals — c'est solide. Voici uniquement ce qui manque ou qui est cassé.

***

## `MembersList` — Ce qu'il faut implémenter

### 1. Le type de données (aligner sur le back)

Ton mock a `name` (1 champ) mais le back retourne `firstName` + `lastName`. Créer un type propre dès maintenant :

```ts
// types/member.ts
export interface MemberSummary {
  id: string;                    // "m-1234" → sera un uint côté back
  firstName: string;
  lastName: string;
  email: string;
  status: "Active" | "Suspended" | "Anonymized";
  currentPlan: string | null;    // vient du contrat actif
  homeClub: string | null;
  lastVisitDate: string | null;
  totalVisits: number;
  riskScore: number;             // calculé côté front pour l'instant
  mobilePhone?: string;
}
```

Dans `ALL_MEMBERS`, remplace `name` par `firstName` + `lastName`, et dans l'affichage :

```tsx
// AVANT
<div>{member.name}</div>

// APRÈS
<div>{member.firstName} {member.lastName}</div>

// Avatar initiales
{member.firstName.charAt(0)}{member.lastName.charAt(0)}
```

### 2. Le filtre `Anonymized` est absent du select

```tsx
<option value="Anonymized">Anonymisé</option>
```

Et dans l'affichage du badge statut, ajouter le cas :

```tsx
member.status === 'Anonymized' ? 'bg-[#E0E0E0]/50 text-[#A6A6A6]' : ...
```

### 3. La colonne `risk` n'existe pas dans la `MemberSummaryResponse`

Deux options :
- **Option A (simple)** : calculer le `riskScore` côté front à partir de `lastVisitDate` et `totalVisits`
- **Option B (propre)** : le garder dans le mock pour l'instant, l'ajouter au back plus tard

Pour l'instant, une fonction utilitaire suffit :

```ts
function computeRisk(member: MemberSummary): number {
  if (member.status === "Suspended") return 85;
  if (!member.lastVisitDate) return 70;
  // logique à affiner quand le back expose les données
  return Math.floor(Math.random() * 40); // placeholder
}
```

### 4. Le drawer latéral affiche `totalEncaiss` et `attente` qui n'existent pas dans `MemberSummaryResponse`

Ces champs viennent de la `BillingController`. Pour l'instant, **les masquer dans le drawer** ou afficher `—` avec un label "Voir la fiche complète pour les détails financiers". Ne pas inventer des données.

```tsx
// Dans le drawer, section Statistiques → remplacer par :
<div className="flex justify-between p-3 border border-black/5 rounded-xl">
  <span className="text-sm text-[#6B7280]">Total encaissé</span>
  <Link to={`/members/${selectedMember.id}`} className="text-sm font-semibold text-[#4880FF] hover:underline">
    Voir la fiche →
  </Link>
</div>
```

### 5. `plan` dans le mock → renommer `currentPlan`

```tsx
// AVANT
<td>{member.plan}</td>

// APRÈS
<td>{member.currentPlan ?? <span className="text-[#A6A6A6] italic text-xs">Sans plan</span>}</td>
```

***

## `MemberDetail` — Ce qu'il faut implémenter

### 1. Créer le type complet aligné sur le back

```ts
export interface MemberDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string | null;
  status: "Active" | "Suspended" | "Anonymized";
  gender: "Male" | "Female" | "Unspecified";
  dateOfBirth: string;           // "1990-04-12"
  nationality: string;
  addressStreet: string | null;  // ← 3 champs, pas 1 string
  addressCity: string | null;
  addressPostalCode: string | null;
  primaryGoal: "WeightLoss" | "MuscleGain" | "Fitness" | "Maintenance" | "Other" | null;
  acquisitionSource: "WebAdvertising" | "SocialMedia" | "WordOfMouth" | "Other" | null;
  medicalCertificateProvided: boolean;
  gdprConsentAt: string;
  marketingConsent: boolean;
  referralMemberName: string | null;  // calculé par le front ou ajouté au back
  totalVisits: number;
  lastVisitDate: string | null;
  // Calculés côté front (à enrichir avec le back plus tard) :
  riskScore: number;
  weeklyFrequency: string;
  engagementLevel: string;
  memberSince: string;
  // Relations
  contracts: ContractDetail[];
  alerts: string[];
  notes: MemberNote[];
  timeline: TimelineEvent[];
}

export interface ContractDetail {
  id: number;
  planName: string;
  homeClub: string;
  startDate: string;
  endDate: string | null;
  contractType: "FixedTerm" | "OpenEnded";
  status: "Active" | "Suspended" | "Expired" | "Cancelled";
  freezeStartDate: string | null;
  freezeEndDate: string | null;
  activeOptions: string[];
}
```

### 2. Champ `address` → 3 champs dans `InfoField`

```tsx
// SUPPRIMER :
<InfoField label="Adresse" value={member.address} ... />

// AJOUTER :
<InfoField label="Rue" icon={MapPin} value={member.addressStreet ?? "—"} isEditing={isEditing}
  onChange={(v) => setEditData({...editData, addressStreet: v})} />
<InfoField label="Ville" icon={MapPin} value={member.addressCity ?? "—"} isEditing={isEditing}
  onChange={(v) => setEditData({...editData, addressCity: v})} />
<InfoField label="Code postal" icon={MapPin} value={member.addressPostalCode ?? "—"} isEditing={isEditing}
  onChange={(v) => setEditData({...editData, addressPostalCode: v})} />
```

### 3. Labels d'enum → fonctions de traduction

Les valeurs back sont en anglais (`MuscleGain`, `SocialMedia`...). Créer des helpers :

```ts
// utils/enumLabels.ts
export const goalLabel: Record<string, string> = {
  WeightLoss: "Perte de poids",
  MuscleGain: "Prise de muscle",
  Fitness: "Condition physique",
  Maintenance: "Maintien",
  Other: "Autre",
};

export const sourceLabel: Record<string, string> = {
  WebAdvertising: "Publicité web",
  SocialMedia: "Réseaux sociaux",
  WordOfMouth: "Bouche-à-oreille",
  Other: "Autre",
};

export const genderLabel: Record<string, string> = {
  Male: "Masculin",
  Female: "Féminin",
  Unspecified: "Non spécifié",
};
```

Dans la fiche :
```tsx
// AVANT
<span>{member.primaryGoal}</span>

// APRÈS
<span>{goalLabel[member.primaryGoal ?? ""] ?? "—"}</span>
```

### 4. Le mock `MOCK_MEMBER` — mettre à jour les valeurs

```ts
const MOCK_MEMBER = {
  // ...
  gender: "Male",                        // ← enum exact
  primaryGoal: "MuscleGain",            // ← enum exact
  acquisitionSource: "SocialMedia",     // ← enum exact
  addressStreet: "Rue de la Loi 1",
  addressCity: "Bruxelles",
  addressPostalCode: "1000",
  // address: supprimé
  contracts: [{
    id: 1,
    planName: "Premium",
    homeClub: "Bruxelles",
    startDate: "2025-01-01",
    endDate: null,
    contractType: "OpenEnded",
    status: "Active",
    freezeStartDate: null,
    freezeEndDate: null,
    activeOptions: ["Cours collectifs", "Accès sauna"]
  }],
  // activeContract: supprimé → utiliser contracts[0] actif
};
```

### 5. Contrats : utiliser `contracts[]` au lieu de `activeContract`

```tsx
// Helper pour trouver le contrat actif
const activeContract = member.contracts.find(c => c.status === "Active");
const pastContracts = member.contracts.filter(c => c.status !== "Active");
```

Puis dans le rendu, remplacer `member.activeContract.xxx` par `activeContract?.xxx`.

### 6. `UpdateMemberRequest` — l'email n'est PAS modifiable

Dans `InfoField` pour l'email :
```tsx
<InfoField 
  label="Email" 
  value={member.email} 
  isEditing={false}  // ← toujours false même en mode édition
  clickable={!isEditing}
  onClick={() => !isEditing && window.open(`mailto:${member.email}`)}
/>
```

### 7. `MemberSince` → calculer depuis `CreatedAt`

```ts
// utils/memberSince.ts
export function formatMemberSince(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const months = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
  const monthName = created.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  return `${months} mois (${monthName})`;
}
```

***

## Récapitulatif des fichiers à créer/modifier

| Fichier | Action |
|---|---|
| `types/member.ts` | Créer — types `MemberSummary`, `MemberDetail`, `ContractDetail` |
| `utils/enumLabels.ts` | Créer — helpers de traduction des enums |
| `utils/memberSince.ts` | Créer — calcul de la durée d'adhésion |
| `MembersList.tsx` | Modifier — `name` → `firstName/lastName`, `currentPlan`, filtre `Anonymized`, drawer simplifié |
| `MemberDetail.tsx` | Modifier — `address` → 3 champs, mock aligné, `contracts[]`, email non éditable |

Commence par créer les **types** et les **utils** — c'est la base qui rend tout le reste propre. Une fois ça en place, les deux composants s'alignent facilement.