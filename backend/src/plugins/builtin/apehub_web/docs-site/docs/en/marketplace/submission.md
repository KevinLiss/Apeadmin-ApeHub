---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '7a619a27-5b27-42b5-a4f2-ac2f739ec1cf'
  PropagateID: '7a619a27-5b27-42b5-a4f2-ac2f739ec1cf'
  ReservedCode1: '206c41e9-54c6-4e6f-a770-8d4249398c4b'
  ReservedCode2: '206c41e9-54c6-4e6f-a770-8d4249398c4b'
---

# Submission & AI Analysis

## Submission Data

Developers create a plugin draft in the website <a href="/apehub-web/profile.html">profile center</a>, filling in the plugin identifier, display name, description, category, tags, USDT pricing, logo, carousel images and demo info. Creating a plugin only produces a draft — it does not appear in the marketplace immediately.

## Version Workbench

Each plugin can maintain multiple versions. When uploading a ZIP, the platform validates the package structure, file sizes, `plugin.json` and the version number; only one current package is kept per version. Docs, changelogs and compatibility info belong to the version, not to the global plugin profile.

## AI Technical Docs

After the package is uploaded, static checks run first; then DeepSeek generates Markdown from the file tree and source summary. The generated output is only written to the current version draft, and the developer can edit it manually before submitting for review.

AI analysis is not an auto-approval gate: admins still need to review risk hints, source files, permission requirements and version docs.

::: warning
Never put API keys, passwords, tokens, private keys, production database connection strings or personal data into a plugin package.
:::

## Submission Flow

```text
Create plugin → Create version → Upload package → Static check
                              ↓
                    AI generates docs (retryable)
                              ↓
                    Polish manually → Submit for review
```

After review approval, an admin must still explicitly "Publish" the version to make it appear in the public marketplace.