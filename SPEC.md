# Aesthetics Laser Cost & ROI Calculator — Full-Feature Product Spec

## 1) Purpose & Users

* **Who:** Practice owners, med spa operators, dermatologists, plastic surgeons; sales reps; finance partners.
* **Why:** Model *total cost of ownership (TCO)* and *return on investment (ROI)* for purchasing or financing an aesthetics laser; compare devices/scenarios; generate a clean proposal/PDF.

---

## 2) Core Outcomes (what the tool must produce)

* **Per-treatment unit economics:** revenue, variable cost, gross margin.
* **Monthly/annual P\&L:** revenue, COGS, opex, EBITDA.
* **Financing analytics:** payment schedule, total interest, payoff date.
* **Breakeven:** # treatments/day & days/month to cover costs.
* **Cash metrics:** monthly cash flow, cumulative cash, payback period.
* **Investment metrics (optional advanced):** NPV, IRR, MIRR, DSCR.
* **Sensitivity analysis:** sliders for price, volume, show tornado chart.
* **Scenario compare:** up to 3 side-by-side devices/models.
* **Sales asset:** branded PDF/URL proposal with assumptions & charts.

---

## 3) Inputs (grouped)

### A) Device & Acquisition

* **Device MSRP** (USD)
* **Discount/Rebate** (% or \$)
* **Accessories/Options** (multi-select with cost)
* **Shipping/Install/Training** (\$)
* **Warranty (yrs)**, **Extended Warranty cost/yr**
* **Depreciation method** (MACRS/straight-line), **life (yrs)**, **salvage value**
* **Section 179/bonus depreciation** (toggle + tax rate)

### B) Financing / Lease

* **Purchase method:** Cash | Term Loan | Lease (FMV/Capital) | 0% promo
* **Down payment** (\$ or %)
* **Amount financed** (auto)
* **APR / Money factor**
* **Term (months)**
* **Payment frequency** (monthly/quarterly)
* **Balloon/Residual** (\$ or %)
* **Origination/doc fees**
* **Deferred/no-pay promo months** (0, 3, 6 etc.)
* **Prepayment option** (yes/no; penalty %)
* **Include sales tax in financing** (toggle + local tax rate)

### C) Utilization & Capacity

* **Open days/month**
* **Treatments/day** (avg) + **utilization ramp** (month 1-6 ramp curve %)
* **No-show rate** (%)
* **Avg treatment time** (min) → capacity check (optional)
* **Seasonality** (12-point % index)

### D) Pricing & Revenue

