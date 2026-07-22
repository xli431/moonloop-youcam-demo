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

## Consent and demo inputs

Initial testing must use official provider samples, properly licensed public assets, synthetic assets permitted for the intended use, or user-owned images supplied with explicit consent. Do not use real customer, patient, or employee images during early testing.

## Enforcement

These boundaries must be enforced in schemas, runtime policy gates, export code, logs, and automated tests. Documentation alone is not sufficient.
