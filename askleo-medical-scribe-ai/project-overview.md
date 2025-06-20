# Project Overview – "Askleo"

Askleo is a real‑time, medical‑grade writing assistant that brings Grammarly‑class UX to clinical documentation. Built with **Lovable.dev** on the front‑end and **Supabase** for auth/data, it leverages **OpenAI GPT‑4.1 nano** for domain‑tuned spelling, grammar, and style suggestions in SOAP notes, EHR entries, and research manuscripts. HIPAA‑level privacy, medical‑specific terminology, and sub‑200 ms latency are first‑class requirements.

---

## Objectives

| Priority | Goal | KPI |
|----------|------|-----|
| P0 | Accurate, real‑time spell/grammar corrections for medical text | ≥ 97 % spelling, ≥ 92 % grammar on clinical test set |
| P0 | HIPAA‑compliant data handling | Signed BAA; all PHI encrypted at rest/in transit |
| P1 | Domain‑aware style tips (SOAP structure, research tone) | User CSAT ≥ 4.5/5 |
| P1 | <200 ms suggestion latency (95th pct) | New Relic trace dashboards |
| P2 | Telemetry‑driven continual improvement loop | Weekly model eval report |

---

## Phased Roadmap

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| **0 Bootstrap (Week 1)** | Repo + CI/CD scaffolding | Monorepo, TurboRepo, GitHub Actions |
| **1 Auth & DB (W2‑3)** | Supabase email/OAuth, RLS policies, schema (`profiles`, `documents`, `suggestions`, `events`) |
| **2 Language API (W4‑5)** | Fastify WebSocket `/suggest` → GPT‑4.1 nano streaming; <200 ms p95 |
| **3 Front‑end MVP (W6‑7)** | Lovable editor, inline underlines, accept/reject cards, local cache |
| **4 Domain Tuning (W8‑9)** | Clinical corpus prompt engineering, accuracy ramp‑up |
| **5 Beta + Compliance (W10‑12)** | 25‑clinician beta, HIPAA checklist, pen‑test, feedback loop |

---

## Core Feature Set

- **Real‑time spell & grammar checking** (GPT‑4.1 nano; medical prompt)  
- **SOAP‑aware shortcuts** (`/soap:` → prefill Subjective/Object/Assessment/Plan)  
- **Research‑style recommendations** (passive voice, citation insertion)  
- **User authentication & document storage** (Supabase)  
- **Latency budget**: WebSocket diff batching, client‑side caching, edge‑deployed API

---

## Technical Pillars

| Layer | Stack | Why |
|-------|-------|-----|
| Front‑end | Next.js 15 + Lovable + TypeScript | AI‑assisted UI, RSC performance |
| Backend | Fastify (Node 20) on Fly.io | Low‑latency WebSocket, edge‑close |
| Data | Supabase Postgres + pgvector | RLS, embeddings for context |
| AI Engine | OpenAI GPT‑4.1 nano | Cost‑effective, 128k context |
| DevOps | Vercel (FE) + Fly (API) + GitHub Actions | Simple, scalable |
| Observability | Sentry, Grafana Loki, New Relic | Error + perf tracing |

---

## Success Criteria

1. **Clinical accuracy** meets or beats in‑house baseline.  
2. **Latency** <200 ms for 95 % of suggestions.  
3. **Compliance** – signed BAA, SOC 2‑ready controls.  
4. **User NPS** ≥ 45 by end of beta.

---

## Next Steps

Begin **Phase 0**:  
* scaffold monorepo (`pnpm`, TurboRepo)  
* set up GitHub Actions (lint, test)  
* create Supabase project & commit config  
* push initial empty Next.js and Fastify apps

Once Phase 0 passes CI on `main`, move to Auth & DB design (Phase 1).