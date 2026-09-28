---
layout: home

hero:
  name: ApeHub Technical Docs
  text: ApeAdmin Plugin Development & Publishing Guide
  tagline: Both Python (FastAPI) and Go (Gin) frameworks — from the core platform to plugin development, marketplace review and USDT settlement.
  actions:
    - theme: brand
      text: Python Docs
      link: /en/guide/python/overview
    - theme: alt
      text: Go Docs
      link: /en/guide/go/overview
    - theme: alt
      text: Plugin Submission
      link: /en/marketplace/submission

features:
  - title: Python (FastAPI) Core
    details: Typed APIs, SQLAlchemy 2.0 async data layer and a unified error boundary.
  - title: Go (Gin) Core
    details: Single-binary deployment, GORM data access, native high concurrency and MCP gateway integration.
  - title: Full Plugin Lifecycle
    details: Draft, static checks, AI docs, review, publish, unpublish and version history.
  - title: USDT Earnings Settlement
    details: Payment signature verification, refund protection window, pending earnings and manual TRC20 payouts.
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '72ba9d67-8259-46a2-8067-5eecbf7bd75a'
  PropagateID: '72ba9d67-8259-46a2-8067-5eecbf7bd75a'
  ReservedCode1: '3a1ce877-c456-42e7-a3cc-c4f56ffe5738'
  ReservedCode2: '3a1ce877-c456-42e7-a3cc-c4f56ffe5738'
---

## Quick Start

Pick your core version and read in order:

1. **Platform Overview**: understand the runtime boundaries and key principles.
2. **Local Run**: start the backend and admin panel.
3. **API Conventions**: unified response format and authentication.
4. **Plugin Lifecycle**: create your first plugin.
5. **Security & Permissions**: must-read before going live.

> Before developing a plugin, read "Marketplace → Submission & AI Analysis" to understand package structure, static checks and the review flow.

## Documentation Map

| Scenario | Recommended Docs |
| --- | --- |
| New to the platform | Python / Go "Platform Overview" |
| Run locally | "Local Run" |
| Build your first plugin | "Plugin Lifecycle" |
| Write plugin APIs | "API Conventions" |
| Troubleshoot production | "Operations & Troubleshooting" |
| Publish a plugin | "Submission & AI Analysis", "Versions & Review" |
| Configure earnings & withdrawals | "USDT Payment & Settlement" |

## FAQ

**Q: What's the difference between the Python and Go editions?**

Features and the plugin model are identical; the difference is the tech stack: the Python edition is built on FastAPI + SQLAlchemy 2.0, while the Go edition is built on Gin + GORM. Plugin packages differ in format and cannot be shared across editions.

**Q: Does a plugin go live automatically after review approval?**

No. After approval, an admin must explicitly "Publish" the version before it appears in the public marketplace.

**Q: Can AI analysis replace human review?**

No. AI analysis generates docs and risk hints to support review only; the final go-live decision is made by an admin after review and publishing.

**Q: Does one purchase cover future versions?**

Yes. A single purchase creates a permanent entitlement — you can download all current and future published versions. Refunds revoke the entitlement.