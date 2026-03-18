
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FICHIER 1 — MembersList
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. RECHERCHE avec debounce 300ms
   - Ajoute un state search + useDebounce hook interne
   - Filtre les membres en temps réel sur name

2. FILTRE STATUT
   - Remplace le bouton "Filtres" par un dropdown inline
   - Options : Tous / Actif / Suspendu
   - Filtre combiné avec la recherche

3. COMPTEUR TOTAL
   - Affiche "(3 membres)" à côté du titre, 
     mis à jour selon les filtres actifs

4. PAGINATION
   - Affiche 10 membres par page (slice des mock data)
   - Barre en bas : "1-3 sur 3 résultats" + boutons Précédent/Suivant
   - Désactivés si pas de page suivante/précédente

5. ÉTAT VIDE
   - Si aucun résultat après filtre :
     affiche une carte centrée avec icône Users, 
     message "Aucun membre trouvé pour ces critères"
     et bouton "Réinitialiser les filtres"

6. SKELETON LOADER
   - Ajoute un state isLoading (simulé 800ms au mount)
   - Pendant le loading : affiche 5 lignes skeleton 
     avec animate-pulse sur les colonnes

7. QUICK SIDE PANEL (nouveau)
   - Le clic sur une ligne du tableau N'ouvre PLUS /members/:id directement
   - Il ouvre un panel latéral (div fixe à droite, w-[420px], 
     bg-white, shadow, z-40, slide-in depuis la droite avec AnimatePresence)
   - Contenu du panel :
     * Header : avatar initiales + nom + badge statut + badge risk + 
       bouton X pour fermer
     * Section Alertes (hardcoded 2-3 alertes mock)
     * Section Actions rapides : 
       Envoyer email | Appeler | Créer paiement | Check-in
     * Section Stats : Total encaissé | Factures en attente | 
       Dernière visite
     * Bouton en bas "Ouvrir la fiche complète" → Link vers /members/:id
   - Fond semi-transparent (backdrop) cliquable pour fermer
   - Le bouton "Ouvrir la fiche" dans la colonne Actions 
     ouvre toujours /members/:id directement (garde ce comportement)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FICHIER 2 — MemberDetail
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. NAVIGATION ← → ENTRE MEMBRES
   - Ajoute dans le header sticky, à droite du breadcrumb, 
     deux boutons icônes ChevronLeft / ChevronRight
   - Mock : liste de 3 IDs [m-1234, m-1235, m-1236]
   - Clic → navigate(`/members/${nextId}`)
   - Désactivé si premier ou dernier de la liste

2. TOGGLE MARKETING CONSENT
   - Dans la section Informations personnelles, 
     après "Consentement RGPD", ajoute un champ :
     Label "Consentement marketing"
     Toggle switch (input type checkbox stylisé) 
     lié à member.marketingConsent
     En mode isEditing : modifiable
     En mode lecture : affiche "Accepté" ou "Refusé" avec badge

3. MODAL GELER CONTRAT
   - Le bouton "Geler" ouvre une modal centrée (fond backdrop blur)
   - Contenu :
     * Titre "Geler le contrat"
     * Champ "Durée (en jours)" — number input
     * Dates calculées automatiquement : 
       "Du [aujourd'hui] au [aujourd'hui + N jours]"
     * Boutons : Annuler | Confirmer (toast.success "Contrat gelé X jours")
   - AnimatePresence pour l'ouverture/fermeture

4. MODAL NOUVEAU CONTRAT
   - Le bouton "+" ouvre une modal centrée
   - Contenu :
     * Titre "Nouveau contrat"
     * Champ "Plan" — select : Basic / Premium / VIP
     * Champ "Type" — select : OpenEnded / FixedTerm
     * Champ "Date de début" — date input (défaut aujourd'hui)
     * Champ "Date de fin" — date input (visible seulement si FixedTerm)
     * Champ "Options" — checkboxes : 
       Cours collectifs / Accès sauna / Parking
     * Boutons : Annuler | Créer contrat 
       (toast.success "Contrat créé" + ferme modal)

5. MODAL PAIEMENT MANUEL
   - Le bouton "Créer paiement manuel" dans Actions rapides 
     ouvre une modal centrée (au lieu du toast.info actuel)
   - Contenu :
     * Titre "Créer un paiement manuel"
     * Champ "Montant (€)" — number input
     * Champ "Méthode" — select : 
       Carte bancaire / Virement / Espèces / SEPA
     * Champ "Référence" — text input (optionnel)
     * Champ "Note" — textarea (optionnel)
     * Boutons : Annuler | Enregistrer 
       (toast.success "Paiement de X€ enregistré")