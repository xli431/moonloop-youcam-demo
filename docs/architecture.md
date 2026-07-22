# MVP Architecture

## Agent responsibilities

| Role | Responsibility | Autonomy |
| --- | --- | --- |
| Experience guide | Structures customer intent and suggests the next conversation step | Suggests only |
| YouCam runtime tool | Produces a product-specific visual experience | Executes only after consent |
| Human reviewer | Confirms or corrects the proposed direction | Final authority |
| Episode evaluator | Calculates explainable experience metrics | Evaluates confirmed records only |
| Policy gate | Blocks restricted data from learning and export pipelines | Mandatory enforcement |
| Gemini text coach | Receives a minimal provenance-checked text envelope | Suggests only; no YouCam media or derived data |

## State flow

```text
Discover intent
→ Select product
→ Record demo consent
→ Create YouCam task
→ Poll task status
→ Review visual result together
→ Human confirms or requests adjustment
→ Create restricted episode
→ Display coaching metrics
```

The optional Gemini text lane branches before YouCam output is created:

```text
Human-authored intent + confirmed locale + first-party coaching goal
→ Provenance validation
→ Minimal Gemini text envelope
→ Suggested conversation guidance
→ Human review
```

## Tool and data access

| Component | May access | Must not access |
| --- | --- | --- |
| Browser experience | Product catalog, runtime status, confirmed outcome | API token |
| Server tool adapter | API token, provider request, provider response | Training pipeline |
| Episode service | Minimal task metadata, structured human outcome | Uploaded or generated media |
| Analytics view | Aggregated episode metrics | Raw customer media or provider payloads |
| Learning pipeline | Explicitly eligible non-YouCam data only | Any YouCam-assisted episode |
| Gemini text adapter | Minimal human and catalog text envelope | YouCam media, results, task IDs, derived fields, or assisted episodes |
| Gemini Vision adapter | Nothing in the YouCam flow | Every YouCam-associated input and output |

## Human escalation rules

- No visual task may start without explicit consent.
- No episode may be completed without a human outcome.
- A requested adjustment returns the interaction to product discovery.
- A failed or unavailable provider returns control to the associate.
- The system provides suggestions and metrics; it does not make purchasing, medical, or employment decisions.

## Evaluation scenarios

| Scenario | Pass condition |
| --- | --- |
| Missing consent | Task request is rejected |
| Tool task still processing | Human confirmation is disabled |
| Human confirms result | Episode is created with an explainable score |
| Human requests adjustment | Outcome is recorded without pretending success |
| YouCam episode reaches export gate | Every learning and export flag remains false |
| API token appears in browser payload | Test fails and release is blocked |
| Any YouCam origin targets Gemini or a learning destination | Transfer throws `DataBoundaryError` |
| Internal episode is returned by an API route | Safe projection omits task ID and source |
| Human confirmation attempts to remove a restriction | Restriction remains immutable |
