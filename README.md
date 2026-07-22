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

The same boundary applies to Gemini and other third-party models. YouCam input, output, derived data, and assisted episodes cannot enter Gemini text or vision inference. A future Gemini text coach must use the provenance-checked minimal envelope in `lib/data-boundary.ts`, which accepts only separately sourced human and first-party text fields.

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

## Current MVP

The repository now includes:

- A responsive English retail experience interface
- A consent-gated mock YouCam task flow
- Asynchronous task creation and status polling
- Human confirmation before episode completion
- A structured episode schema and explainable score
- Hard policy gates for every YouCam-assisted episode
- Browser voice-intent capture when Web Speech API support is available
- A high-contrast Rokid Max Pro companion view at `/wearable`
- Unit tests for consent and downstream data restrictions
- A code-enforced origin-to-destination matrix for YouCam, Gemini, datasets, and world models
- Safe API projections that omit internal task identifiers and provider lineage

Run the project with Node.js 22.12 or later:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Next integration milestone

The official AI Bag Virtual Try-On V2.0 contract is implemented behind the same provider interface. The application remains in safe mock mode by default.

To test the live provider, create `.env.local`, set `YOUCAM_API_MODE=live`, and add your API key to `YOUCAM_API_TOKEN`. Never paste that key into client code, screenshots, issues, or commits. Live mode requires a consented customer image and a licensed bag reference image.

The wearable MVP is a browser companion for Rokid Max Pro paired with Station Pro. It does not claim native UXR2.0, camera, gesture, spatial-anchor, or 6DoF support. Follow the [Rokid test plan](docs/rokid-test-plan.md) for physical-device validation.
