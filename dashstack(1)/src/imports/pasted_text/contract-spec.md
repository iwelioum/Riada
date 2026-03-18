Bonne base, voici la version réécrite — propre, sans fioriture, directement exploitable par un dev ou pour un brief Figma.

***

# Spec technique — Contrats

## 1. Permissions

```ts
type UserRole = "Admin" | "Staff" | "DataProtection"
```

| Action | Rôle requis |
|---|---|
| Voir un contrat | Tous authentifiés |
| Créer un contrat | Tous authentifiés |
| Geler / Renouveler | `DataProtection` uniquement |

**Règle** : masquer les boutons côté front pour l'UX, mais le back renvoie toujours un `403` si le rôle est insuffisant — la sécurité réelle reste côté serveur. 

***

## 2. Payloads

### `CreateContractRequest` 
```ts
interface CreateContractRequest {
  memberId: number;           // uint — ID du membre
  planId: number;             // uint — ID du plan
  homeClubId: number;         // uint — ID du club
  contractType: "FixedTerm" | "OpenEnded";
  startDate: string;          // "yyyy-MM-dd"
  endDate: string | null;     // obligatoire si FixedTerm, sinon null
  selectedOptionIds?: number[]; // non géré par le back aujourd'hui — préparer le champ
}
```

**Validations front :**
- `memberId`, `planId`, `homeClubId` → obligatoires
- `endDate` → obligatoire et > `startDate` si `FixedTerm`
- Si `OpenEnded` → envoyer `endDate: null`

### `FreezeContractRequest` 
```ts
interface FreezeContractRequest {
  durationDays: number; // min: 1 — le back calcule les dates lui-même
}
```

> Le back ne reçoit **pas** de dates de début/fin de gel — uniquement une durée en jours. Les dates calculées sont retournées dans `ContractResponse.freezeStartDate` et `freezeEndDate`. 

### Réponses Freeze / Renew 
```ts
interface ContractLifecycleResponse {
  success: boolean;
  message: string; // afficher dans un toast
}
```

***

## 3. Page 6 — Fiche contrat (`/contracts/:id`)

### Layout
```
[ HEADER STICKY ]
  Nom membre | Plan | Badge statut | Dates | Boutons (conditionnels)

[ LEFT 70% ]           [ RIGHT 30% sticky ]
  Infos contrat          Actions (rôle-dépendant)
  Options actives        Alertes actives
  Timeline               Aperçu billing
```

### Badges statut 
| Valeur | Couleur | Comportement |
|---|---|---|
| `Active` | `#00B69B` vert | Normal |
| `Suspended` | `#FF9066` orange | Attention |
| `Expired` | `#FF4747` rouge | Action requise |
| `Cancelled` | `#A6A6A6` gris | Passif |

### Bannière gel (si `freezeStartDate !== null`)
```
⚠ Contrat gelé du 12/03/2026 → 22/03/2026
```
Le bouton **Geler** devient **Dégeler** — afficher disabled + tooltip `"Fonctionnalité à venir"` car l'endpoint n'existe pas encore.

### Modal Geler
```
[ Durée : ___ jours ]
[ 7 ]  [ 14 ]  [ 30 ]  [ 60 ]   ← quick buttons

Dates estimées : du 18/03 au XX/03 (calculées dynamiquement)

[ Annuler ]  [ Confirmer ]
```

### Action Renouveler
Pas de modal — juste une confirmation inline :
1. Clic → dialog de confirmation (2 boutons)
2. `POST /api/contracts/{id}/renew` sans body 
3. Toast : `✔ Contrat renouvelé avec succès` ou message d'erreur selon `response.message`

***

## 4. Page 7 — Modal Créer contrat

### Structure du formulaire
```
1. Membre        → autocomplete  (affiche: Prénom Nom + email | envoie: memberId)
2. Plan          → select        (GET /api/plans | affiche: planName | envoie: planId)
3. Options       → checkboxes    (GET /api/plans/{planId}/options — chargé après sélection du plan)
4. Club          → select        (GET /api/clubs | filtre: operationalStatus !== "Closed" | envoie: homeClubId)
5. Type          → toggle        FixedTerm / OpenEnded
6. Date début    → date picker   obligatoire
7. Date fin      → date picker   visible uniquement si FixedTerm, obligatoire
```

### Autocomplétion membre
- Source : `GET /api/members?search={query}&pageSize=10`
- Afficher : `{firstName} {lastName} — {email}`
- Soumettre : `memberId` (uint)

### Options — dette technique connue
Les options sont affichées avec leurs prix (`optionName + monthlyPrice`) mais **non sauvegardées** dans `CreateContractRequest` aujourd'hui. Afficher un badge :
```
⚠ Les options seront disponibles prochainement
```
Le champ `selectedOptionIds` est préparé dans le type front pour l'intégration future.

### Après succès (201)
- Fermer le modal
- Naviguer vers `/contracts/{response.id}` ou rafraîchir la liste des contrats du membre selon le contexte d'ouverture

***

## 5. Dette technique (impact UX documenté)

| Gap back | Comportement front |
|---|---|
| Pas de `DELETE /contracts/{id}/freeze` | Bouton "Dégeler" : visible, disabled, tooltip "Bientôt disponible" |
| Options non dans `CreateContractRequest` | Checkboxes affichées, badge ⚠, champ `selectedOptionIds` préparé |
| Pas de `GET /api/contracts` (liste globale) | Accès aux contrats uniquement via la fiche membre (`/members/{id}`) |

***

## 6. Ce qui manque et que tu peux anticiper côté front

- **Timeline unifiée** sur la fiche contrat : `ContractCreated` → `Frozen` → `Renewed` → `PaymentReceived` — construire le composant dès maintenant avec des données mock, brancher plus tard sur un futur endpoint d'historique
- **Billing insight** : total payé + prochaine échéance — viendra de `BillingController`, à brancher plus tard dans le panneau droit
- **Smart alerts** côté fiche contrat : contrat expiré, paiement échoué, gel actif — logique dérivable depuis les champs déjà exposés dans `ContractResponse`