# 🏗️ Riada — Architecture C# Complète (Clean Architecture)

> Mapping exhaustif des 21 tables, 8 procédures stockées, 28 triggers, 3 rôles sécurité

---

```
Riada/
│
├── 📁 sql/                                          # Scripts MySQL (inchangés)
│   ├── 01_Create_Database.sql
│   ├── 02_Create_Tables.sql
│   ├── 03_Triggers.sql
│   ├── 04_Procedures.sql
│   ├── 05_Insert_All_Data.sql
│   ├── 06_Indexes.sql
│   ├── 07_Security.sql
│   ├── 08_Select_Queries.sql
│   ├── 09_Tests.sql
│   └── 10_System_Check.sql
│
│
│ ╔═══════════════════════════════════════════════════════════════╗
│ ║                    src/Riada.Domain/                          ║
│ ║          Zéro dépendance — Entités, Enums, Interfaces        ║
│ ╚═══════════════════════════════════════════════════════════════╝
│
├── 📁 src/Riada.Domain/
│   ├── Riada.Domain.csproj                          # Aucune dépendance NuGet
│   │
│   ├── 📁 Enums/                                    # ← Depuis les ENUM MySQL
│   │   ├── Gender.cs                                # male, female, unspecified
│   │   ├── MemberStatus.cs                          # active, suspended, anonymized
│   │   ├── PrimaryGoal.cs                           # weight_loss, muscle_gain, fitness, maintenance, other
│   │   ├── AcquisitionSource.cs                     # web_advertising, social_media, word_of_mouth, other
│   │   ├── ContractType.cs                          # fixed_term, open_ended
│   │   ├── ContractStatus.cs                        # active, suspended, expired, cancelled
│   │   ├── InvoiceStatus.cs                         # draft, issued, paid, partially_paid, overdue, cancelled
│   │   ├── InvoiceLineType.cs                       # subscription, option, enrollment_fee, penalty, credit_note, other
│   │   ├── PaymentStatus.cs                         # pending, succeeded, failed, refunded
│   │   ├── PaymentMethod.cs                         # sepa_direct_debit, credit_card, cash, bank_transfer
│   │   ├── AccessDecision.cs                        # granted, denied
│   │   ├── GuestStatus.cs                           # active, banned
│   │   ├── ClubOperationalStatus.cs                 # open, temporarily_closed, permanently_closed
│   │   ├── EquipmentStatus.cs                       # in_service, under_maintenance, broken, retired
│   │   ├── MaintenanceType.cs                       # breakdown, preventive, installation
│   │   ├── MaintenanceTicketStatus.cs               # reported, assigned, in_progress, resolved
│   │   ├── MaintenancePriority.cs                   # low, medium, high, critical
│   │   ├── DifficultyLevel.cs                       # beginner, intermediate, advanced, all_levels
│   │   ├── ActivityType.cs                          # cardio, strength, flexibility, relaxation, dance, combat, mixed
│   │   ├── BookingStatus.cs                         # confirmed, waitlisted, cancelled
│   │   └── EmployeeRole.cs                          # instructor, manager, receptionist, technician, intern, management
│   │
│   ├── 📁 Entities/                                 # ← 1 entité par table MySQL
│   │   │
│   │   ├── 📁 ClubManagement/                       # ── clubs, employees, equipment, maintenance_tickets
│   │   │   ├── Club.cs                              # → table clubs (5 clubs Belgique)
│   │   │   ├── Employee.cs                          # → table employees (20 employés, FK club_id)
│   │   │   ├── Equipment.cs                         # → table equipment (60 équipements, FK club_id)
│   │   │   └── MaintenanceTicket.cs                 # → table maintenance_tickets (FK equipment_id, technician_id)
│   │   │
│   │   ├── 📁 Membership/                           # ── members, subscription_plans, service_options, contracts...
│   │   │   ├── Member.cs                            # → table members (120 membres, self-ref referral_member_id)
│   │   │   ├── SubscriptionPlan.cs                  # → table subscription_plans (Basic/Comfort/Premium)
│   │   │   ├── ServiceOption.cs                     # → table service_options (Sportswater/Massages/Coaching)
│   │   │   ├── SubscriptionPlanOption.cs            # → table subscription_plan_options (N-N plan↔option)
│   │   │   ├── Contract.cs                          # → table contracts (120 contrats, FK member/plan/club)
│   │   │   └── ContractOption.cs                    # → table contract_options (N-N contrat↔option avec dates)
│   │   │
│   │   ├── 📁 Billing/                              # ── invoices, invoice_lines, payments, invoice_sequences
│   │   │   ├── InvoiceSequence.cs                   # → table invoice_sequences (compteur par année)
│   │   │   ├── Invoice.cs                           # → table invoices (colonnes GENERATED: vat_amount, amount_incl_tax, balance_due)
│   │   │   ├── InvoiceLine.cs                       # → table invoice_lines (colonnes GENERATED: line_amount_excl/incl_tax)
│   │   │   └── Payment.cs                           # → table payments (FK invoice_id)
│   │   │
│   │   ├── 📁 AccessControl/                        # ── access_log, guests, guest_access_log
│   │   │   ├── AccessLogEntry.cs                    # → table access_log (BIGINT UNSIGNED id)
│   │   │   ├── Guest.cs                             # → table guests (FK sponsor_member_id)
│   │   │   └── GuestAccessLogEntry.cs               # → table guest_access_log (FK guest/member/club)
│   │   │
│   │   ├── 📁 CourseScheduling/                     # ── courses, class_sessions, bookings
│   │   │   ├── Course.cs                            # → table courses (12 cours)
│   │   │   ├── ClassSession.cs                      # → table class_sessions (FK course/instructor/club)
│   │   │   └── Booking.cs                           # → table bookings (PK composite member_id+session_id)
│   │   │
│   │   └── 📁 Compliance/                           # ── audit_gdpr
│   │       └── AuditGdpr.cs                         # → table audit_gdpr (FK member_id)
│   │
│   ├── 📁 Interfaces/                               # Contrats abstraits (implémentés dans Infrastructure)
│   │   │
│   │   ├── 📁 Repositories/                         # ── 1 repo par aggregate root
│   │   │   ├── IClubRepository.cs                   # CRUD clubs + équipements rattachés
│   │   │   ├── IEmployeeRepository.cs               # CRUD employés
│   │   │   ├── IMemberRepository.cs                 # CRUD membres + recherche/filtrage
│   │   │   ├── IContractRepository.cs               # CRUD contrats + options contrat
│   │   │   ├── ISubscriptionPlanRepository.cs       # Lecture plans + options disponibles
│   │   │   ├── IInvoiceRepository.cs                # CRUD factures + lignes
│   │   │   ├── IPaymentRepository.cs                # CRUD paiements
│   │   │   ├── IAccessLogRepository.cs              # Lecture journal d'accès membres
│   │   │   ├── IGuestRepository.cs                  # CRUD invités + journal accès invités
│   │   │   ├── ICourseRepository.cs                 # CRUD cours
│   │   │   ├── IClassSessionRepository.cs           # CRUD sessions + réservations
│   │   │   ├── IEquipmentRepository.cs              # CRUD équipements
│   │   │   ├── IMaintenanceTicketRepository.cs      # CRUD tickets maintenance
│   │   │   └── IAuditGdprRepository.cs              # Lecture audit RGPD
│   │   │
│   │   ├── 📁 StoredProcedures/                     # ── Appels directs aux 8 SPs MySQL
│   │   │   ├── IAccessCheckService.cs               # sp_CheckAccess + sp_CheckAccessGuest
│   │   │   ├── IBillingService.cs                   # sp_GenerateMonthlyInvoice + sp_ExpireElapsedInvoices
│   │   │   ├── IContractLifecycleService.cs         # sp_FreezeContract + sp_RenewContract + sp_ExpireElapsedContracts
│   │   │   └── IGdprService.cs                      # sp_AnonymizeMember
│   │   │
│   │   └── 📁 Common/
│   │       ├── IUnitOfWork.cs                       # Transaction wrapper (SaveChangesAsync)
│   │       └── IDateTimeProvider.cs                 # Abstraction pour les tests (CURDATE/NOW)
│   │
│   └── 📁 Exceptions/                               # Exceptions métier typées
│       ├── DomainException.cs                       # Base
│       ├── MemberNotFoundException.cs
│       ├── ContractNotActiveException.cs
│       ├── OverdueInvoiceException.cs
│       ├── DuoPassLimitReachedException.cs
│       ├── GuestBannedException.cs
│       ├── MinimumAgeException.cs                   # < 16 ans (trigger trg_before_member_insert_age)
│       ├── ClubNotOpenException.cs
│       ├── SessionFullException.cs
│       └── AccessDeniedException.cs
│
│
│ ╔═══════════════════════════════════════════════════════════════╗
│ ║                  src/Riada.Application/                       ║
│ ║       Use Cases, DTOs, Validation, Mapping, Services         ║
│ ╚═══════════════════════════════════════════════════════════════╝
│
├── 📁 src/Riada.Application/
│   ├── Riada.Application.csproj                     # Dépend de: Riada.Domain
│   │                                                # NuGet: FluentValidation, AutoMapper, MediatR (optionnel)
│   │
│   ├── 📁 DTOs/                                     # Objets de transfert (jamais d'entité directe dans l'API)
│   │   │
│   │   ├── 📁 Requests/                             # ── Entrées API
│   │   │   ├── 📁 Access/
│   │   │   │   ├── CheckMemberAccessRequest.cs      # { MemberId, ClubId }
│   │   │   │   └── CheckGuestAccessRequest.cs       # { GuestId, CompanionMemberId, ClubId }
│   │   │   ├── 📁 Members/
│   │   │   │   ├── CreateMemberRequest.cs           # Tous les champs obligatoires de la table members
│   │   │   │   ├── UpdateMemberRequest.cs           # Champs modifiables (pas email unique, pas date_of_birth)
│   │   │   │   └── AnonymizeMemberRequest.cs        # { MemberId, RequestedBy }
│   │   │   ├── 📁 Contracts/
│   │   │   │   ├── CreateContractRequest.cs         # { MemberId, PlanId, HomeClubId, ContractType }
│   │   │   │   ├── FreezeContractRequest.cs         # { ContractId, DurationDays }
│   │   │   │   └── RenewContractRequest.cs          # { ContractId }
│   │   │   ├── 📁 Billing/
│   │   │   │   ├── GenerateMonthlyInvoiceRequest.cs # { ContractId }
│   │   │   │   └── RecordPaymentRequest.cs          # { InvoiceId, Amount, PaymentMethod, TransactionRef }
│   │   │   ├── 📁 Courses/
│   │   │   │   ├── CreateCourseRequest.cs
│   │   │   │   ├── ScheduleSessionRequest.cs        # { CourseId, InstructorId, ClubId, StartsAt }
│   │   │   │   └── BookSessionRequest.cs            # { MemberId, SessionId }
│   │   │   ├── 📁 Guests/
│   │   │   │   ├── RegisterGuestRequest.cs          # { SponsorMemberId, LastName, FirstName, DateOfBirth }
│   │   │   │   └── BanGuestRequest.cs               # { GuestId }
│   │   │   ├── 📁 Equipment/
│   │   │   │   ├── CreateEquipmentRequest.cs
│   │   │   │   └── CreateMaintenanceTicketRequest.cs
│   │   │   └── 📁 Clubs/
│   │   │       ├── CreateClubRequest.cs
│   │   │       └── UpdateClubStatusRequest.cs       # { ClubId, OperationalStatus }
│   │   │
│   │   └── 📁 Responses/                            # ── Sorties API
│   │       ├── 📁 Access/
│   │       │   ├── AccessCheckResponse.cs           # { Decision, DenialReason? }
│   │       │   └── AccessLogResponse.cs             # Entrée de journal formatée
│   │       ├── 📁 Members/
│   │       │   ├── MemberSummaryResponse.cs         # Liste légère (id, nom, statut, plan)
│   │       │   └── MemberDetailResponse.cs          # Vue 360° (contrat, factures, accès, invités)
│   │       ├── 📁 Contracts/
│   │       │   ├── ContractResponse.cs              # Détail contrat + options actives
│   │       │   └── ContractLifecycleResponse.cs     # Résultat freeze/renew/expire { Success, Message }
│   │       ├── 📁 Billing/
│   │       │   ├── InvoiceSummaryResponse.cs        # Liste factures (numéro, statut, montants)
│   │       │   ├── InvoiceDetailResponse.cs         # Facture + lignes + paiements
│   │       │   ├── PaymentResponse.cs
│   │       │   └── FinancialReportResponse.cs       # Reporting mensuel par club (→ requête 08)
│   │       ├── 📁 Courses/
│   │       │   ├── CourseResponse.cs
│   │       │   ├── SessionResponse.cs               # Avec occupancy_pct calculé
│   │       │   └── BookingResponse.cs
│   │       ├── 📁 Guests/
│   │       │   ├── GuestResponse.cs                 # Avec compliance_status (→ requête 08)
│   │       │   └── GuestAccessLogResponse.cs
│   │       ├── 📁 Equipment/
│   │       │   ├── EquipmentResponse.cs
│   │       │   └── MaintenanceTicketResponse.cs
│   │       ├── 📁 Clubs/
│   │       │   └── ClubResponse.cs
│   │       ├── 📁 Analytics/                        # ← Depuis tes requêtes SELECT (08_Select_Queries.sql)
│   │       │   ├── MemberRiskScoreResponse.cs       # → CTE risk_score (overdue*10 + denied*3)
│   │       │   ├── ClubFrequencyReportResponse.cs   # → Fréquentation 30j par club
│   │       │   ├── CollectionRatioResponse.cs       # → Reporting financier mensuel
│   │       │   ├── OptionPopularityResponse.cs      # → Options les plus souscrites
│   │       │   └── SystemHealthCheckResponse.cs     # → 10_System_Check transposé
│   │       └── 📁 Common/
│   │           ├── PagedResponse.cs                 # { Items, TotalCount, Page, PageSize }
│   │           └── ErrorResponse.cs                 # { Code, Message, Details }
│   │
│   ├── 📁 Validators/                               # FluentValidation — miroir des CHECK + triggers
│   │   ├── 📁 Members/
│   │   │   ├── CreateMemberValidator.cs             # Email unique, âge >= 16, format téléphone
│   │   │   └── UpdateMemberValidator.cs
│   │   ├── 📁 Contracts/
│   │   │   ├── CreateContractValidator.cs           # end_date > start_date, statut cohérent
│   │   │   └── FreezeContractValidator.cs           # duration_days 1-365
│   │   ├── 📁 Billing/
│   │   │   ├── RecordPaymentValidator.cs            # amount > 0, failed → error_code requis
│   │   │   └── GenerateInvoiceValidator.cs
│   │   ├── 📁 Courses/
│   │   │   ├── ScheduleSessionValidator.cs          # starts_at futur, < 180 jours
│   │   │   └── BookSessionValidator.cs
│   │   ├── 📁 Guests/
│   │   │   └── RegisterGuestValidator.cs            # Âge >= 16, sponsor actif
│   │   └── 📁 Equipment/
│   │       └── CreateMaintenanceTicketValidator.cs   # Rôle technicien validé
│   │
│   ├── 📁 UseCases/                                 # Logique orchestration (1 use case = 1 classe)
│   │   │
│   │   ├── 📁 Access/                               # ── sp_CheckAccess, sp_CheckAccessGuest
│   │   │   ├── CheckMemberAccessUseCase.cs          # Appelle IAccessCheckService.CheckMemberAsync()
│   │   │   ├── CheckGuestAccessUseCase.cs           # Appelle IAccessCheckService.CheckGuestAsync()
│   │   │   └── GetAccessLogUseCase.cs               # Lecture journal avec filtres (club, date, statut)
│   │   │
│   │   ├── 📁 Members/                              # ── CRUD members
│   │   │   ├── CreateMemberUseCase.cs
│   │   │   ├── UpdateMemberUseCase.cs
│   │   │   ├── GetMemberDetailUseCase.cs            # Vue 360° (→ requête CTE latest_contract)
│   │   │   ├── ListMembersUseCase.cs                # Paginé, filtré par statut/club/plan
│   │   │   └── AnonymizeMemberUseCase.cs            # Appelle IGdprService.AnonymizeAsync()
│   │   │
│   │   ├── 📁 Contracts/                            # ── sp_FreezeContract, sp_RenewContract, sp_ExpireElapsedContracts
│   │   │   ├── CreateContractUseCase.cs
│   │   │   ├── FreezeContractUseCase.cs             # Appelle IContractLifecycleService.FreezeAsync()
│   │   │   ├── RenewContractUseCase.cs              # Appelle IContractLifecycleService.RenewAsync()
│   │   │   └── GetContractDetailUseCase.cs          # Contrat + options + factures liées
│   │   │
│   │   ├── 📁 Billing/                              # ── sp_GenerateMonthlyInvoice, sp_ExpireElapsedInvoices
│   │   │   ├── GenerateMonthlyInvoiceUseCase.cs     # Appelle IBillingService.GenerateAsync()
│   │   │   ├── RecordPaymentUseCase.cs              # INSERT payment (trigger met à jour facture)
│   │   │   ├── GetInvoiceDetailUseCase.cs           # Facture + lignes + historique paiements
│   │   │   └── GetFinancialReportUseCase.cs         # → Requête reporting mensuel par club
│   │   │
│   │   ├── 📁 Courses/
│   │   │   ├── CreateCourseUseCase.cs
│   │   │   ├── ScheduleSessionUseCase.cs
│   │   │   ├── BookSessionUseCase.cs                # Vérifie capacité → confirmed ou waitlisted
│   │   │   ├── CancelBookingUseCase.cs
│   │   │   └── GetUpcomingSessionsUseCase.cs        # Sessions 14 jours avec occupancy_pct
│   │   │
│   │   ├── 📁 Guests/                               # ── table guests + guest_access_log
│   │   │   ├── RegisterGuestUseCase.cs              # Trigger vérifie limite 1 actif + sponsor policy
│   │   │   ├── BanGuestUseCase.cs
│   │   │   └── GetGuestComplianceUseCase.cs         # → Requête compliance_status
│   │   │
│   │   ├── 📁 Equipment/
│   │   │   ├── CreateEquipmentUseCase.cs
│   │   │   ├── CreateMaintenanceTicketUseCase.cs
│   │   │   ├── UpdateTicketStatusUseCase.cs
│   │   │   └── GetMaintenanceReportUseCase.cs       # → Par club, priorité, statut
│   │   │
│   │   ├── 📁 Clubs/
│   │   │   ├── CreateClubUseCase.cs
│   │   │   ├── UpdateClubStatusUseCase.cs
│   │   │   └── GetClubDashboardUseCase.cs           # Membres actifs, fréquentation, équipements
│   │   │
│   │   └── 📁 Analytics/                            # ← Requêtes complexes de 08_Select_Queries.sql
│   │       ├── GetMemberRiskScoresUseCase.cs        # CTE overdue_by_contract + denied_by_member
│   │       ├── GetClubFrequencyReportUseCase.cs     # Accès 30j membres + invités par club
│   │       ├── GetOptionPopularityUseCase.cs        # Options actives par nombre de contrats
│   │       └── RunSystemHealthCheckUseCase.cs       # Transposition de 10_System_Check.sql
│   │
│   ├── 📁 Mapping/                                  # AutoMapper profiles
│   │   ├── MemberProfile.cs                         # Member ↔ MemberSummaryResponse / MemberDetailResponse
│   │   ├── ContractProfile.cs
│   │   ├── InvoiceProfile.cs                        # Gère les colonnes GENERATED (lecture seule)
│   │   ├── CourseProfile.cs
│   │   ├── EquipmentProfile.cs
│   │   └── ClubProfile.cs
│   │
│   ├── 📁 Behaviors/                                # MediatR pipeline (si MediatR utilisé)
│   │   ├── ValidationBehavior.cs                    # FluentValidation automatique avant chaque handler
│   │   ├── LoggingBehavior.cs                       # Logging entrée/sortie de chaque use case
│   │   └── TransactionBehavior.cs                   # Wrapping UnitOfWork automatique
│   │
│   └── DependencyInjection.cs                       # services.AddApplication() — enregistre validators, mapping, use cases
│
│
│ ╔═══════════════════════════════════════════════════════════════╗
│ ║                src/Riada.Infrastructure/                      ║
│ ║     EF Core, MySQL, Procédures Stockées, Repositories        ║
│ ╚═══════════════════════════════════════════════════════════════╝
│
├── 📁 src/Riada.Infrastructure/
│   ├── Riada.Infrastructure.csproj                  # Dépend de: Riada.Domain
│   │                                                # NuGet: Pomelo.EntityFrameworkCore.MySql, Dapper, MySqlConnector
│   │
│   ├── 📁 Persistence/
│   │   │
│   │   ├── RiadaDbContext.cs                        # DbContext principal — 21 DbSet<>
│   │   │                                            #   DbSet<Club>, DbSet<Employee>, DbSet<Equipment>,
│   │   │                                            #   DbSet<MaintenanceTicket>, DbSet<Member>,
│   │   │                                            #   DbSet<SubscriptionPlan>, DbSet<ServiceOption>,
│   │   │                                            #   DbSet<SubscriptionPlanOption>, DbSet<Contract>,
│   │   │                                            #   DbSet<ContractOption>, DbSet<InvoiceSequence>,
│   │   │                                            #   DbSet<Invoice>, DbSet<InvoiceLine>, DbSet<Payment>,
│   │   │                                            #   DbSet<AccessLogEntry>, DbSet<Guest>,
│   │   │                                            #   DbSet<GuestAccessLogEntry>, DbSet<Course>,
│   │   │                                            #   DbSet<ClassSession>, DbSet<Booking>,
│   │   │                                            #   DbSet<AuditGdpr>
│   │   │
│   │   ├── UnitOfWork.cs                            # Implémente IUnitOfWork (transaction wrapper)
│   │   │
│   │   ├── 📁 Configurations/                       # EF Core Fluent API — 1 fichier par entité
│   │   │   │
│   │   │   ├── 📁 ClubManagement/
│   │   │   │   ├── ClubConfiguration.cs             # Table "clubs", PK, VARCHAR lengths, DEFAULT values
│   │   │   │   ├── EmployeeConfiguration.cs         # Table "employees", FK club_id, UNIQUE email
│   │   │   │   ├── EquipmentConfiguration.cs        # Table "equipment", FK club_id, CHECK purchase_cost
│   │   │   │   └── MaintenanceTicketConfiguration.cs # Table "maintenance_tickets", FK equipment_id + technician_id
│   │   │   │
│   │   │   ├── 📁 Membership/
│   │   │   │   ├── MemberConfiguration.cs           # Table "members", self-ref FK, UNIQUE email
│   │   │   │   │                                    # .HasConversion<string>() pour enums MySQL
│   │   │   │   │                                    # idx_members_status, idx_members_referral
│   │   │   │   ├── SubscriptionPlanConfiguration.cs # Table "subscription_plans", CHECK constraints
│   │   │   │   ├── ServiceOptionConfiguration.cs    # Table "service_options", UNIQUE option_name
│   │   │   │   ├── SubscriptionPlanOptionConfig.cs  # Table "subscription_plan_options", PK composite
│   │   │   │   ├── ContractConfiguration.cs         # Table "contracts", CHECK dates, index composites
│   │   │   │   └── ContractOptionConfiguration.cs   # Table "contract_options", CHECK removed_on >= added_on
│   │   │   │
│   │   │   ├── 📁 Billing/
│   │   │   │   ├── InvoiceSequenceConfiguration.cs  # Table "invoice_sequences", PK(year)
│   │   │   │   ├── InvoiceConfiguration.cs          # Table "invoices"
│   │   │   │   │                                    # ⚠️ CRITICAL: colonnes GENERATED → .ValueGeneratedOnAddOrUpdate()
│   │   │   │   │                                    #   vat_amount      → DatabaseGeneratedOption.Computed
│   │   │   │   │                                    #   amount_incl_tax → DatabaseGeneratedOption.Computed
│   │   │   │   │                                    #   balance_due     → DatabaseGeneratedOption.Computed
│   │   │   │   │                                    # Index: idx_invoices_contract_status_due
│   │   │   │   ├── InvoiceLineConfiguration.cs      # Table "invoice_lines"
│   │   │   │   │                                    # ⚠️ colonnes GENERATED: line_amount_excl_tax, line_amount_incl_tax
│   │   │   │   └── PaymentConfiguration.cs          # Table "payments", CHECK amount > 0
│   │   │   │
│   │   │   ├── 📁 AccessControl/
│   │   │   │   ├── AccessLogConfiguration.cs        # Table "access_log", BIGINT UNSIGNED id
│   │   │   │   ├── GuestConfiguration.cs            # Table "guests", FK sponsor_member_id
│   │   │   │   └── GuestAccessLogConfiguration.cs   # Table "guest_access_log"
│   │   │   │
│   │   │   ├── 📁 CourseScheduling/
│   │   │   │   ├── CourseConfiguration.cs           # Table "courses", UNIQUE course_name
│   │   │   │   ├── ClassSessionConfiguration.cs     # Table "class_sessions"
│   │   │   │   └── BookingConfiguration.cs          # Table "bookings", PK composite (member_id, session_id)
│   │   │   │
│   │   │   └── 📁 Compliance/
│   │   │       └── AuditGdprConfiguration.cs        # Table "audit_gdpr"
│   │   │
│   │   └── 📁 Interceptors/                         # EF Core interceptors
│   │       ├── AuditableEntityInterceptor.cs        # Met à jour created_at/updated_at automatiquement
│   │       └── SoftDeleteInterceptor.cs             # Si besoin futur
│   │
│   ├── 📁 Repositories/                             # Implémentations des interfaces Domain
│   │   ├── ClubRepository.cs
│   │   ├── EmployeeRepository.cs
│   │   ├── MemberRepository.cs                      # Inclut filtrage paginé, recherche par email
│   │   ├── ContractRepository.cs                    # Inclut GetLatestActive(memberId)
│   │   ├── SubscriptionPlanRepository.cs
│   │   ├── InvoiceRepository.cs                     # Inclut GetWithLinesAndPayments(id)
│   │   ├── PaymentRepository.cs
│   │   ├── AccessLogRepository.cs                   # Inclut GetByClubLast30Days(clubId)
│   │   ├── GuestRepository.cs
│   │   ├── CourseRepository.cs
│   │   ├── ClassSessionRepository.cs                # Inclut GetUpcomingWithOccupancy(days)
│   │   ├── EquipmentRepository.cs
│   │   ├── MaintenanceTicketRepository.cs
│   │   └── AuditGdprRepository.cs
│   │
│   ├── 📁 StoredProcedures/                         # Appels aux 8 SPs MySQL via Dapper
│   │   │
│   │   ├── AccessCheckService.cs                    # Implémente IAccessCheckService
│   │   │   # ── sp_CheckAccess(p_member_id, p_club_id, OUT p_decision)
│   │   │   # ── sp_CheckAccessGuest(p_guest_id, p_companion_member_id, p_club_id, OUT p_decision)
│   │   │   # Note: Les SPs insèrent eux-mêmes dans access_log / guest_access_log
│   │   │
│   │   ├── BillingService.cs                        # Implémente IBillingService
│   │   │   # ── sp_GenerateMonthlyInvoice(p_contract_id, OUT p_result)
│   │   │   # ── sp_ExpireElapsedInvoices(OUT p_count)
│   │   │   # Note: sp_GenerateMonthlyInvoice crée facture + lignes dans une transaction
│   │   │
│   │   ├── ContractLifecycleService.cs              # Implémente IContractLifecycleService
│   │   │   # ── sp_FreezeContract(p_contract_id, p_duration_days, OUT p_result)
│   │   │   # ── sp_RenewContract(p_contract_id, OUT p_result)
│   │   │   # ── sp_ExpireElapsedContracts(OUT p_count)
│   │   │   # Note: sp_RenewContract copie les contract_options vers le nouveau contrat
│   │   │
│   │   └── GdprService.cs                           # Implémente IGdprService
│   │       # ── sp_AnonymizeMember(p_member_id, p_requested_by, OUT p_result)
│   │       # Note: Annule contrats, réservations, anonymise données + invités, crée audit_gdpr
│   │
│   ├── 📁 BackgroundJobs/                           # Tâches planifiées (Hangfire ou IHostedService)
│   │   ├── ExpireContractsJob.cs                    # Appelle sp_ExpireElapsedContracts — quotidien
│   │   ├── ExpireInvoicesJob.cs                     # Appelle sp_ExpireElapsedInvoices — quotidien
│   │   └── MonthlyBillingJob.cs                     # Boucle sur contrats actifs → sp_GenerateMonthlyInvoice — mensuel
│   │
│   ├── 📁 Services/
│   │   └── DateTimeProvider.cs                      # Implémente IDateTimeProvider (wrapper autour de DateTime.UtcNow)
│   │
│   └── DependencyInjection.cs                       # services.AddInfrastructure(config) — EF, Dapper, repos, jobs
│
│
│ ╔═══════════════════════════════════════════════════════════════╗
│ ║                     src/Riada.API/                            ║
│ ║        ASP.NET Core Web API — Controllers, Auth, Middleware   ║
│ ╚═══════════════════════════════════════════════════════════════╝
│
├── 📁 src/Riada.API/
│   ├── Riada.API.csproj                             # Dépend de: Riada.Application, Riada.Infrastructure
│   │                                                # NuGet: Swashbuckle (Swagger), Serilog, JWT Bearer
│   │
│   ├── Program.cs                                   # Host builder, DI registration, pipeline
│   ├── appsettings.json                             # ConnectionStrings:RiadaDb, JWT settings, Hangfire
│   ├── appsettings.Development.json
│   │
│   ├── 📁 Controllers/                              # 1 controller par domaine métier
│   │   │
│   │   ├── AccessController.cs                      # [Authorize(Policy = "GateAccess")]
│   │   │   # POST   /api/access/member              → CheckMemberAccessUseCase
│   │   │   # POST   /api/access/guest               → CheckGuestAccessUseCase
│   │   │   # GET    /api/access/log                  → GetAccessLogUseCase (filtres: club, date, statut)
│   │   │
│   │   ├── MembersController.cs                     # [Authorize]
│   │   │   # GET    /api/members                     → ListMembersUseCase (paginé)
│   │   │   # GET    /api/members/{id}                → GetMemberDetailUseCase (vue 360°)
│   │   │   # POST   /api/members                     → CreateMemberUseCase
│   │   │   # PUT    /api/members/{id}                → UpdateMemberUseCase
│   │   │   # DELETE /api/members/{id}/gdpr           → AnonymizeMemberUseCase [Policy = "DataProtection"]
│   │   │
│   │   ├── ContractsController.cs                   # [Authorize]
│   │   │   # GET    /api/contracts/{id}              → GetContractDetailUseCase
│   │   │   # POST   /api/contracts                   → CreateContractUseCase
│   │   │   # POST   /api/contracts/{id}/freeze       → FreezeContractUseCase [Policy = "DataProtection"]
│   │   │   # POST   /api/contracts/{id}/renew        → RenewContractUseCase [Policy = "DataProtection"]
│   │   │
│   │   ├── BillingController.cs                     # [Authorize(Policy = "BillingOps")]
│   │   │   # POST   /api/billing/generate            → GenerateMonthlyInvoiceUseCase
│   │   │   # GET    /api/billing/invoices/{id}       → GetInvoiceDetailUseCase
│   │   │   # POST   /api/billing/payments            → RecordPaymentUseCase
│   │   │   # GET    /api/billing/reports/monthly      → GetFinancialReportUseCase
│   │   │
│   │   ├── CoursesController.cs                     # [Authorize]
│   │   │   # GET    /api/courses                     → ListCoursesUseCase
│   │   │   # POST   /api/courses                     → CreateCourseUseCase
│   │   │   # GET    /api/courses/sessions            → GetUpcomingSessionsUseCase
│   │   │   # POST   /api/courses/sessions            → ScheduleSessionUseCase
│   │   │   # POST   /api/courses/sessions/{id}/book  → BookSessionUseCase
│   │   │   # DELETE /api/courses/bookings/{mid}/{sid} → CancelBookingUseCase
│   │   │
│   │   ├── GuestsController.cs                      # [Authorize]
│   │   │   # GET    /api/guests                      → ListGuestsUseCase
│   │   │   # POST   /api/guests                      → RegisterGuestUseCase
│   │   │   # POST   /api/guests/{id}/ban             → BanGuestUseCase
│   │   │   # GET    /api/guests/compliance            → GetGuestComplianceUseCase
│   │   │
│   │   ├── ClubsController.cs                       # [Authorize]
│   │   │   # GET    /api/clubs                       → ListClubsUseCase
│   │   │   # GET    /api/clubs/{id}                  → GetClubDashboardUseCase
│   │   │   # POST   /api/clubs                       → CreateClubUseCase
│   │   │   # PATCH  /api/clubs/{id}/status            → UpdateClubStatusUseCase
│   │   │
│   │   ├── EquipmentController.cs                   # [Authorize]
│   │   │   # GET    /api/equipment                   → ListEquipmentUseCase (filtres: club, statut)
│   │   │   # POST   /api/equipment                   → CreateEquipmentUseCase
│   │   │   # GET    /api/equipment/maintenance        → GetMaintenanceReportUseCase
│   │   │   # POST   /api/equipment/maintenance        → CreateMaintenanceTicketUseCase
│   │   │   # PATCH  /api/equipment/maintenance/{id}   → UpdateTicketStatusUseCase
│   │   │
│   │   ├── AnalyticsController.cs                   # [Authorize(Policy = "BillingOps")]
│   │   │   # GET    /api/analytics/risk-scores        → GetMemberRiskScoresUseCase (top 25)
│   │   │   # GET    /api/analytics/frequency           → GetClubFrequencyReportUseCase
│   │   │   # GET    /api/analytics/options             → GetOptionPopularityUseCase
│   │   │   # GET    /api/analytics/health              → RunSystemHealthCheckUseCase
│   │   │
│   │   └── SubscriptionPlansController.cs           # [Authorize] (lecture seule pour les clients)
│   │       # GET    /api/plans                        → ListPlansUseCase
│   │       # GET    /api/plans/{id}/options            → GetPlanOptionsUseCase
│   │
│   ├── 📁 Middleware/
│   │   ├── GlobalExceptionHandler.cs                # Catch DomainException → 400/404/409
│   │   │                                            # Catch SQLSTATE 45000 (triggers) → 422 + message parsé
│   │   │                                            # Catch Exception → 500
│   │   ├── RequestLoggingMiddleware.cs              # Serilog structured logging
│   │   └── CorrelationIdMiddleware.cs               # Trace ID pour debugging cross-service
│   │
│   ├── 📁 Auth/                                     # ← Transposition des 3 rôles MySQL
│   │   ├── AuthorizationPolicies.cs                 # Définition des policies
│   │   │   # "GateAccess"      → portique_user     → Rôle: role_gate_access
│   │   │   # "BillingOps"      → billing_user      → Rôle: role_billing_ops
│   │   │   # "DataProtection"  → dpo_user          → Rôle: role_data_protection
│   │   │   # "Admin"           → Tous les droits
│   │   ├── JwtConfiguration.cs                      # JWT Bearer token setup
│   │   └── CurrentUserService.cs                    # Extraction user/role depuis le token
│   │
│   └── 📁 Filters/
│       ├── ValidateModelFilter.cs                   # Validation automatique ModelState
│       └── ApiKeyAuthFilter.cs                      # Auth alternative pour le portique (machine-to-machine)
│
│
│ ╔═══════════════════════════════════════════════════════════════╗
│ ║                         tests/                               ║
│ ║              Tests unitaires + intégration                   ║
│ ╚═══════════════════════════════════════════════════════════════╝
│
├── 📁 tests/
│   │
│   ├── 📁 Riada.UnitTests/                          # Pas de DB, tout mocké
│   │   ├── Riada.UnitTests.csproj                   # NuGet: xUnit, Moq, FluentAssertions
│   │   │
│   │   ├── 📁 UseCases/
│   │   │   ├── 📁 Access/
│   │   │   │   ├── CheckMemberAccessTests.cs        # Scénarios: granted, denied (overdue, no contract, closed club)
│   │   │   │   └── CheckGuestAccessTests.cs         # Scénarios: granted, banned, wrong sponsor, no duo pass
│   │   │   ├── 📁 Members/
│   │   │   │   ├── CreateMemberTests.cs             # Validation âge, email duplicate
│   │   │   │   └── AnonymizeMemberTests.cs
│   │   │   ├── 📁 Contracts/
│   │   │   │   ├── FreezeContractTests.cs           # Duration bounds, already suspended
│   │   │   │   └── RenewContractTests.cs            # Open-ended rejection, expired OK
│   │   │   ├── 📁 Billing/
│   │   │   │   ├── GenerateInvoiceTests.cs          # Already generated, inactive contract
│   │   │   │   └── RecordPaymentTests.cs            # Overpayment, failed without error_code
│   │   │   └── 📁 Courses/
│   │   │       ├── BookSessionTests.cs              # Capacity full → waitlisted, limited club access
│   │   │       └── ScheduleSessionTests.cs          # Past date, wrong instructor role
│   │   │
│   │   └── 📁 Validators/
│   │       ├── CreateMemberValidatorTests.cs
│   │       ├── FreezeContractValidatorTests.cs
│   │       └── RecordPaymentValidatorTests.cs
│   │
│   └── 📁 Riada.IntegrationTests/                   # Avec vraie DB MySQL (Testcontainers)
│       ├── Riada.IntegrationTests.csproj             # NuGet: xUnit, Testcontainers.MySql, WebApplicationFactory
│       │
│       ├── 📁 Fixtures/
│       │   ├── DatabaseFixture.cs                   # Spin up MySQL container + run sql/01-07
│       │   └── ApiFixture.cs                        # WebApplicationFactory<Program>
│       │
│       ├── 📁 StoredProcedures/                     # ← Miroir de 09_Tests.sql en C#
│       │   ├── CheckAccessIntegrationTests.cs       # T07-T09, T22: member overdue, granted, unknown, closed club
│       │   ├── CheckAccessGuestIntegrationTests.cs  # T10-T11, T23: banned, active, wrong sponsor
│       │   ├── GenerateInvoiceIntegrationTests.cs   # Vérifie facture + lignes créées
│       │   ├── FreezeContractIntegrationTests.cs    # Vérifie dates gel + extension end_date
│       │   ├── RenewContractIntegrationTests.cs     # Vérifie nouveau contrat + copie options
│       │   └── AnonymizeMemberIntegrationTests.cs   # Vérifie anonymisation complète
│       │
│       ├── 📁 Triggers/                             # Vérifie que les triggers MySQL fonctionnent via EF
│       │   ├── PaymentTriggerTests.cs               # T17: paiement → statut facture = paid
│       │   ├── InvoiceNumberTriggerTests.cs         # T06: numéro auto-généré INV-YYYY-XXXXX
│       │   ├── GuestLimitTriggerTests.cs            # T15: max 1 invité actif par sponsor
│       │   ├── ContractPolicyTriggerTests.cs        # T26: cohérence statut/métadonnées
│       │   └── AgeRestrictionTriggerTests.cs        # T16: < 16 ans rejeté
│       │
│       ├── 📁 Endpoints/                            # Tests end-to-end via HTTP
│       │   ├── AccessEndpointTests.cs
│       │   ├── MembersEndpointTests.cs
│       │   ├── BillingEndpointTests.cs
│       │   └── CoursesEndpointTests.cs
│       │
│       └── 📁 DataIntegrity/                        # ← Transposition de 10_System_Check.sql
│           └── SystemHealthCheckTests.cs            # C01-C21 en assertions C#
│
│
└── Riada.sln                                        # Solution file
    # Projets:
    #   src/Riada.Domain/Riada.Domain.csproj
    #   src/Riada.Application/Riada.Application.csproj
    #   src/Riada.Infrastructure/Riada.Infrastructure.csproj
    #   src/Riada.API/Riada.API.csproj
    #   tests/Riada.UnitTests/Riada.UnitTests.csproj
    #   tests/Riada.IntegrationTests/Riada.IntegrationTests.csproj
```

