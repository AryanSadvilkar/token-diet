import { RagPreset } from '../types';

export const RAG_PRESETS: RagPreset[] = [
  {
    id: 'cloud-sla',
    title: 'Enterprise Cloud SLA & Security Terms',
    badge: 'Legal / Ops',
    query: 'What is the minimum uptime commitment and credit policy for P1 outages?',
    description: 'Multi-tiered infrastructure service level agreement with indemnity and credit formulas.',
    rawText: `This Master Cloud Service Level Agreement ("SLA") is entered into by and between CloudMatrix Global Inc. ("Provider") and the customer entity executing an applicable Order Form ("Subscriber"). Provider warrants that the Production Cloud Cluster will achieve a Monthly Uptime Percentage of not less than 99.95% during any calendar month billing cycle. 

For the purposes of this SLA, "Downtime" is defined as any continuous period exceeding fifteen (15) consecutive minutes during which Subscriber's primary production API endpoints return HTTP 500 or 503 error codes for more than 50% of validly authenticated incoming REST queries. Downtime explicitly excludes scheduled maintenance windows announced at least seventy-two (72) hours in advance, emergency security patches not exceeding ninety (90) minutes in duration per calendar quarter, Force Majeure events, denial of service attacks, Subscriber misconfiguration, and third-party internet transit failures outside Provider's border gateway BGP boundary.

In the event Provider fails to meet the 99.95% Monthly Uptime Percentage commitment for a Severity 1 (P1) catastrophic outage, Subscriber's sole and exclusive remedy shall be the issuance of Service Credits calculated as follows: (a) 10% credit for Monthly Uptime between 99.0% and 99.94%; (b) 25% credit for Monthly Uptime between 95.0% and 98.99%; and (c) 50% credit for Monthly Uptime falling below 95.00%. Service credits must be claimed in writing via a support ticket within thirty (30) calendar days following the affected billing month.`,
  },
  {
    id: 'clinical-study',
    title: 'Clinical Pharmacology & Efficacy Study',
    badge: 'Biotech / Medical',
    query: 'What was the mean reduction in HbA1c and most common adverse event?',
    description: 'Phase 3 randomized, double-blind clinical trial evaluating GLP-1 receptor agonist outcomes.',
    rawText: `In this randomized, double-blind, placebo-controlled Phase 3 multi-center trial (ClinicalTrials.gov Identifier: NCT05481920), a total of 1,842 adult patients with inadequately controlled type 2 diabetes mellitus (baseline glycated hemoglobin [HbA1c] 8.4% ± 0.9%, mean body mass index [BMI] 33.8 ± 4.2 kg/m², mean age 56.4 years) were randomized 1:1:1 to receive once-weekly subcutaneous injections of Investigational Compound DX-402 at doses of 5.0 mg (n=614), 10.0 mg (n=614), or matching volume-adjusted saline placebo (n=614) over a 40-week treatment period.

The primary composite efficacy endpoint was the mean change in baseline HbA1c at week 40 analyzed via intention-to-treat ANCOVA models. At week 40, patients in the 10.0 mg DX-402 cohort achieved a statistically significant mean reduction in HbA1c of -2.14% (95% CI: -2.31 to -1.97; p < 0.001) compared to -0.22% in the placebo cohort. Secondary endpoints demonstrated a mean body weight reduction of -9.8 kg (-10.4%) in the active 10.0 mg arm versus -1.1 kg (-1.2%) for placebo (p < 0.001).

Treatment-emergent adverse events (TEAEs) were documented in 68.4% of DX-402 patients and 48.2% of placebo patients. The most frequently observed adverse events were mild-to-moderate gastrointestinal disturbances, predominantly transient nausea (31.2% in DX-402 vs 8.4% in placebo) and diarrhea (18.6% vs 7.1%), with peak incidence occurring during initial dose-escalation weeks 1 through 8. Discontinuation due to adverse events was 4.2% in the active group.`,
  },
  {
    id: 'financial-10q',
    title: 'Q3 10-Q Financial Filing & Guidance',
    badge: 'Finance / SEC',
    query: 'What was the Q3 gross margin and fiscal year ARR growth projection?',
    description: 'Quarterly financial performance report covering revenue growth, margins, and operating expenses.',
    rawText: `ApexLogic Enterprise Systems Inc. (NASDAQ: APLX) reports condensed consolidated financial results for the third fiscal quarter ended September 30, 2025. Total revenue for the third quarter was $428.6 million, representing an increase of 26.4% year-over-year compared to $339.1 million reported in the third quarter of fiscal 2024. Subscription software revenue grew 31.8% to $384.2 million, accounting for 89.6% of total quarterly revenue. Annual Recurring Revenue (ARR) reached $1.58 billion at quarter-end, up 29.1% year-over-year.

GAAP Gross Profit for the quarter was $318.4 million, yielding a GAAP Gross Margin of 74.3%, compared to 71.8% in the prior-year period. Non-GAAP Gross Margin, which excludes $14.2 million in stock-based compensation and $3.8 million in acquired intangible amortization, reached 78.5%. Operating expenses for the quarter were $254.1 million (59.3% of revenue), consisting of $112.5 million in Research & Development, $106.8 million in Sales & Marketing, and $34.8 million in General & Administrative costs.

Cash and cash equivalents plus marketable securities totaled $842.1 million with zero long-term funded debt obligations. Free cash flow for the quarter stood at $96.4 million (22.5% free cash flow margin). For the full fiscal year 2025, management is raising full-year revenue guidance to between $1.685 billion and $1.700 billion, representing targeted annual revenue growth of 24.0% to 25.1%, with full-year Non-GAAP operating margin projected at 18.5% to 19.5%.`,
  },
];
