# VoltMaster-Pro: Product Specification
**AI-Powered Job Management & Estimating for Independent Electricians**

## Overview

**What:** Job management platform with AI photo estimating + EV charger analysis  
**Who:** Solo electricians & 2-5 person shops (5-20 jobs/month, $300K-$1.5M revenue)  
**Value:** Photos → accurate quotes in <2 minutes (vs 30-60 min manually)  
**Price:** $79/mo base, +$20/mo EV module (20% off annual)  
**Edge:** Only sub-$100 tool with AI takeoff + NEC calcs + full workflow

**Status (Jan 21, 2026):** Working prototype complete. Ready for production build (3-4 weeks to launch).

---

## Tech Stack & Architecture

**Frontend:** Next.js 14, React, Tailwind, shadcn/ui  
**Backend:** Supabase (PostgreSQL, Auth, Storage)  
**AI:** GPT-4o Vision (photo analysis), Claude 3.5 (material lists)  
**Payments:** Stripe | **Deploy:** Vercel | **Mobile:** PWA

### Core Database Tables
- `users` - company profile, rates, subscription
- `customers` - contact info, job history, lifetime value
- `jobs` - status, scope, costs, dates
- `job_photos` - images + AI analysis results
- `materials` - line items (AI-detected or manual)
- `invoices` - payment tracking
- `ev_analysis` - NEC calculations, panel data (premium)
- `material_templates` - reusable job templates

---

## MVP Features (Launch Week 3-4)

### 1. Authentication & Setup
- Email/password signup (Supabase Auth)
- Onboarding: company name, license, labor rate ($85/hr default), markup % (30% default)
- 14-day free trial (no CC)

### 2. Dashboard
- Job cards with filters (All/Quoted/Scheduled/Active/Complete)
- Stats: This Week Revenue, Active Jobs, Pending Quotes
- Search/sort by customer, date, value

### 3. AI Photo Estimating (Core Workflow)
**5-step job creation:**
1. Select/add customer
2. Choose job type (Residential/Panel Upgrade/EV/Commercial)
3. Upload photos (up to 10) → AI analyzes panels, wire runs, fixtures
4. Review/edit AI-generated material list (Item | Qty | Cost | Total)
5. Add scope of work → Generate quote PDF

**AI Pipeline:** Photos → GPT-4o Vision → Structured output with confidence scores → Editable table → Quote

### 4. Job Management
- Job detail page with tabs: Overview, Materials, Photos, Invoice
- Status workflow: Quoted → Scheduled → In Progress → Complete
- Actions: Schedule, edit, mark complete, create invoice

### 5. Calendar & Scheduling
- Week view (Mon-Sun), color-coded by status
- Drag-and-drop job blocks
- Click date to schedule appointment

### 6. Invoice & Payments
- Auto-populated from quote
- Status: Draft → Sent → Viewed → Paid (+ Overdue)
- Track payments (Cash/Check/Card/Zelle), partial payments
- PDF download, email/SMS delivery

### 7. Customer Management
- List with search, sort (recent/A-Z/spend)
- Customer detail: contact info, job history, outstanding invoices

### 8. Settings
- Company profile (logo for quotes/invoices)
- Pricing defaults (labor rate, markup, job multipliers)
- Subscription management

---

## EV Charger Module (+$20/mo)

**Triggered on EV job type. Adds:**
- Panel photo analysis (extracts capacity: 100A/200A/400A, existing breakers)
- NEC 220.57 load calculation (lighting, appliances, EV @ 125% continuous)
- Visual capacity gauge (color-coded: Green >20% headroom, Yellow 5-20%, Red <5%)
- Auto-recommendations: breaker size, wire gauge, panel upgrade if needed
- Materials auto-added to quote with adjusted labor hours

---

## Post-MVP Features

**Phase 2 (Week 5-6):**
- Material price database & templates
- Smart recommendations (historical pricing, profitability tracking)
- Customer communication (SMS/email reminders, quote approval workflow)
- Reporting dashboard (revenue charts, job metrics, customer LTV)

**Phase 3 (Week 7-10):**
- Advanced EV (smart panels, multi-charger, commercial)
- Team management (multi-user, roles, time tracking)
- Integrations (QuickBooks, Google Calendar, parts suppliers)
- Native mobile app (React Native)

---

## Implementation Timeline

**With working prototype in hand:**

- **Week 1:** Supabase setup + port React to Next.js 14
- **Week 2:** AI integration (GPT-4o Vision → material lists → PDFs)
- **Week 3:** Invoice/payment + calendar + settings
- **Week 4:** EV module (NEC calcs) + mobile polish
- **Week 5:** Stripe + onboarding + beta invites

**Launch:** Week 3-4 (3-4 weeks total vs original 4-5 weeks from scratch)

*Prototype delivers 60% time savings. Focus areas: backend, AI pipeline, payments.*

---

## Go-to-Market

**Pre-Launch (Week 0):**
- Landing page + demo video → 100 beta signups
- Wizard of Oz test with 5 electricians @ $49 (validate 3x/week usage + renewal)

**Beta Launch (Week 5):**
- 25 customers @ $59/mo founding member pricing
- Channels: ElectricianTalk forum, YouTube (Electrician U), EVITP network, supply houses

**Public Launch (Week 8):**
- 14-day free trial (no CC)
- $79/mo base, $99/mo with EV (20% off annual)
- Launch promo: First 100 get $59/mo forever
- Referral: Give $20, get $20

**Growth Targets:**
- Month 1-3: 50 customers = $3,950 MRR
- Month 4-6: 200 customers = $17,000 MRR
- Month 7-12: 500 customers = $51,000 MRR ($612K ARR)

**Key Metrics:** 70% activation in 24hr, 60% DAU/MAU, 80% M2 retention, 10+ quotes/customer/mo

---

## Competitive Edge

| | VoltMaster | ServiceTitan | Jobber | Kopperfield |
|---|---|---|---|---|
| **Price** | $79-99 | $200-500 | $39-99 | Free |
| **AI Estimating** | ✅ | ❌ | ❌ | ❌ |
| **NEC Calcs** | ✅ | ❌ | ❌ | ✅ |
| **Full Workflow** | ✅ | ✅ | ✅ | ❌ |
| **Setup** | <10 min | 2-4 hrs | ~30 min | <5 min |

**vs ServiceTitan:** 1/3 price, 10x faster setup, unique AI estimating  
**vs Jobber:** Electrical-specific (NEC calcs, AI material takeoff)  
**vs Kopperfield:** Full workflow (they only do calculations)

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| **AI Accuracy** | Show confidence scores, all editable, "Report Wrong" feedback loop |
| **Kopperfield** | They're single-purpose; we own full workflow + network effects |
| **Low Adoption** | Wizard of Oz pre-validation, 14-day trial, 50% create 3+ quotes target |
| **Churn** | Weekly usage emails, onboarding sequence, check-ins Day 7/30/60, annual discount |

---

## Success Criteria

**Product:** 70% activate in 24hr | 60% DAU/MAU | 80% M2 retention | $85 ARPU  
**Business:** <$150 CAC | >$2,000 LTV | >13:1 LTV:CAC | <30 days to first revenue  
**Support:** NPS 50+ | <5 tickets per 100 users/mo

---

## Next Steps

1. ✅ Prototype complete (Jan 21, 2026)
2. **Week 1-5:** Production build (Supabase + AI + Stripe)
3. **Week 5:** Beta launch (25 customers)
4. **Week 8:** Public launch
5. **Month 12:** Scale to 500 customers

**Kill Signal:** If Wizard of Oz doesn't convert 3/5 electricians to Month 2, pivot or kill.