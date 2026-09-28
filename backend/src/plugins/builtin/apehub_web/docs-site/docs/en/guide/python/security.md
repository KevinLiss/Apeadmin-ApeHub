---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '30db939c-1f82-4d84-82bd-709b30295e26'
  PropagateID: '30db939c-1f82-4d84-82bd-709b30295e26'
  ReservedCode1: '61f552d5-dd1f-4dda-9282-719a8a2e67bc'
  ReservedCode2: '61f552d5-dd1f-4dda-9282-719a8a2e67bc'
---

# Security & Permissions

## Four-Layer Permission Model

| Layer | Typical scenario | Implementation |
| --- | --- | --- |
| No login | Website home, marketplace list | No auth dependency injected |
| Login required | Profile, my orders | `Depends(get_current_user)` |
| Rule-based auth | User, role, plugin management | `require_permission("...")` |
| Data scope | Access only own plugins or data | Service layer filters by `user_id` |

The frontend `v-permission` directive only hides buttons — it cannot replace backend permission checks. Plugin admin APIs must re-validate permissions and resource ownership on the server.

## Key Storage

SMTP authorization codes, DeepSeek API keys and LemPay merchant keys are stored using ApeAdmin's core encryption capability. Admin APIs only return a "configured" status, never the plaintext. In production, write keys through controlled configuration; never put keys inside plugin ZIPs, logs, Markdown docs or frontend code.

## Uploaded Package Checks

Plugin ZIPs are not extracted into the running directory during analysis, and Python/JavaScript inside them is never executed. The platform checks:

- Path traversal, absolute paths and symbolic links
- Encrypted files, file count, total extracted size and abnormal compression ratios
- Required `plugin.json` fields and version consistency
- Dynamic code execution, system commands, outbound network requests and suspected hard-coded keys

Static checks and AI analysis only provide review-support information; the final go-live decision must be made by an admin after review and publishing.

## Website Content

Navigation links only allow controlled in-site paths or explicitly permitted HTTPS addresses. User-submitted Markdown, images, demo links and plugin docs must pass format validation and HTML sanitization before being shown publicly.