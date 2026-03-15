# 🌐 RIADA Frontend - Angular 19 Standalone

Modern Angular 19 frontend for the RIADA fitness management system.

## 🚀 Quick Start (Node 24+ compatible)

```bash
# Install deps
npm install

# Build then serve the dist (auto-picks a free port starting at 4200)
npm run build
npm run serve:dist

# Fullstack (backend + frontend dist)
cd ../scripts/Launch
.\launch.ps1 fullstack
```

## 📋 Features

### ✅ Implemented Domains

- **Dashboard / Statistics**: Live KPIs, analytics (risks, frequency, options, health)
- **Members & Contracts**: CRUD, contract create/freeze/renew, filters
- **Courses / Classes / Schedule**: Sessions with booking/cancel
- **Billing**: Invoice detail, lines/payments, generation, errors surfaced
- **Equipment**: Club/status filters, maintenance tickets
- **Access Control**: Member/guest checks
- **Plans / Options / Clubs / Guests**: API-backed listings and actions
- **Demo placeholders**: Exercises, meal-plan/details, workout, messages, reports, settings

## 🏗️ Architecture

- **Framework:** Angular 19.2 (Standalone Components)
- **Styling:** SCSS with global design system
- **HTTP:** RxJS with HttpClientModule
- **Routing:** Standalone routes with lazy loading

## 📦 npm Scripts

```bash
npm start        # Alias to npm run dev
npm run dev      # Serve production bundle via http-server (port auto from 4200)
npm run build    # Production build
npm test         # Run unit tests
npm run watch    # Watch mode
npm run serve:dist # Serve existing dist/ without rebuilding
```

## 🔌 API Integration

All API calls through `ApiService` with typed models:
- Members: `getMembers`, `getMemberDetail`, `createMember`, `updateMember`, `anonymizeMember`
- Courses: `getUpcomingSessions`, `bookSession`, `cancelBooking`
- Billing: `getInvoiceDetail`, `recordPayment`, `generateMonthlyInvoice`
- Equipment: `listEquipment`, `createMaintenanceTicket`, `updateMaintenanceStatus`
- Access/Analytics/Clubs/Plans/Guests helpers aligned with backend controllers

API URL: `https://localhost:7001/api`

## 📚 For More Details

See main [README.md](../README.md#-frontend-angular-19) in project root.

---

**Status:** ✅ Angular 19 ready (Node 24), domaines API principaux couverts