* **List price / treatment** (\$)
* **Discounts/promos** (%)
* **Packages** (# sessions, price, attach rate %)
* **Membership plan** (MRR, % of patients)
* **Upsells/cross-sells** (avg \$ per tx, attach rate %)

### E) Variable Costs (per treatment)

* **Consumables** (\$)
* **Disposables** (\$)
* **Clinical time cost** (\$/hr for provider; auto per tx by minutes)
* **Room time overhead** (\$/hr; rent, utilities share)
* **Payment processing fee** (% + \$)

### F) Fixed Opex (monthly)

* **Marketing budget** (\$) + **CAC expectations** (optional)
* **Staff salary allocation** (\$)
* **Rent allocation** (\$)
* **Insurance** (\$)
* **Software/EMR/booking** (\$)
* **Maintenance (post-warranty)** (\$/mo)
* **Calibration/Service contracts** (\$)
* **Downtime reserve** (% revenue haircut)

### G) Tax & Accounting

* **Effective tax rate** (%)
* **State/local taxes** (%)
* **Accounting basis:** cash vs accrual (for charts)

### H) Risk & Compliance

* **Chargeback/fraud reserve** (% revenue)
* **Refund policy reserve** (%)
* **Compliance checklist acknowledgment** (toggle for disclaimers)

### I) Presets / Device Library (admin-managed)

* Preload common devices with MSRP, accessories, consumables, typical session time, warranty norms. User can clone & edit.

---

## 4) Calculations (key formulas)

### Loan/Lease Payment

* **PMT (loan):**
  `payment = r * PV / (1 - (1 + r)^(-n))`
  where `r = APR/12`, `PV = amount_financed`, `n = term_months`.
* **Lease FMV:** treat as payment series; residual paid at end if buyout.

### Depreciation & Tax Shield

* **Straight-line:** `(CapEx - salvage)/life_years` per year.
* **Tax shield:** `depreciation * tax_rate`.
* **Sec 179/Bonus:** deduct allowable amount in year 1; apply to cash taxes.

### Unit Economics

* **Net price per tx:** `list_price * (1 - discount)` + upsell revenue.
* **Variable cost per tx:** consumables + provider time + room time + processing fee.
* **Gross margin per tx:** `net_price - variable_cost`.

### Volume & Revenue

* **Monthly txs:** `open_days * treatments/day * (1 - no_show) * seasonality_idx`.
* **Monthly revenue:** `txs * net_price + membership MRR`.

### P\&L (monthly)

* **Gross profit:** `revenue - (variable_cost_per_tx * txs)`.
* **EBITDA:** `gross_profit - fixed_opex - maintenance - marketing`.
* **EBIT:** `EBITDA - depreciation/12`.
* **Net income (approx):** `EBIT * (1 - tax_rate)` (adjust for interest below).

### Financing & Cash Flow

* **Interest portion (month t):** `balance_prev * r`.
* **Principal:** `payment - interest`.
* **After-tax cash flow:**
  `EBITDA - cash_taxes +/- financing (−payment if loan; lease treated as opex) − CapEx (month 0)`.
* **Payback:** first month cumulative cash ≥ 0.
* **NPV:** `Σ (CF_t / (1 + d)^t) - initial_capex` (choose discount rate d).
* **IRR:** solve for d where NPV=0.
* **Breakeven (treatments/month):**
  `(fixed_costs + financing_payment) / gross_margin_per_tx`.
* **Breakeven (treatments/day):** divide by open\_days.

---

## 5) UX / UI

### Layout

* **Left panel:** Inputs (grouped, collapsible).
* **Right panel:** KPIs & charts update live.
* **Top bar:** Device selector (preset), Scenario A/B/C tabs, Currency/Locale.

### KPI Cards (always visible)

* Monthly Payment • Monthly Revenue • Monthly EBITDA • Breakeven tx/day • Payback (months) • NPV/IRR (toggle advanced) • DSCR

### Charts

* **Cash flow over time (24–60 months)**
* **Cumulative cash (payback point marker)**
* **Revenue vs cost stacked columns (monthly)**
* **Sensitivity tornado:** price, volume, APR, consumables, marketing
* **Seasonality line (optional)**

### Actions

* **Export:** PDF (branded), CSV of assumptions, sharable link.
* **Compare:** side-by-side view & PDF of A/B/C.
* **Reset to preset / Save scenario.**

### Guardrails & Helpers

* Tooltips with defaults (“Typical consumables: \$X/tx”).
* Warnings for impossible inputs (utilization > capacity; term > warranty).
* “Reality check” banner if breakeven > capacity cap.

---

## 6) Admin (Back-office)

* **Device library CMS:** add/edit devices, default assumptions, images.
* **Preset packs:** e.g., “Laser Hair Removal,” “Pigmentation,” etc.
* **Finance providers:** APR tables by credit tier; promo programs.
* **Branding:** logo, colors, legal text, footers.
* **Role-based access:** sales (view/share), admin (edit presets), owner (pricing toggles).

---

## 7) Integrations (optional, phased)

* **Calendar/Capacity:** read clinic hours to validate utilization.
* **ATS/CRM lead capture:** push PDF + assumptions into Salesforce/HubSpot.
* **Payments:** generate financing application with preferred lenders.
* **Analytics:** GA4/Plausible; event tracking for exports, scenario counts.
* **Pricing API:** region-based MSRP or currency conversion.

---

## 8) Compliance & Legal

* **Disclaimers:** “For illustrative purposes only; not financial, tax, or legal advice.”
* **Tax assumptions configurable**; clearly show when Sec 179/Bonus applied.
* **PCI/Fraud note:** no card data in tool; if quoting online payments, show processing fee assumptions only.
* **Privacy:** inputs can be saved only with explicit user opt-in; encrypt at rest.

---

## 9) Performance & Quality

* **Lighthouse 95+**; mobile-first.
* **Autosave** to local storage; optional account save to cloud.
* **Unit tests** for financial functions (PMT, NPV/IRR, breakeven).
* **Locale/Currency** (USD, CAD, EUR; number/date formats).

---

## 10) Example Output (what a PDF shows)

* Practice name, contact, date.
* Device & acquisition summary (cash vs finance).
* Monthly P\&L table (12/24 months).
* KPIs: payment, breakeven tx/day, payback, NPV/IRR.
* Charts: cash flow, cumulative cash.
* Assumptions appendix (all inputs).
* Signature line (buyer acknowledgement) \[optional].

---

## 11) Pseudocode (key functions)

// Loan payment

```
PMT(apr, termMonths, principal) {
  r = apr/12
  return r*principal / (1 - (1+r)^(-termMonths))
}
```

// Monthly schedule (loop months 1..n)

```
for t in 1..term:
  interest = balance * (apr/12)
  principal = payment - interest
  balance -= principal
```

// Breakeven (tx per month)

```
breakevenTx = (fixedCosts + financePayment) / grossMarginPerTx
breakevenPerDay = breakevenTx / openDays
```

// Cash flow & payback

```
cash[t] = EBITDA[t] - cashTaxes[t] - (lease? leasePayment : 0) - (loan? payment : 0)
cumCash[t] = cumCash[t-1] + cash[t]
paybackMonth = first t where cumCash[t] >= 0
```

// NPV

```
NPV = sum( CF[t] / (1+discRate)^(t/12) ) - initialCapex
```

---

## 12) Roadmap (phased)

* **v1 (2–3 weeks):** Single device scenario; cash/loan; unit econ; breakeven; payback; monthly charts; PDF export.
* **v1.5:** Lease support (FMV/Capital), residuals, promos, seasonal ramp, sensitivity sliders.
* **v2:** Scenario A/B/C compare, NPV/IRR, DSCR, device library CMS, presets, finance provider integrations.
* **v3:** User accounts, sharable links, CRM push, multi-currency, localized tax modules.

---

## 13) Messaging Hooks (for Scott/reps)

* “**How many treatments/day to break even?** See it instantly.”
* “**From price to payback**: one screen, no spreadsheets.”
* “**Finance it smart**: compare cash vs. loan vs. lease in seconds.”
* “**Risk-aware**: fraud/chargeback reserves & downtime modeled.”

---

If you want, I can turn this spec into a **clickable Figma wireframe** or a **Next.js starter** with the core math (PMT, breakeven, cash flow) pre-wired and a sample device preset so you can demo it to prospects.
