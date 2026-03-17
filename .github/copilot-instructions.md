# RIADA — INSTRUCTIONS GITHUB COPILOT

> **Document de référence unique** pour GitHub Copilot, Claude Code et tout agent IA travaillant sur ce projet.
> Audit, architecture, design system et delivery de la plateforme Riada.

---

## PÉRIMÈTRE TECHNOLOGIQUE

### ✅ Stack actuelle — SEUL PÉRIMÈTRE EN COURS

| Composant | Technologie | Détails |
|---|---|---|
| **Back-end** | **ASP.NET Core / C#** | API REST, contrôleurs avec `[Authorize]`, logique métier centralisée |
| **Base de données** | **MySQL** | `riada_db` — 19 tables, triggers, procédures stockées, index |
| **Front-end** | **Angular 17+** | TypeScript strict, RxJS, Angular Router, TailwindCSS |
| State management | **NgRx** (global) + **Signals** (UI local) | NgRx pour auth/billing/global, Signals pour état de composants |
| UI | TailwindCSS + Angular CDK | Design system custom (pas de lib tierce imposée) |

> **⚠️ INSTRUCTION COPILOT** : Toutes les suggestions de code doivent utiliser **Angular (front-end)**, **ASP.NET C# (back-end)** et **MySQL (base de données)** exclusivement.
> Ne pas proposer de React, Vue, Node.js, MongoDB ou autre technologie hors de cette stack.

### 🔜 Technologies futures (non encore implémentées — hors scope actuel)

| Technologie | Usage prévu | Statut |
|---|---|---|
| Vue.js | À définir | Futur |
| React Native | Application mobile | Futur |
| Electron | Application desktop | Futur |

> Ces technologies seront intégrées dans des phases ultérieures. **Ne pas en tenir compte dans les suggestions actuelles.**

---

## CONTEXTE PROJET

**Riada** est une plateforme **SaaS B2B** de gestion pour centres de fitness professionnels.
Références secteur : Basic-Fit, JIMS, Aspria, Neoness.

---

## SECTION 0 — PROTOCOLE D'EXÉCUTION

### 0.1 Rôle de l'agent

L'agent agit simultanément comme :

- **Tech Lead** — Décisions d'architecture, revue de code, standards
- **Product Manager** — Priorisation métier, user stories, ROI
- **Design Lead** — UX par rôle, design system, cohérence visuelle
- **Staff Engineer** — Qualité industrielle, scalabilité, sécurité

### 0.2 Lecture initiale obligatoire (avant toute analyse)

L'agent **DOIT** exécuter ces étapes dans l'ordre avant de produire quoi que ce soit :

1. **Lire intégralement** `.copilot/agents/` — comprendre l'architecture multi-agent existante
2. **Lire intégralement** le schéma `riada_db` — 19 tables, triggers, procédures stockées, index
3. **Cartographier** chaque contrôleur ASP.NET — endpoints (routes, méthodes HTTP, `[Authorize(Roles)]`)
4. **Cartographier** chaque page/composant Angular — identifier les endpoints consommés
5. **Ne jamais modifier le back-end** sauf ajout essentiel justifié (critères stricts en Section 9)

### 0.3 Approche itérative — Règle absolue

> Vu la taille et la complexité du projet, **ne génère pas le rapport final immédiatement.**

```
PROTOCOLE D'EXÉCUTION SÉQUENTIEL :

  ÉTAPE 1 → Section 1 (Inventaire complet)
            Confirme ta compréhension du contexte.
            Cartographie front + back + BDD.
            STOP → Attends "Continue Section 2"

  ÉTAPE 2 → Section 2 (Profils & Permissions)
            Matrice attendue vs. état réel.
            STOP → Attends validation

  ÉTAPE 3 → Section 3 (Audit fonctionnel module par module)
            STOP → Attends validation

  ... ainsi de suite jusqu'au rapport final (Section 11)

POURQUOI :
  • Évite les hallucinations par surcharge de contexte
  • Permet des corrections humaines entre chaque section
  • Garantit une analyse granulaire et fiable
```

### 0.4 Règles de qualité permanentes

- Travailler uniquement avec des **faits réels** (code lu, pas supposé)
- Chaque problème détecté **DOIT** devenir un ticket actionnable (pas juste une observation)
- Éviter toute complexité inutile — optimiser pour le **ROI réel**
- Signaler **immédiatement** si un fichier est inaccessible ou si le contexte est insuffisant
- Ne jamais bricoler, patcher ou empiler du code sur un système cassé

---

## SECTION 1 — INVENTAIRE DE L'EXISTANT

### 1.1 Cartographie du front-end Angular

Pour **chaque page/vue principale** du front-end administrateur :

| Champ | Description |
|---|---|
| **Nom du composant** | Identifiant exact (ex : `MemberListPage.component.ts`) |
| **Chemin relatif** | Ex : `src/app/features/members/pages/member-list.page.ts` |
| **URL / Route** | Route Angular associée (ex : `/admin/members`) |
| **Module Angular** | Module auquel le composant appartient (lazy loaded ?) |
| **Rôle fonctionnel** | Ce que la page est censée faire |
| **Arbre des composants enfants** | Composants UI appelés (ex : `DataTable`, `MemberModal`, `StatusBadge`, `SearchBar`) |
| **Endpoint(s) back-end consommé(s)** | Méthode + route (ex : `GET /api/members?centerId=`) |
| **Service(s) Angular utilisé(s)** | Ex : `MemberService`, `AuthService` |
| **État actuel** | ✅ Fonctionnel / ⚠️ Partiel / ❌ Cassé / 🗑️ Code mort |
| **Profils autorisés** | Rôles ayant accès actuellement (guard déclaré ?) |
| **Bugs / Incohérences** | Liste des problèmes identifiés |

> **Points de vigilance :**
> - Pages "mortes" (jamais naviguées, aucune route vers elles)
> - Routes déclarées dans `app-routing.module.ts` mais sans composant réel
> - Composants importés dans un module mais jamais rendus
> - Composants "god" (logique API + state + validation + rendu dans le même fichier)

### 1.2 Cartographie du back-end ASP.NET

Pour **chaque contrôleur/endpoint** :

| Champ | Description |
|---|---|
| **Contrôleur** | Nom de la classe C# |
| **Route** | URL complète (ex : `/api/members/{id}`) |
| **Méthode HTTP** | GET / POST / PUT / DELETE / PATCH |
| **Autorisation actuelle** | `[Authorize(Roles = "...")]` — ou **AUCUNE** (🔴 faille critique) |
| **Consommé par** | Quel(s) composant(s) Angular l'utilisent |
| **Orphelin ?** | `true` si aucun composant ne l'appelle |
| **Logique métier** | Résumé de ce que fait l'endpoint |
| **Validation** | Quelles validations sont appliquées (ModelState, custom) |
| **Réponse** | Format de la réponse (DTO, codes HTTP retournés) |

