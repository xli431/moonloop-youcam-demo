# MOONLOOP YouCam Demo

A public hackathon prototype by **LAVIA Robotics** for human-in-the-loop luxury retail experiences powered by YouCam APIs.

## Product direction

MOONLOOP turns a customer interaction into a structured, reviewable improvement loop:

```text
Customer interaction
→ YouCam runtime tool
→ Structured experience state
→ Human confirmation
→ Episode evaluation
→ Associate coaching
→ Manager insight
```

The first milestone is a working YouCam API integration with a clear consumer and retail use case. Later milestones may add multilingual dialogue, voice, wearable interfaces, catalog context, and real-time operational analytics.

## Public demo boundary

This repository is a public demonstration project. It must not contain:

- API tokens, credentials, or deployment secrets
- Real customer, patient, or employee data
- Proprietary Coach, healthcare, SKAI, or enterprise content
- Private inventory, service, or operational records
- YouCam-generated images or derived outputs used as training data

Every episode that invokes YouCam must be excluded from model training, research exports, evaluation datasets, embeddings, synthetic-data pipelines, and world-model development.

```ts
{
  source: "youcam",
  trainingEligible: false,
  researchExportAllowed: false,
  evaluationExportAllowed: false,
  embeddingAllowed: false,
  worldModelEligible: false
}
```

See [Data Boundaries](docs/data-boundaries.md) for the full policy.

## Planned MVP

- Server-side YouCam authentication
- Asynchronous task creation and status polling
- Consent-aware image input
- Human confirmation of the displayed result
- Minimal runtime event logging
- Policy enforcement and automated tests
- Responsive web experience for associates and customers

## Local configuration

Copy `.env.example` to `.env.local` and add credentials only on your own machine or deployment secret manager.

Never commit `.env.local`, API tokens, uploaded images, generated results, or production logs.

## Status

Repository initialized. YouCam API integration is the next implementation milestone.
