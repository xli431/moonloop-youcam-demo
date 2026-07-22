# Data Boundaries

## Purpose

YouCam is a runtime experience tool in this public demo. It is not a source of training, research, evaluation, embedding, synthetic-data, or world-model data.

## Prohibited flows

The following material must not enter any training or research pipeline:

- Images submitted to YouCam
- Images generated or modified by YouCam
- Face, skin, body, apparel, or other visual features derived from YouCam
- YouCam result URLs or downloadable assets
- Episodes whose decisions were assisted by YouCam
- Embeddings, annotations, labels, or synthetic examples derived from those materials

YouCam-restricted origins are also blocked from Gemini text inference, Gemini Vision, and every other third-party model endpoint. Gemini may receive a separately constructed text envelope containing only human-authored, human-confirmed, and first-party catalog fields.

## Enforced destination matrix

| Origin | Runtime display | Operational record | Gemini text | Gemini Vision | Training, research, embedding, or world model |
| --- | --- | --- | --- | --- | --- |
| Human-authored or human-confirmed field | Allowed | Allowed | Allowed | Not enabled | Blocked unless recollected under a separate research consent |
| First-party catalog field | Allowed | Allowed | Allowed | Not enabled | Blocked unless separately licensed for training |
| YouCam input | YouCam service only | Blocked | Blocked | Blocked | Blocked |
| YouCam output or derived feature | Allowed temporarily | Blocked | Blocked | Blocked | Blocked |
| YouCam-assisted episode | Operational display only | Restricted record only | Blocked | Blocked | Blocked |
| Licensed training data | Not used in this demo | Not used in this demo | Not used in this demo | Not used in this demo | Allowed by an explicit provenance label |
| Consented research record | Not used in this demo | Not used in this demo | Not used in this demo | Not used in this demo | Allowed by an explicit provenance label |

## Required episode policy

Any episode that invokes YouCam must carry these immutable restrictions:

```json
{
  "source": "youcam",
  "trainingEligible": false,
  "researchExportAllowed": false,
  "evaluationExportAllowed": false,
  "embeddingAllowed": false,
  "worldModelEligible": false
}
```

## Allowed retention

Retain only the minimum runtime metadata required for reliability and product analytics, such as:

- Internal task identifier
- Tool name and API version
- Start and completion timestamps
- Success, failure, timeout, or cancellation status
- Redacted error category
- Product identifier that does not reveal personal information
- Human confirmation outcome

Do not log authorization headers, API tokens, uploaded media, result media, biometric features, personal identifiers, or raw provider payloads.

## Storage separation

```text
Runtime media plane
  YouCam input bytes → provider upload → temporary provider result → browser display
  Retention: process memory and provider-controlled temporary storage only

Operational data plane
  Product ID + human-authored intent + human outcome + score + restriction policy
  Retention: eligible for the future operational database, never the learning database

Learning data plane
  Separately collected, licensed, or research-consented records only
  Retention: future dataset registry with provenance and revocation metadata
```

The runtime, operational, and learning planes must use separate tables or buckets when persistent storage is introduced. A database join must not be used to reconstruct YouCam media or provider outputs.

## Gemini isolation

Gemini integration must call `createGeminiTextEnvelope` before invoking the model. The envelope accepts only three minimal text fields and validates their provenance. It has no media, URL, task, provider-response, feature, embedding, or token field. Gemini Vision remains disabled for YouCam-associated interactions.

## Consent and demo inputs

Initial testing must use official provider samples, properly licensed public assets, synthetic assets permitted for the intended use, or user-owned images supplied with explicit consent. Do not use real customer, patient, or employee images during early testing.

## Enforcement

The `lib/data-boundary.ts` module is the single policy gate for cross-system transfers. API routes must use its safe projections instead of serializing internal task or episode objects. Automated tests enumerate every YouCam origin against every model and dataset destination; any allowed transfer fails the release test.

Human reviewers remain the final authority for customer-facing outcomes. Human confirmation changes the operational outcome but does not remove the YouCam restriction or make the episode eligible for learning.
