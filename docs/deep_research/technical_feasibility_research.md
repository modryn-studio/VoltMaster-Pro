## Research Summary

### 1. QuickBooks API - ✅ FULLY VIABLE

**What works:**
- OAuth 2.0 authentication (standard flow)
- Create/update invoices programmatically
- Bidirectional customer/job sync
- Payment tracking
- Project-based invoicing (recently added)
- Well-documented SDKs (JavaScript, Python, PHP)

**The sync problem competitors face:**
- **Corecon**: "Many users have had trouble accurately syncing to QuickBooks"
- **Root cause**: Real-time sync conflicts, data mapping errors, improper error handling
- **Your advantage**: Build it right from day 1 with proper webhook handling and retry logic

**Key insight from research:**
> "The longer invoices sit, the longer you wait to get paid. Direct integration means job details move automatically from field into books."

ServiceTitan and Housecall Pro both successfully sync with QuickBooks - it's **solved problem IF implemented correctly**.

---

### 2. Offline-first PWA - ✅ VIABLE BUT NEEDS SYNC STRATEGY

**What I meant:**
- Not "can PWAs work offline?" (yes, they can)
- But: **How do you handle conflicts when tech schedules job offline while office also schedules?**

**Architecture needs:**
- IndexedDB for local storage
- Service Workers for offline operation
- Queue-based sync when connection returns
- Conflict resolution strategy (last-write-wins vs merge)

**Validated need from research:**
> "Whether you're in a basement or out in the field, you'll still get fast, accurate results"
> "Offline functionality" appears in top feature requests

This is a **competitive advantage** if you nail it - competitors struggle here.

---

### 3. Stripe Payments - ✅ MULTIPLE OPTIONS

**Three approaches for on-site payment:**

**A) Stripe Terminal (physical readers):**
- BBPOS WisePOS E ($299) or Stripe Reader S700
- WiFi/LAN connected
- Works with JavaScript/iOS/Android SDKs
- Requires field service integration architecture

**B) Tap to Pay (no hardware):**
- Uses Android phone/iPhone as card reader
- +10¢ per transaction vs Terminal
- Simpler for solo contractors

**C) Payment Links (simplest MVP):**
- Text customer a Stripe payment link
- No hardware needed
- Customer pays from their phone
- **Recommend starting here** for MVP

**My recommendation:** Start with Payment Links for MVP, add Tap to Pay in v2, Terminal in v3 for larger shops.

---

### 4. NEC Calculation Libraries - ⚠️ **NO OPEN SOURCE FOUND**

**Bad news:** No ready-made npm/pip packages for NEC calculations

**What exists:**
- Proprietary tools: Elite Software E-Tools, Southwire calculators
- Web calculators: Multiple sites have NEC-compliant calculators
- **Key finding:** Tables are from NEC Chapter 9 (public domain)

**Your options:**

**Option A - Build from scratch:**
- Use NEC Chapter 9 tables (voltage drop, conduit fill, wire sizing)
- Implement formulas yourself
- 2-3 days work for core calculations
- **Becomes your IP and competitive moat**

**Option B - Partner/license:**
- Southwire has calculator APIs (might license)
- Elite Software has calculation engine

**Option C - Web scraping/iframe (risky):**
- Embed existing calculators
- Legal/reliability issues

**My recommendation:** Build from scratch using NEC tables. The formulas aren't complex:
- Voltage drop: `VD = 2 × K × I × L / cmil` 
- Conduit fill: Compare wire areas to conduit area %
- Wire sizing: NEC ampacity tables + temperature derating

This becomes a **defensible feature** vs competitors who just embed calculators.

---

### 5. QuickBooks Integration Competitors

**Who has working QB sync:**
- ✅ ServiceTitan (enterprise, $200-500/user/mo)
- ✅ Housecall Pro ($49-109/mo) - "built-in error handling prevents duplications"
- ✅ FieldPulse - "connects jobs directly to QuickBooks"
- ✅ Method:Field Services - "syncs with QuickBooks Online and Desktop"
- ❌ Corecon - "users have had trouble accurately syncing"

**Pattern of success:**
- Webhook-based event listening
- Proper error handling and retry logic
- Two-way sync with conflict resolution
- Real-time vs batch sync (real-time wins)