> **🔴 ALERTE CRITIQUE** : Tout endpoint exposé **sans attribut `[Authorize]`** est une faille de sécurité à signaler en priorité P0.

### 1.3 Cartographie de la base de données `riada_db`

Pour **chaque table** (sur les 19) :

| Champ | Description |
|---|---|
| **Nom de la table** | — |
| **Colonnes clés** | PK, FK, colonnes métier importantes |
| **Relations** | FK vers d'autres tables (cardinalité) |
| **Triggers associés** | Nom + logique déclenchée (⚠️ effets de bord potentiels) |
| **Procédures stockées** | SP qui manipulent cette table + leur logique |
| **Index** | Index non-PK déclarés (performance) |
| **Utilisée par le front ?** | Via quel(s) endpoint(s) — ou jamais interrogée |

> **Points de vigilance :**
> - Tables **jamais interrogées** par le front (données mortes ou futures)
> - Triggers pouvant provoquer des **effets de bord inattendus** (ex : trigger de facturation automatique qui s'exécute sans que le front le sache)
> - Procédures stockées contenant de la **logique métier critique** que le développeur front doit connaître
> - Colonnes de statut calculées vs. statuts à déduire (source de bugs front)

---

## SECTION 2 — PROFILS MÉTIER ET MATRICE DE PERMISSIONS

### 2.1 Définition des profils

Chaque profil est défini selon la **réalité métier** d'un centre de fitness professionnel. Les permissions sont basées sur le **principe du moindre privilège** : un rôle n'a accès qu'à ce dont il a strictement besoin pour exercer sa fonction.

---

#### 🔴 ADMINISTRATEUR (Super Admin)

**Périmètre** : Accès total à la plateforme, tous centres confondus.

| Catégorie | Droits |
|---|---|
| Membres | CRUD complet, hard delete, toutes données |
| Contrats | CRUD complet, suppression définitive |
| Facturation | CRUD complet, rapports globaux, export |
| Planning | CRUD complet, tous centres |
| Personnel | CRUD complet, attribution de rôles |
| Équipements | CRUD complet |
| Système | Configuration globale, gestion des rôles, logs d'audit complets, paramétrage multi-centres |

**Responsabilité** : Intégrité globale du système. Seul profil autorisé à supprimer définitivement des données et à modifier la configuration système.

---

#### 🟠 GESTIONNAIRE DE CENTRE (Manager)

**Périmètre** : Gestion opérationnelle d'un ou plusieurs centres **explicitement assignés**.

| Catégorie | Droits | Restrictions |
|---|---|---|
| Membres | CRUD (son centre) | Soft delete uniquement, pas de hard delete |
| Contrats | Créer, modifier, résilier (son centre) | Pas de suppression définitive |
| Facturation | Voir, créer, enregistrer paiements (son centre) | Pas de modification de factures émises |
| Planning | CRUD cours et horaires (son centre) | — |
| Personnel | Créer, modifier, désactiver (son centre) | Pas de modification des rôles au-delà de son niveau |
| Équipements | CRUD (son centre) | — |
| Système | Paramétrage de son centre uniquement | Aucun accès à la configuration globale |
| Rapports | Fréquentation, financiers (son centre) | Pas de données d'autres centres |
| Logs d'audit | Consultation (son centre) | — |

**Scope données** : Filtrage automatique par `centerId` sur toutes les requêtes. Un manager assigné à plusieurs centres voit les données de ces centres uniquement.

---

#### 🟡 GESTIONNAIRE DE FACTURATION (Billing Manager)

**Périmètre** : Gestion financière et facturation, transversal aux centres.

| Catégorie | Droits | Restrictions |
|---|---|---|
| Membres | Consultation (contexte facturation) | Pas de création/modification/suppression |
| Contrats | Consultation uniquement (lecture seule) | Aucune modification |
| Facturation | CRUD complet (factures, paiements, relances) | — |
| Remises | Appliquer des remises/ajustements autorisés | Selon plafonds configurés |
| Modes de paiement | Gérer (espèces, CB, virement, prélèvement) | — |
| Rapports financiers | Tous centres (export PDF/Excel) | — |
| Planning | ❌ Aucun accès | — |
| Personnel | ❌ Aucun accès | — |
| Système | ❌ Aucun accès | — |

---

#### 🟢 RÉCEPTIONNISTE (Front Desk)

**Périmètre** : Accueil, vérification d'accès, inscriptions de base. Optimisé pour la **vitesse** (check-in < 3 secondes).

| Catégorie | Droits | Restrictions |
|---|---|---|
| **Check-in/out** | Scanner carte/QR, vérifier accès | — |
| **Statut paiement** | Consulter (payé/impayé/retard) | **LECTURE SEULE** — pas d'action sur le paiement |
| **Membres** | Consulter infos (coordonnées, abonnement, historique présence) | Pas de modification des données membre |
| **Inscription membre** | Créer un nouveau membre + contrat standard | Pas de contrat personnalisé/premium |
| **Résiliation** | Initier une résiliation (workflow standard) | Pas de suppression, pas de modification des conditions |
| **Cours** | Consulter le planning, inscrire un membre à un cours | Pas de création/modification de cours |
| **Horaires** | Consulter son propre planning de travail | Pas de modification |
| **Visiteurs** | Gérer pass journée, invités, essais gratuits | — |
| Contrats existants | ❌ **Aucune modification** (type, tarif, conditions, durée) | — |
| Remises | ❌ **Interdit** — doit passer par un gestionnaire | — |
| Factures | ❌ Aucun accès | — |
| Rapports financiers | ❌ Aucun accès | — |
| Personnel | ❌ Aucun accès | — |
| Système | ❌ Aucun accès | — |

---

#### 🔵 COACH / INSTRUCTEUR

**Périmètre** : Gestion de **ses propres cours** et suivi de ses inscrits. Interface simplifiée au maximum.

| Catégorie | Droits | Restrictions |
|---|---|---|
| **Ses cours** | Consulter, gérer horaires/descriptions/capacité | Uniquement ses propres cours |
| **Inscrits** | Voir la liste, marquer la présence | Profils de base uniquement (pas d'infos financières) |
| **Son planning** | Consulter ses horaires de travail | Pas de modification |
| Membres (hors inscrits) | ❌ Aucun accès | — |
| Contrats | ❌ Aucun accès | — |
| Facturation | ❌ Aucun accès | — |
| Personnel | ❌ Aucun accès | — |
| Système | ❌ Aucun accès | — |

**Scope données** : Filtrage automatique — le coach ne reçoit du back-end **que** les données de ses propres cours et de ses inscrits. Les données des autres coachs ne transitent jamais.

---

### 2.2 Matrice de permissions consolidée

Lors de l'audit, chaque cellule est évaluée : **✅ Conforme** | **⚠️ Trop permissif** | **❌ Trop restrictif** | **🚫 Non implémenté**

#### Membres

| Action | Admin | Manager | Billing | Réceptionniste | Coach |
|---|---|---|---|---|---|
| Créer | ✅ CRUD | ✅ CRUD (centre) | ❌ | ✅ CREATE standard | ❌ |
| Voir liste | ✅ Tous | ✅ Son centre | ✅ Contexte billing | ✅ Son centre | ✅ Ses inscrits |
| Modifier | ✅ | ✅ Centre | ❌ | ❌ | ❌ |
| Supprimer | ✅ Hard | ✅ Soft | ❌ | ❌ | ❌ |
| Vérifier paiement | ✅ | ✅ | ✅ | ✅ LECTURE | ❌ |
| Check-in/out | ✅ | ✅ | ❌ | ✅ | ❌ |

#### Contrats

| Action | Admin | Manager | Billing | Réceptionniste | Coach |
|---|---|---|---|---|---|
| Créer | ✅ Tout type | ✅ Tout type (centre) | ❌ | ✅ Standard seul | ❌ |
| Modifier | ✅ | ✅ Centre | ❌ | ❌ | ❌ |
| Résilier | ✅ | ✅ | ❌ | ✅ Initier seulement | ❌ |
| Supprimer | ✅ | ❌ | ❌ | ❌ | ❌ |
| Consulter historique | ✅ | ✅ | ✅ LECTURE | ✅ LECTURE | ❌ |

#### Facturation

| Action | Admin | Manager | Billing | Réceptionniste | Coach |
|---|---|---|---|---|---|
| Voir factures | ✅ Tous | ✅ Centre | ✅ CRUD | ❌ | ❌ |
| Créer facture | ✅ | ✅ | ✅ | ❌ | ❌ |
| Modifier facture | ✅ | ❌ | ✅ | ❌ | ❌ |
| Enregistrer paiement | ✅ | ✅ | ✅ | ❌ | ❌ |
| Appliquer remise | ✅ | ✅ | ✅ | ❌ | ❌ |
| Rapports financiers | ✅ Global | ✅ Centre | ✅ Global | ❌ | ❌ |
| Export PDF/Excel | ✅ | ✅ | ✅ | ❌ | ❌ |

#### Planning & Cours

| Action | Admin | Manager | Billing | Réceptionniste | Coach |
|---|---|---|---|---|---|
| Voir planning | ✅ | ✅ | ❌ | ✅ LECTURE | ✅ Ses cours |
| Créer/Modifier cours | ✅ | ✅ | ❌ | ❌ | ✅ Ses cours |
| Inscrire membre | ✅ | ✅ | ❌ | ✅ | ✅ Ses cours |
| Voir présences | ✅ | ✅ | ❌ | ❌ | ✅ Ses cours |
| Son propre horaire | ✅ | ✅ | ✅ | ✅ | ✅ |

#### Personnel

| Action | Admin | Manager | Billing | Réceptionniste | Coach |
|---|---|---|---|---|---|
| Voir employés | ✅ Tous | ✅ Centre | ❌ | ❌ | ❌ |
| Créer/Modifier | ✅ | ✅ Centre | ❌ | ❌ | ❌ |
| Désactiver | ✅ | ✅ Centre | ❌ | ❌ | ❌ |
| Attribuer rôle | ✅ | ✅ Centre | ❌ | ❌ | ❌ |
| Gérer planning | ✅ | ✅ Centre | ❌ | ❌ | ❌ |

#### Équipements & Salles

| Action | Admin | Manager | Billing | Réceptionniste | Coach |
|---|---|---|---|---|---|
| Voir | ✅ | ✅ | ❌ | ✅ LECTURE | ✅ LECTURE |
| Créer/Modifier | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gérer salles | ✅ | ✅ | ❌ | ❌ | ❌ |
| Suivi maintenance | ✅ | ✅ | ❌ | ❌ | ❌ |

#### Système

| Action | Admin | Manager | Billing | Réceptionniste | Coach |
|---|---|---|---|---|---|
| Configuration globale | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gestion des rôles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Logs d'audit | ✅ Tous | ✅ Centre | ❌ | ❌ | ❌ |
| Paramétrage centres | ✅ | ✅ Centre | ❌ | ❌ | ❌ |

### 2.3 Règle d'or — Sécurité non négociable

```
Si une action dépasse les compétences métier du rôle :

  1. FRONT-END → L'élément est MASQUÉ (pas dans le DOM) ou DÉSACTIVÉ (grisé + tooltip)
  2. BACK-END  → Rejet HTTP 403 Forbidden

La sécurité ne repose JAMAIS uniquement sur le front-end.
Le back-end ne fait JAMAIS confiance au token sans vérification.
Les données non autorisées ne sont JAMAIS transmises au front (même masquées).
```

---

## SECTION 3 — AUDIT FONCTIONNEL (CHECK-LIST PAR MODULE)

> Pour chaque item : ✅ OK | ⚠️ Partiel | ❌ Non implémenté / Cassé
> L'agent évalue l'implémentation **réelle** face à ces critères.

### 3.1 Authentification & Sessions

- [ ] Login fonctionnel (happy path + gestion d'erreurs)
- [ ] JWT correctement généré : access token (short-lived) + refresh token (httpOnly cookie)
- [ ] Refresh token implémenté (renouvellement silencieux avant expiration)
- [ ] Déconnexion invalide la session côté back ET front (révocation du token)
- [ ] Rôle utilisateur + `centerId` extraits du token et stockés dans le state Angular
- [ ] `AuthGuard` Angular implémenté avec vérification du rôle par route
- [ ] `AuthInterceptor` Angular injecte automatiquement le Bearer token
- [ ] Redirect vers `/unauthorized` ou `/login` si accès non autorisé
- [ ] Gestion du timeout d'inactivité (session expirée → redirect login)
- [ ] Gestion de l'erreur 401 (token expiré → tentative de refresh → si échec → logout)

> **🔴 Alerte** : Vérifier que le token d'accès n'est **pas** stocké en `localStorage` en clair. Préférer `httpOnly cookie` pour le refresh token et `memory` ou `sessionStorage` pour l'access token.

### 3.2 Dashboard

- [ ] Dashboard adapté au profil connecté (widgets différenciés)
- [ ] KPI pertinents par rôle :
  - Admin → CA global, membres totaux, taux de présence, churn, alertes système
  - Manager → KPI de son centre (CA, membres actifs, fréquentation, cours)
  - Billing → Impayés, encaissements du mois, relances en attente
  - Réceptionniste → Présents aujourd'hui, cours du jour, alertes membres
  - Coach → Ses prochains cours, taux de remplissage, inscrits
- [ ] Données chargées correctement depuis le back-end (pas de données fictives)
- [ ] Pas d'appels API inutiles ou redondants au chargement
- [ ] Chargement complet en **< 2 secondes** (skeleton loaders pendant le chargement)
- [ ] Rafraîchissement automatique des données critiques (polling ou WebSocket)

### 3.3 Gestion des Membres

- [ ] Liste : pagination **serveur**, recherche, filtres fonctionnels
- [ ] Création : tous les champs requis présents, validation inline
- [ ] Modification : données pré-remplies correctement depuis l'API
- [ ] Suppression : soft delete (Manager) / hard delete (Admin), confirmation modale obligatoire
- [ ] Statut membre (actif/inactif/suspendu/impayé) visible, cohérent avec le back-end
- [ ] **Check-in/check-out** fonctionnel (scan carte/QR) en **< 3 secondes** bout en bout
- [ ] Vérification de paiement accessible au réceptionniste en **lecture seule**
- [ ] Scope de données respecté (Manager/Réceptionniste → son centre uniquement)
- [ ] Conformité RGPD (anonymisation possible, export données personnelles)

### 3.4 Contrats & Abonnements

- [ ] Types d'abonnement **dynamiques** (chargés depuis la BDD, jamais hard-codés)
- [ ] Conditions tarifaires appliquées par le back-end (le front affiche les options disponibles)
- [ ] Résiliation : respect des règles métier (préavis, pénalités calculées par le back)
- [ ] Historique des contrats d'un membre consultable
- [ ] Réceptionniste : peut créer un contrat standard **sans pouvoir le modifier ensuite**
- [ ] Lien contrat ↔ gate d'accès physique (badge/QR)
- [ ] Gestion du **prorata** en cas de changement d'abonnement (calcul back-end)
- [ ] Workflow de résiliation : étapes claires, confirmation, calcul automatique de la date effective

### 3.5 Facturation & Paiements

- [ ] Factures : génération automatique (via trigger/cron) et/ou manuelle selon config
- [ ] Statut de paiement (payé/impayé/en retard/partiel) fiable et synchronisé avec le back
- [ ] Relances : automatisées (cron/scheduler) et/ou manuelles
- [ ] Rapports financiers corrects (totaux, périodes, filtres par centre/date)
- [ ] Export PDF/Excel fonctionnel
- [ ] Gestion des modes de paiement (espèces, CB, virement, prélèvement SEPA)
- [ ] **Blocage d'accès en cas d'impayé** déclenché en temps réel par le back-end
- [ ] Numérotation des factures conforme (séquentielle, sans trou)

### 3.6 Planning & Cours

- [ ] Calendrier des cours affiché correctement (vue jour/semaine/mois)
- [ ] Inscriptions respectent la **capacité maximale** (vérification back-end, pas front)
- [ ] Coach voit **uniquement ses propres cours** (filtrage côté back-end)
- [ ] Réceptionniste peut inscrire un membre à un cours
- [ ] Détection des conflits d'horaires (même membre inscrit à 2 cours simultanés)
- [ ] Chaque employé peut consulter **son propre horaire de travail**
- [ ] Annulation/modification de cours avec notification aux inscrits

### 3.7 Gestion du Personnel

- [ ] CRUD employés fonctionnel (création, modification, désactivation — pas de hard delete)
- [ ] Attribution de rôles sécurisée (un manager ne peut pas s'attribuer le rôle Admin)
- [ ] Planning des employés gérable (assignation de shifts/créneaux)
- [ ] Accès restreint aux managers (son centre) et admins (tous centres)
- [ ] Scope correct : un manager ne voit **que** le personnel de son centre

### 3.8 Équipements & Salles

- [ ] CRUD équipements fonctionnel
- [ ] Gestion des salles (capacité, disponibilité, affectation aux cours)
- [ ] Suivi de maintenance (signalement, historique, statut)
- [ ] Lecture seule correctement appliquée pour réceptionniste et coach

### 3.9 Paramètres & Configuration

- [ ] Paramétrage des centres (horaires d'ouverture, adresse, fuseau horaire)
- [ ] Gestion des types d'abonnements et tarifs (dynamique, pas hard-codé)
- [ ] Gestion des rôles et permissions (assignation depuis l'UI admin)
- [ ] Logs d'audit consultables, filtrables (`qui` | `action` | `entité` | `timestamp` | `IP`)
- [ ] Accès admin uniquement (sauf logs centre pour le manager)

---

## SECTION 4 — DIAGNOSTIC TECHNIQUE DU FRONT-END ANGULAR

### 4.1 Architecture & Structure

Structure de dossiers **attendue** (Angular Enterprise) :

```
src/app/
├── core/                          # Singleton services, initialisés une seule fois
│   ├── auth/                      # AuthService, token management
│   ├── interceptors/              # AuthInterceptor, ErrorInterceptor
│   ├── guards/                    # AuthGuard, RoleGuard
│   └── services/                  # Services globaux (PermissionService, etc.)
│
├── shared/                        # Composants, directives, pipes réutilisables
│   ├── ui/                        # Atomes : ButtonComponent, InputComponent, BadgeComponent
│   ├── components/                # Molécules : DataTableComponent, SearchBarComponent, StatusBadge
│   ├── directives/                # HasRoleDirective, AutoFocusDirective
│   └── pipes/                     # CurrencyPipe, DateFormatPipe, StatusPipe
│
├── features/                      # Modules métier (lazy loaded)
│   ├── members/
│   │   ├── pages/                 # Smart components (containers) — data fetching + logique
│   │   ├── components/            # Dumb components (presenters) — UI pure, @Input/@Output
│   │   ├── services/              # MemberService (API calls)
│   │   ├── store/                 # NgRx state si nécessaire
│   │   └── models/                # Interfaces TypeScript (Member, MemberFilters, etc.)
│   ├── contracts/
│   ├── billing/
│   ├── scheduling/
│   ├── staff/
│   ├── equipment/
│   └── settings/
│
├── layout/                        # AdminLayoutComponent, SidebarComponent, TopbarComponent
├── store/                         # NgRx root state (auth, global notifications)
└── app-routing.module.ts          # Routes principales avec lazy loading + guards
```

**Check-list architecture :**

- [ ] Structure conforme (ou mappable) au schéma ci-dessus
- [ ] Modules métier lazy loaded (un chunk par feature)
- [ ] Pattern **Smart/Dumb** (Container/Presenter) respecté
- [ ] Pas de logique API dans les composants UI (uniquement dans les services)
- [ ] Services API centralisés dans chaque feature (pas d'appels `HttpClient` directs dans les composants)
- [ ] Code mort identifié (fichiers jamais importés, composants jamais rendus)
- [ ] Gestion d'état cohérente (NgRx pour global, Signals pour UI local)

### 4.2 Gestion des erreurs

- [ ] `ErrorInterceptor` global intercepte toutes les erreurs HTTP
- [ ] Erreur 401 → tentative de refresh token → si échec → logout + redirect `/login`
- [ ] Erreur 403 → toast "Droits insuffisants" (pas de page blanche)
- [ ] Erreur 404 → page NotFound dédiée
- [ ] Erreur 500 → toast + option de retry
- [ ] Formulaires : validation inline (reactive forms + validators) **avant** soumission
- [ ] Messages d'erreur compréhensibles (jamais de stack trace ou code technique)
- [ ] États vides (empty states) gérés avec message et action suggérée

### 4.3 Performance

- [ ] Lazy loading des modules (pas de bundle monolithique)
- [ ] `OnPush` change detection sur les composants purement UI
- [ ] `trackBy` sur tous les `*ngFor`
- [ ] Pagination **côté serveur** (obligatoire pour listes > 50 items)
- [ ] Annulation des requêtes en cours lors de la navigation (`takeUntil` / `DestroyRef`)
- [ ] Pas de re-rendus inutiles (profiling Angular DevTools)
- [ ] Assets optimisés (lazy loading images, compression)
- [ ] Dashboard chargé en < 2 secondes, check-in en < 3 secondes

### 4.4 Sécurité front-end

- [ ] Tokens stockés de manière sécurisée (refresh → httpOnly cookie ; access → memory/sessionStorage)
- [ ] Routes protégées par `RoleGuard` (vérifie le rôle avant activation)
- [ ] Données sensibles **non transmises** par le back pour les rôles non autorisés (pas juste masquées côté front)
- [ ] Protection XSS : Angular sanitise par défaut, mais vérifier les `[innerHTML]` et `bypassSecurityTrust*`
- [ ] Actions interdites : masquées dans le DOM (directive `*hasRole`) ou désactivées avec tooltip
- [ ] Actions destructrices : confirmation modale obligatoire
- [ ] CSP headers configurés

### 4.5 Design System & Composants UI

#### Réutilisabilité

- [ ] Composants de base (Button, Input, Table, Modal, Badge, Toast) **génériques** ou chaque page a sa version dupliquée ?
- [ ] Bibliothèque UI cohérente (TailwindCSS + composants custom) ou CSS "sauvage" par fichier ?
- [ ] Existe-t-il un catalogue de composants (Storybook ou équivalent) ?

#### Cohérence visuelle

- [ ] Système de tokens cohérent (couleurs, typographie, espacements)
- [ ] États UI standardisés (loading skeleton, empty state, error state, success toast)
- [ ] Validation inline cohérente sur tous les formulaires
- [ ] Hiérarchie visuelle claire sur chaque page

#### Qualité du code

- [ ] Interfaces TypeScript strictes pour tous les @Input/@Output
- [ ] Composants découplés de la logique métier (UI pure → reçoit des données, émet des événements)
- [ ] Pas de "god components" (composants > 300 lignes mêlant API + state + validation + rendu)

> **Anti-pattern critique** : Un `MemberPageComponent` qui fait `this.http.get()`, stocke le state dans des variables locales, valide le formulaire inline, et rend 200 lignes de template — **doit être refactorisé** en Container (logique) + Presenter (UI).

---

## SECTION 5 — PLAN D'ACTION (CLASSIFICATION)

Chaque élément audité est classé dans **une seule** catégorie :

### 🟢 À CONSERVER
Composants fonctionnels, cohérents avec la logique métier et le back-end.
**Action** : Aucune modification. Refactoring cosmétique optionnel.

### 🟡 À RÉIMPLÉMENTER
Composants existants mais buggés, incomplets, ou désynchronisés avec le back-end.
**Action** : Réécrire en s'alignant sur les endpoints existants. Documenter les changements.

### 🔴 À IMPLÉMENTER (manquant)
Fonctionnalités métier nécessaires qui n'existent pas du tout côté front.
**Action** : Créer de zéro. Lister les endpoints back-end à consommer.

### ⚫ À SUPPRIMER
Code mort, composants jamais utilisés, fichiers en doublon.
**Action** : Supprimer après vérification des dépendances (imports, routes).

### 🟣 À REFACTORISER / MUTUALISER
Composants UI dupliqués ou couplés à la logique métier.
**Action** : Extraire en composant générique dans `shared/ui/` ou `shared/components/`.
**Exemple** : 5 DataTable différentes → 1 `DataTableComponent` générique avec `@Input` configurables.

### 🔵 BACK-END — AJOUT ESSENTIEL REQUIS
Cas où le front a besoin d'un endpoint inexistant côté back.
**Action** : Documenter selon le format strict de la Section 9.

---

## SECTION 6 — ARCHITECTURE DU SYSTÈME DE PERMISSIONS ANGULAR

### 6.1 Flow de permissions

```
[Login] → [Token JWT reçu → rôle + centerId extraits]
               │
               ▼
[AuthInterceptor injecte Bearer token sur chaque requête]
               │
               ▼
[RoleGuard sur chaque route → vérifie rôle autorisé]
               │
     ┌─────────┴─────────────────┐
     │                           │
  ❌ Non autorisé             ✅ Autorisé
  → redirect /unauthorized       │
                       ┌─────────┼──────────┐
                       │         │          │
                  [Dashboard  [Menu       [Composants
                   adapté]    filtré]      conditionnels]
                       │         │          │
                   Widgets    Routes      Boutons/Actions
                   par rôle   invisibles  masqués ou
                              si non      désactivés via
                              autorisé    *hasRole directive
```

### 6.2 Règles d'implémentation

1. **RoleGuard** — Chaque route déclare ses rôles autorisés dans `data: { roles: [Role.Admin, Role.Manager] }`. Non autorisé → redirect.

2. **Menu dynamique** — Le sidebar ne rend **QUE** les items autorisés pour le rôle. Pas de "grisé" — c'est **invisible**.

3. **Directive `*hasRole`** — Pour les actions conditionnelles dans une page partagée :
   - Masqué (préféré) : `*hasRole="['Admin', 'Manager']"` → pas dans le DOM si non autorisé
   - Désactivé (si contexte le justifie) : bouton grisé + tooltip "Droits insuffisants. Contactez votre responsable."

4. **Double vérification** — Le front masque/désactive, le back rejette (403). Jamais de confiance unilatérale.

5. **Scope de données** — Le back-end filtre les données selon le rôle et le `centerId` avant envoi. Le front ne fait jamais de filtrage de sécurité.

### 6.3 Implémentation Angular

```typescript
// === core/auth/models/role.enum.ts ===
export enum Role {
  Admin = 'Admin',
  Manager = 'Manager',
  Billing = 'Billing',
  Reception = 'Reception',
  Coach = 'Coach'
}

// === core/services/permission.service.ts ===
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly authService = inject(AuthService);

  // Permissions map : action → rôles autorisés
  private readonly permissionsMap: Record<string, Role[]> = {
    // Membres
    'member:create':    [Role.Admin, Role.Manager, Role.Reception],
    'member:edit':      [Role.Admin, Role.Manager],
    'member:delete':    [Role.Admin, Role.Manager],
    'member:hardDelete':[Role.Admin],
    'member:checkin':   [Role.Admin, Role.Manager, Role.Reception],

    // Contrats
    'contract:create':  [Role.Admin, Role.Manager, Role.Reception],
    'contract:edit':    [Role.Admin, Role.Manager],
    'contract:cancel':  [Role.Admin, Role.Manager, Role.Reception],
    'contract:delete':  [Role.Admin],

    // Facturation
    'invoice:view':     [Role.Admin, Role.Manager, Role.Billing],
    'invoice:create':   [Role.Admin, Role.Manager, Role.Billing],
    'invoice:edit':     [Role.Admin, Role.Billing],
    'payment:record':   [Role.Admin, Role.Manager, Role.Billing],
    'discount:apply':   [Role.Admin, Role.Manager, Role.Billing],

    // Planning
    'class:create':     [Role.Admin, Role.Manager, Role.Coach],
    'class:enroll':     [Role.Admin, Role.Manager, Role.Reception, Role.Coach],

    // Personnel
    'staff:manage':     [Role.Admin, Role.Manager],
    'role:assign':      [Role.Admin, Role.Manager],

    // Système
    'system:config':    [Role.Admin],
    'audit:view':       [Role.Admin, Role.Manager],
  };

  /** Vérifie si le rôle courant a la permission pour une action */
  canPerform(action: string): boolean {
    const userRole = this.authService.getCurrentRole();
    return this.permissionsMap[action]?.includes(userRole) ?? false;
  }

  /** Vérifie si le rôle courant fait partie des rôles autorisés */
  hasRole(allowedRoles: Role[]): boolean {
    return allowedRoles.includes(this.authService.getCurrentRole());
  }

  /** Retourne les items de menu visibles pour le rôle courant */
  getVisibleMenuItems(): MenuItem[] {
    const role = this.authService.getCurrentRole();
    return ALL_MENU_ITEMS.filter(item => item.roles.includes(role));
  }
}

// === core/guards/role.guard.ts ===
export const roleGuard: CanActivateFn = (route) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  const allowedRoles: Role[] = route.data['roles'];

  if (permissionService.hasRole(allowedRoles)) {
    return true;
  }
  return router.createUrlTree(['/unauthorized']);
};

// === Usage dans le routing ===
{
  path: 'members',
  loadChildren: () => import('./features/members/members.module'),
  canActivate: [roleGuard],
  data: { roles: [Role.Admin, Role.Manager, Role.Reception, Role.Coach] }
}

// === shared/directives/has-role.directive.ts ===
@Directive({ selector: '[hasRole]' })
export class HasRoleDirective {
  private readonly permissionService = inject(PermissionService);
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);

  @Input() set hasRole(roles: Role[]) {
    if (this.permissionService.hasRole(roles)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

// === Usage dans un template ===
// Le bouton n'existe pas dans le DOM si le rôle n'est pas autorisé
<button *hasRole="[Role.Admin, Role.Manager]"
        (click)="deleteMember(member)">
  Supprimer
</button>

// Bouton visible mais désactivé avec tooltip
<button [disabled]="!permissionService.canPerform('contract:edit')"
        [title]="!permissionService.canPerform('contract:edit')
          ? 'Droits insuffisants — contactez votre responsable' : ''">
  Modifier contrat
</button>
```

---

## SECTION 7 — LOGIQUE MÉTIER (ALIGNEMENT FRONT / BACK)

### 7.1 Principe fondamental

> **Le front-end est la REPRÉSENTATION du back-end.**
> Toute logique métier complexe réside dans le back-end.
> Le front-end ne fait que : afficher, envoyer des actions, gérer l'UX.

### 7.2 Répartition des responsabilités

| Scénario métier | Back-end fait | Front-end fait |
|---|---|---|
| Peut-il entrer ? (check-in) | Vérifie paiement + contrat actif + gate | Envoie le scan, affiche ✅ ou ❌ |
| Résiliation de contrat | Calcule pénalités, préavis, date effective | Envoie la demande, affiche le résumé calculé |
| Génération de facture | Calcule montants, taxes, numérotation | Affiche la facture générée |
| Inscription à un cours | Vérifie capacité, conflits horaires, éligibilité | Envoie la demande, affiche résultat |
| Application de remise | Vérifie autorisation, calcule le montant | Envoie le code/type de remise |
| Changement d'abonnement | Calcule prorata, conditions de migration | Affiche les options renvoyées par le back |
| Blocage accès impayé | Trigger ou vérification temps réel | Affiche l'état reçu |
| Statut membre | Champ calculé/déduit par le back (pas de logique front) | Affiche le statut tel quel |

### 7.3 Anti-patterns à détecter

L'agent doit signaler comme **bug** tout cas où :

- ❌ Un calcul de prix/montant est fait côté front
- ❌ Une validation business existe uniquement côté front (sans équivalent back)
- ❌ Des permissions sont vérifiées uniquement côté front
- ❌ Des données sensibles sont envoyées au front puis masquées en CSS/JS
- ❌ Des règles métier sont hard-codées dans le front (tarifs, délais de préavis, pénalités)
- ❌ Un statut (actif/impayé/suspendu) est calculé côté front à partir de données brutes
- ❌ Un `optimistic update` est utilisé pour une donnée critique (paiement, accès, contrat)

---

## SECTION 8 — BENCHMARKING INDUSTRIE FITNESS

| Fonctionnalité | Priorité | Référence secteur | État Riada |
|---|---|---|---|
| Check-in badge/QR + gate physique | 🔴 P0 | Basic-Fit, JIMS | À vérifier |
| Paiements récurrents automatisés (prélèvement SEPA) | 🔴 P0 | Tous | À vérifier |
| Blocage accès si impayé (temps réel) | 🔴 P0 | Basic-Fit | À vérifier |
| Gestion contrats avec préavis et pénalités | 🔴 P0 | Tous | À vérifier |
| Dashboard temps réel fréquentation | 🟡 P1 | Aspria | À vérifier |
| Planning cours interactif (réservation) | 🟡 P1 | Neoness, Basic-Fit | À vérifier |
| Notifications automatiques (relances, rappels) | 🟡 P1 | Tous | À vérifier |
| Rapports analytics (fréquentation, CA, churn) | 🟡 P1 | Aspria, JIMS | À vérifier |
| Export PDF/Excel rapports | 🟡 P1 | Tous | À vérifier |
| Intégration paiement en ligne (Stripe/Mollie) | 🟡 P1 | Neoness | À vérifier |
| Conformité RGPD (droit à l'oubli, export) | 🟡 P1 | Obligatoire UE | À vérifier |
| Gestion multi-centres | 🟢 P2 | Basic-Fit, JIMS | À vérifier |
| App mobile membre | 🟢 P2 | Basic-Fit, Neoness | Hors scope |

---

## SECTION 9 — RÈGLES POUR MODIFICATIONS BACK-END

### 9.1 Critères d'acceptation (TOUS doivent être remplis)

- [ ] Aucun endpoint existant ne satisfait le besoin (même avec des query params additionnels)
- [ ] La fonctionnalité est **essentielle** pour un profil métier (pas un nice-to-have)
- [ ] Le changement est **rétrocompatible** (ne casse pas les autres consumers)
- [ ] Le changement est **documenté** selon le format ci-dessous

### 9.2 Format de documentation

```
📌 MODIFICATION BACK-END — [ID séquentiel]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Endpoint     : [GET|POST|PUT|DELETE] /api/[resource]/[action]
Justification: [Pourquoi c'est indispensable et non contournable]
Rôles        : [Authorize(Roles = "Admin,Manager,...")]

Query/Route params :
  → ?centerId=int (optionnel, scope Manager)
  → {id:int} (route param)

Request body (POST/PUT) :
  {
    "field1": "type — description",
    "field2": "type — description"
  }

Réponse (200 OK) :
  {
    "field1": "type",
    "field2": "type"
  }

Codes HTTP : 200 | 400 | 401 | 403 | 404

Impact existant : [Aucun / Affecte le composant X]
Dépendance      : [Aucune / Requiert le ticket Y]
```

### 9.3 Types de modifications

| Type | Exemple | Autorisé ? |
|---|---|---|
| Nouvel endpoint (fonctionnalité manquante) | `GET /api/schedules/my` | ✅ Si essentiel |
| Ajout filtre sur endpoint existant | `?centerId=5` sur `/api/members` | ✅ Préféré |
| Modification autorisations | Ajouter `Reception` à un endpoint | ✅ Si justifié |
| Refactoring logique métier | Réécrire le calcul de facturation | ❌ Hors scope |
| Nouveau modèle/table BDD | Table de notifications | ❌ Sauf si P0 |

---

## SECTION 10 — DESIGN SYSTEM & UX PREMIUM

### 10.1 Principes fondamentaux

Le front-end Riada doit atteindre un niveau de qualité UI/UX comparable aux SaaS modernes (Stripe, Linear, Notion). Les principes directeurs :

**Clarté > Complexité** — Pas de surcharge visuelle. Hiérarchie claire. Chaque pixel a une raison d'être.

**Vitesse perçue** — Skeleton loaders pendant le chargement (jamais de spinner plein écran). Transitions fluides entre les états. Optimistic updates sur les actions non critiques.

**UX métier** — Chaque écran est optimisé pour l'action réelle du rôle qui l'utilise :
- Réceptionniste → Vitesse maximale (check-in < 3s, 0 clic inutile)
- Coach → Simplicité extrême (ses cours, ses inscrits, c'est tout)
- Manager → Actions rapides sur son centre + vue d'ensemble
- Admin → Vision globale + analytics + configuration
- Billing → Focus financier, tableaux denses mais lisibles

### 10.2 Tokens de design

```typescript
// design-tokens.ts
export const tokens = {
  colors: {
    primary:    '#3B82F6',  // Actions principales
    success:    '#10B981',  // Confirmation, statut OK
    warning:    '#F59E0B',  // Attention, en attente
    danger:     '#EF4444',  // Erreur, suppression, impayé
    neutral: {
      50:  '#F9FAFB',      // Background
      100: '#F3F4F6',      // Hover
      200: '#E5E7EB',      // Bordures
      500: '#6B7280',      // Texte secondaire
      900: '#111827',      // Texte principal
    }
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],  // px
  radius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
  fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px' }
};
```

### 10.3 Composants obligatoires du design system

| Composant | Variants/Features | Priorité |
|---|---|---|
| **Button** | primary, secondary, danger, ghost, loading state, disabled + tooltip | 🔴 P0 |
| **Input** | text, number, date, search, password, validation inline, error state | 🔴 P0 |
| **DataTable** | Pagination serveur, tri, filtres, recherche, actions inline, bulk actions, skeleton | 🔴 P0 |
| **Modal** | Confirmation destructrice, formulaire, info, tailles S/M/L | 🔴 P0 |
| **Toast** | Success, error, warning, info, auto-dismiss, action | 🔴 P0 |
| **Badge/Status** | Actif, inactif, impayé, suspendu, en attente — couleurs sémantiques | 🔴 P0 |
| **Skeleton** | Ligne, carte, table row, dashboard widget | 🟡 P1 |
| **Drawer** | Détail rapide (profil membre, détail contrat) sans navigation | 🟡 P1 |
| **EmptyState** | Illustration + message + action suggérée | 🟡 P1 |
| **ErrorState** | Message compréhensible + bouton retry | 🟡 P1 |
| **SearchBar** | Debounce, clear, résultats en temps réel | 🟡 P1 |
| **CommandPalette** | `⌘K` — recherche globale rapide (membres, contrats, actions) | 🟢 P2 |

### 10.4 Métriques UX cibles

| Métrique | Cible |
|---|---|
| Check-in membre (saisie → résultat) | **< 3 secondes** |
| Chargement dashboard | **< 2 secondes** |
| Accès à n'importe quelle action | **≤ 3 clics** depuis le dashboard |
| Feedback après action utilisateur | **Immédiat** (spinner + toast résultat) |
| Messages d'erreur | **Compréhensibles** (jamais de code technique) |
| Validation formulaire | **Inline** (pas attendre le submit) |

### 10.5 Patterns UX modernes à intégrer

- **Skeleton loaders** partout (jamais de spinner plein écran)
- **Toast feedback** sur chaque action (success/error)
- **Inline editing** quand pertinent (ex : changer le statut directement dans le tableau)
- **Drawer > Modal** pour les détails rapides (profil membre, aperçu contrat)
- **Optimistic UI** uniquement sur les actions non critiques (avec rollback si erreur)
- **Hover states** informatifs sur les éléments interactifs
- **Responsive** : Desktop first (admin/billing) → Tablet (manager) → Mobile (coach/réception)

---

## SECTION 11 — FORMAT DU RAPPORT DE SORTIE

> **⚠️ À générer uniquement sur instruction explicite** ("Génère le rapport final").

### 11.1 Rapport d'audit

```
📋 RAPPORT D'AUDIT RIADA — FRONT-END ADMINISTRATEUR
=====================================================

📅 Date         : [date]
🔍 Périmètre    : Front-end administrateur complet
🖥️ Stack        : Angular 17+ / ASP.NET C# / MySQL
👤 Audité par   : [agent]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. RÉSUMÉ EXÉCUTIF
   Score de santé global         : X / 10
   Composants audités            : N
   ├── ✅ Fonctionnels           : N
   ├── ⚠️ Partiellement          : N
   ├── ❌ Non fonctionnels       : N
   └── 🗑️ Code mort              : N

   Endpoints orphelins           : N
   Endpoints sans [Authorize]    : N  (🔴 failles critiques)
   Permissions correctes         : X %
   Anti-patterns détectés        : N
   Composants à mutualiser       : N

2. INVENTAIRE DÉTAILLÉ
   (Tableaux Section 1 — fichier séparé si volumineux)

3. MATRICE DE PERMISSIONS — ACTUEL vs. ATTENDU
   Chaque cellule : ✅ Conforme | ⚠️ Trop permissif | ❌ Trop restrictif | 🚫 Non implémenté

4. DIAGNOSTIC PAR MODULE
   (Check-lists Section 3 complétées)

5. DIAGNOSTIC TECHNIQUE
   (Check-lists Section 4 complétées)

6. PLAN D'ACTION CLASSIFIÉ
   🟢 Conserver | 🟡 Réimplémenter | 🔴 Implémenter | ⚫ Supprimer | 🟣 Refactoriser | 🔵 Back-end requis

7. MODIFICATIONS BACK-END REQUISES
   (Format Section 9.2 pour chaque modification)

8. RECOMMANDATIONS ARCHITECTURALES
   Structure de dossiers, services, state management, design system, conventions
```

### 11.2 Backlog & Delivery (sortie GOD MODE)

Après l'audit, transformer chaque problème en livrables actionnables :

#### Epics

```
EPIC-[XX] — [Titre]
━━━━━━━━━━━━━━━━━━━
Objectif         : [description]
Impact business  : [pourquoi c'est important]
Modules concernés: [liste]
User stories     : US-XX, US-XX, ...
```

#### User Stories

```
US-[XX] — En tant que [rôle], je veux [action] afin de [bénéfice]
Critères d'acceptation :
  - [ ] ...
  - [ ] ...
Epic parent : EPIC-XX
```

#### Tickets techniques

```
🎯 TICKET-[XXX] — [Titre]
━━━━━━━━━━━━━━━━━━━━━━━━━
Type        : Feature | Bug | Refactor | Tech Debt
Priorité    : P0 (bloque business) | P1 (dégrade UX/sécurité) | P2 (amélioration)
Epic        : EPIC-XX
User Story  : US-XX

Description : [claire, actionnable, sans ambiguïté]

Implémentation :
  1. [étape]
  2. [étape]
  3. [étape]

Fichiers impactés :
  - src/app/features/...
  - src/app/core/...

API consommée :
  - GET /api/...
  - POST /api/...

Risques :
  - [risque identifié + mitigation]

Estimation : X jours
Dépendances : TICKET-XXX
```

### 11.3 Roadmap Sprint

```
SPRINT 1 — Critical Fixes (sécurité, auth, permissions)
  Objectif : Système sécurisé et fonctionnel de base
  Tickets  : TICKET-001, 002, ...
  Charge   : X jours

SPRINT 2 — Stabilisation (modules core : membres, contrats)
  Objectif : Modules métier principaux fonctionnels
  Tickets  : TICKET-010, 011, ...
  Charge   : X jours

SPRINT 3 — Scaling (facturation, planning, rapports)
  Objectif : Couverture fonctionnelle complète
  Tickets  : TICKET-020, 021, ...
  Charge   : X jours

SPRINT 4 — UX Premium (design system, animations, performance)
  Objectif : Expérience utilisateur niveau SaaS premium
  Tickets  : TICKET-030, 031, ...
  Charge   : X jours

ESTIMATION GLOBALE :
  Temps total          : X jours dev
  Développeurs requis  : X
  Durée projet         : X semaines
```

### 11.4 Quick Wins (80% d'impact avec 20% d'effort)

L'agent **DOIT** identifier les actions à forte valeur et faible effort :

```
QUICK WINS — À exécuter en premier
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[QW-01] [Action] — Effort: X jours — Impact: [description]
[QW-02] [Action] — Effort: X jours — Impact: [description]
...
```

---

## SECTION 12 — GLOSSAIRE MÉTIER

| Terme | Définition |
|---|---|
| **Membre** | Client inscrit avec un contrat actif ou inactif |
| **Contrat** | Accord d'abonnement liant un membre au centre (durée, type, tarif, conditions) |
| **Check-in** | Vérification d'accès d'un membre à l'entrée du centre |
| **Gate** | Portique d'accès physique contrôlé par le système |
| **Résiliation** | Processus de fin de contrat (avec ou sans préavis, pénalités calculées) |
| **Relance** | Notification envoyée à un membre en retard de paiement |
| **Cours collectif** | Séance encadrée par un coach, capacité maximale limitée |
| **Soft delete** | Marquage comme supprimé sans destruction des données (réversible) |
| **Hard delete** | Suppression définitive et irréversible (Admin uniquement) |
| **Scope** | Périmètre de données visible par un rôle (son centre vs. global) |
| **Prorata** | Calcul au prorata temporis lors d'un changement d'abonnement en cours de période |
| **Optimistic update** | MAJ de l'UI avant confirmation du back (avec rollback si erreur) |
| **Stale data** | Données affichées ne correspondant plus à l'état réel du serveur |
| **Guard** | Middleware Angular qui vérifie les droits avant d'activer une route |
| **Interceptor** | Middleware Angular qui intercepte les requêtes HTTP (token, erreurs) |
| **Container / Presenter** | Pattern Smart/Dumb : composant logique (data) vs. composant UI pur (rendu) |
| **Design token** | Variable de design standardisée (couleur, espacement, taille) |
| **Skeleton loader** | Placeholder animé imitant la structure du contenu pendant le chargement |

---

## INSTRUCTION DE DÉMARRAGE

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  1. Confirme ta compréhension du contexte (stack, framework)     │
│  2. Lis les fichiers du projet (.copilot/agents/, schéma BDD,    │
│     contrôleurs ASP.NET, composants Angular)                     │
│  3. Réalise UNIQUEMENT la Section 1 (Inventaire)                 │
│  4. STOP — Attends "Continue Section 2"                          │
│                                                                   │
│  Ne génère JAMAIS le rapport final sans instruction explicite.   │
│  Signale immédiatement tout fichier inaccessible.                │
│  Chaque problème détecté = un ticket actionnable.                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

*RIADA — Système d'audit et de refonte V4.0 — Document unifié*
*À maintenir à jour après chaque itération d'audit.*