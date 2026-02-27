# SaaS Architecture Examples

Here are realistic examples of how to use this skill:

---

## Example 1: Multi-Tenant SaaS — Customer Support Tool

**Product:** Help desk for SMBs (10-50 agents per customer)

**Domain Modules:**
1. **Tenant** — Multi-tenant isolation, billing, plan limits
2. **User** — Auth, roles, permissions, invitations
3. **Ticket** — Creation, assignment, status, SLA tracking
4. **Conversation** — Messages, attachments, internal notes
5. **KnowledgeBase** — Articles, categories, search

**Data Ownership:**
- Tenant module owns Tenant record (plan, status)
- Ticket module owns Ticket, Conversation
- User module owns User, Role, Permission

**Frontend/Backend Split:**
- Next.js for dashboard (agent workspace)
- API-first for mobile + future public API

**Evolution:**
- v1: Single-region, basic multi-tenancy, PostgreSQL
- v2: Read replicas, caching with Redis, webhooks
- v3: Multi-region, event sourcing, marketplace

---

## Example 2: Developer Tool — CI/CD Pipeline Runner

**Product:** Managed CI/CD for teams wanting self-hosted runners

**Domain Modules:**
1. **Project** — Repos, settings, webhooks
2. **Pipeline** — Build configs, triggers, logs
3. **Runner** — Agent registration, heartbeats, job execution
4. **Artifact** — Storage, retrieval, retention
5. **Integration** — GitHub/GitLab/Bitbucket OAuth

**Data Ownership:**
- Project owns repo connections
- Pipeline owns build history, logs
- Runner owns agent state, job queue

**Key Architectural Decisions:**
- **Database:** PostgreSQL (relational data fits well)
- **Queue:** Redis (job queue for runners)
- **File Storage:** S3 (artifacts, logs)
- **Auth:** External OAuth only (no local passwords)

**Scaling Path:**
- v1: Single runner, local job queue
- v2: Distributed runners, message queue (RabbitMQ)
- v3: Multi-cloud, custom executor plugins

---

## Example 3: Consumer App — AI Writing Assistant

**Product:** Browser extension + web app for content generation

**Domain Modules:**
1. **User** — Auth, subscription, preferences
2. **Content** — Documents, drafts, versions
3. **Generation** — Prompt templates, AI API orchestration
4. **Billing** — Usage tracking, plan limits, invoices

**Frontend/Backend:**
- **Frontend:** Next.js (web) + React (extension)
- **Backend:** FastAPI (Python for AI integration)
- **Mobile:** Future (API-first from day 1)

**Build vs. Buy:**
- Build: Core AI generation, content storage
- Buy: Auth (Clerk), Payments (Stripe), Email (Resend), AI (OpenAI/Anthropic)

**Evolution:**
- v1: Browser extension + basic generation
- v2: Web app, templates, team features
- v3: API for third-party integrations