---

## 📊 Mapping complet SQL → C#

### Tables (21) → Entités

| Table MySQL | Entité C# | Namespace |
|---|---|---|
| `clubs` | `Club` | `Domain.Entities.ClubManagement` |
| `employees` | `Employee` | `Domain.Entities.ClubManagement` |
| `equipment` | `Equipment` | `Domain.Entities.ClubManagement` |
| `maintenance_tickets` | `MaintenanceTicket` | `Domain.Entities.ClubManagement` |
| `members` | `Member` | `Domain.Entities.Membership` |
| `subscription_plans` | `SubscriptionPlan` | `Domain.Entities.Membership` |
| `service_options` | `ServiceOption` | `Domain.Entities.Membership` |
| `subscription_plan_options` | `SubscriptionPlanOption` | `Domain.Entities.Membership` |
| `contracts` | `Contract` | `Domain.Entities.Membership` |
| `contract_options` | `ContractOption` | `Domain.Entities.Membership` |
| `invoice_sequences` | `InvoiceSequence` | `Domain.Entities.Billing` |
| `invoices` | `Invoice` | `Domain.Entities.Billing` |
| `invoice_lines` | `InvoiceLine` | `Domain.Entities.Billing` |
| `payments` | `Payment` | `Domain.Entities.Billing` |
| `access_log` | `AccessLogEntry` | `Domain.Entities.AccessControl` |
| `guests` | `Guest` | `Domain.Entities.AccessControl` |
| `guest_access_log` | `GuestAccessLogEntry` | `Domain.Entities.AccessControl` |
| `courses` | `Course` | `Domain.Entities.CourseScheduling` |
| `class_sessions` | `ClassSession` | `Domain.Entities.CourseScheduling` |
| `bookings` | `Booking` | `Domain.Entities.CourseScheduling` |
| `audit_gdpr` | `AuditGdpr` | `Domain.Entities.Compliance` |

