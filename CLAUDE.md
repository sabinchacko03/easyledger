# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multi-tenant receipt & credit note generation system for UAE suppliers and their salespeople. The system supports offline-first mobile receipt collection with Arabic/English bilingual support, Peppol-ready XML fields, and background PDF/email generation.

## Repository Structure

```
Code/
├── api/        Laravel 13 REST API (PHP 8.3+, MySQL 8.0)
└── mobile/     React Native / Expo 55 mobile app (TypeScript)
```

## API (Laravel Backend)

### Common Commands

```bash
# Development (runs server + queue + logs + Vite concurrently)
composer dev

# Full setup from scratch
composer setup

# Run tests
composer test
# or
php artisan test

# Run a single test
php artisan test --filter=TestClassName

# PHP linting/formatting
./vendor/bin/pint

# Database
php artisan migrate
php artisan migrate:fresh --seed

# Docker (Laravel Sail)
./vendor/bin/sail up -d
./vendor/bin/sail down
```

### Architecture

**Multi-tenancy**: Single database with `tenant_id` on `users`, `customers`, `documents`. The `BelongsToTenant` trait applies a global Eloquent scope (`TenantScope`) so all queries are automatically filtered. Never bypass this scope unintentionally.

**Roles**: Managed by Spatie Permission v6. Two roles: `admin` (manage team/customers/all docs within tenant) and `salesperson` (create & view own docs only).

**Authentication**: Laravel Sanctum — token-based. Mobile app sends `Authorization: Bearer <token>`.

**Document flow**:
1. Salesperson creates a receipt (type 380) or credit note (type 381, must reference `parent_id`)
2. `DocNumberService` assigns sequential `doc_number` per tenant (e.g. `PV-2026-0001`)
3. `TafqeetService` converts amount to Arabic/English words stored on the document
4. `SendReceiptEmail` job queued — generates PDF via `PdfService` (DOMPDF, Tailwind, RTL-aware), emails customer + tenant

**Key directories**:
- `app/Http/Controllers/Api/` — All API controllers
- `app/Models/` — User, Tenant, Customer, Document, SalespersonProfile
- `app/Services/` — DocNumberService, TafqeetService, PdfService
- `app/Jobs/` — SendReceiptEmail
- `app/Traits/BelongsToTenant.php` — Auto-scopes queries by tenant_id
- `routes/api.php` — All API routes

**Test database**: PHPUnit uses SQLite in-memory (configured in `phpunit.xml`).

## Mobile (React Native / Expo)

### Common Commands

```bash
# Start Expo dev server
npm start

# Platform targets
npm run android
npm run ios
npm run web

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Architecture

**Routing**: File-based via Expo Router v7. Screens live under `app/`:
- `(auth)/` — Login
- `(app)/` — Main app with bottom tab navigation

**Offline-first**: Expo SQLite stores two tables:
- `offline_drafts` — receipts created while offline (`synced: 0/1`)
- `cached_customers` — customer list for offline lookup

**Sync**: TanStack React Query + NetInfo detects connectivity changes. On reconnect, unsynced drafts are batch-submitted to `POST /documents/sync`.

**Key files**:
- `lib/api.ts` — HTTP client (injects Bearer token from AsyncStorage)
- `lib/db.ts` — SQLite operations (drafts + customer cache)
- `lib/sync.ts` — Offline/online sync logic

**Styling**: NativeWind v4 (Tailwind CSS for React Native). Theme defined in `tailwind.config.js`.

**Localization**: i18next with EN/AR translations in `src/locales/`. Arabic triggers RTL layout.

**API URL**: Set via `EXPO_PUBLIC_API_URL` env var. Default `http://10.0.2.2/api` for Android emulator (routes to host machine localhost).

## Data Model Highlights

- `documents.type`: `380` = Receipt, `381` = Credit Note
- `documents.parent_id`: self-referencing FK for credit notes
- `documents.status`: `draft` → `synced` → `archived`
- UAE emirates stored as enum: `AUH`, `DXB`, `SHJ`, `AJM`, `UAQ`, `RAK`, `FUJ`
- `tenants.trn` (15-digit UAE Tax Registration), `tenants.tin` (10-digit)
- Evidence photo path and GPS coordinates stored on each document