### Procédures (8) → Services

| Procédure MySQL | Service C# | Use Case | Endpoint |
|---|---|---|---|
| `sp_CheckAccess` | `AccessCheckService` | `CheckMemberAccessUseCase` | `POST /api/access/member` |
| `sp_CheckAccessGuest` | `AccessCheckService` | `CheckGuestAccessUseCase` | `POST /api/access/guest` |
| `sp_GenerateMonthlyInvoice` | `BillingService` | `GenerateMonthlyInvoiceUseCase` | `POST /api/billing/generate` |
| `sp_ExpireElapsedInvoices` | `BillingService` | `ExpireInvoicesJob` | Background job |
| `sp_FreezeContract` | `ContractLifecycleService` | `FreezeContractUseCase` | `POST /api/contracts/{id}/freeze` |
| `sp_RenewContract` | `ContractLifecycleService` | `RenewContractUseCase` | `POST /api/contracts/{id}/renew` |
| `sp_ExpireElapsedContracts` | `ContractLifecycleService` | `ExpireContractsJob` | Background job |
| `sp_AnonymizeMember` | `GdprService` | `AnonymizeMemberUseCase` | `DELETE /api/members/{id}/gdpr` |

### Triggers (28) → Répartition des responsabilités

| Trigger MySQL | Protection | Gérée par |
|---|---|---|
| `trg_before_payment_insert_integrity` | Intégrité paiement | DB (trigger reste) + `RecordPaymentValidator` (pré-validation API) |
| `trg_after_payment_insert` | MAJ automatique facture | DB uniquement (logique transactionnelle critique) |
| `trg_before_invoice_insert` | Génération n° facture | DB uniquement (séquence atomique) |
| `trg_before_invoice_update_integrity` | Cohérence statut facture | DB (trigger) + `InvoiceConfiguration` (EF computed columns) |
| `trg_before_contract_insert_policy` | Cohérence métadonnées contrat | DB + `CreateContractValidator` |
| `trg_before_contract_update_policy` | Idem pour UPDATE | DB + validation use case |
| `trg_before_guest_insert_limit` | Max 1 invité actif | DB (trigger) — filet de sécurité |
| `trg_before_guest_update_limit` | Idem pour UPDATE | DB (trigger) |
| `trg_before_guest_insert_sponsor_policy` | Sponsor actif + duo pass | DB + `RegisterGuestValidator` |
| `trg_before_guest_update_sponsor_policy` | Idem pour UPDATE | DB (trigger) |
| `trg_before_member_insert_age` | Âge ≥ 16 | DB + `CreateMemberValidator` |
| `trg_before_member_update_age` | Idem pour UPDATE | DB (trigger) |
| `trg_before_guest_insert_age` | Âge invité ≥ 16 | DB + `RegisterGuestValidator` |
| `trg_before_guest_update_age` | Idem pour UPDATE | DB (trigger) |
| `trg_after_access_granted` | MAJ last_visit + total_visits | DB uniquement (effet de bord automatique) |
| `trg_before_class_session_insert_instructor` | Rôle instructeur + même club | DB + `ScheduleSessionValidator` |
| `trg_before_class_session_update_instructor` | Idem pour UPDATE | DB (trigger) |
| `trg_before_class_session_insert_timing` | Session future, durée = cours, capacité | DB + `ScheduleSessionValidator` |
| `trg_before_class_session_update_timing` | Idem pour UPDATE | DB (trigger) |
| `trg_before_maintenance_insert_policy` | Lifecycle ticket + rôle technicien | DB + `CreateMaintenanceTicketValidator` |
| `trg_before_maintenance_update_policy` | Idem pour UPDATE | DB (trigger) |
| `trg_before_booking_insert_policy` | Membre actif, contrat valide, club ouvert | DB + `BookSessionValidator` |
| `trg_before_booking_insert_cap` | Capacité session | DB + `BookSessionUseCase` (vérification optimiste) |
| `trg_after_booking_insert` | MAJ enrolled_count +1 | DB uniquement |
| `trg_before_booking_update_policy` | Idem pour UPDATE | DB (trigger) |
| `trg_before_booking_update_cap` | Idem pour UPDATE | DB (trigger) |
| `trg_after_booking_update` | MAJ enrolled_count ±1 | DB uniquement |
| `trg_after_booking_delete` | MAJ enrolled_count -1 | DB uniquement |

### Rôles (3) → Authorization Policies

| Rôle MySQL | User MySQL | Policy ASP.NET | Controllers protégés |
|---|---|---|---|
| `role_gate_access` | `portique_user` | `GateAccess` | `AccessController` |
| `role_billing_ops` | `billing_user` | `BillingOps` | `BillingController`, `AnalyticsController` |
| `role_data_protection` | `dpo_user` | `DataProtection` | `MembersController` (GDPR), `ContractsController` (freeze/renew) |

---

## 🔗 Graphe de dépendances

```
Riada.API
  └── Riada.Application
  │     └── Riada.Domain        ← (zéro dépendance)
  └── Riada.Infrastructure
        └── Riada.Domain

Riada.UnitTests
  └── Riada.Application
  └── Riada.Domain

Riada.IntegrationTests
  └── Riada.API
  └── Riada.Infrastructure
```

> **Règle d'or** : Domain ne dépend de rien. Application dépend de Domain.
> Infrastructure dépend de Domain (pas d'Application). API câble le tout.
