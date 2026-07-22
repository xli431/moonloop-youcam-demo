# MVP Architecture

## Agent responsibilities

| Role | Responsibility | Autonomy |
| --- | --- | --- |
| Experience guide | Structures customer intent and suggests the next conversation step | Suggests only |
| YouCam runtime tool | Produces a product-specific visual experience | Executes only after consent |
| Human reviewer | Confirms or corrects the proposed direction | Final authority |
| Episode evaluator | Calculates explainable experience metrics | Evaluates confirmed records only |
| Policy gate | Blocks restricted data from learning and export pipelines | Mandatory enforcement |

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

## Tool and data access

| Component | May access | Must not access |
| --- | --- | --- |
| Browser experience | Product catalog, runtime status, confirmed outcome | API token |
| Server tool adapter | API token, provider request, provider response | Training pipeline |
| Episode service | Minimal task metadata, structured human outcome | Uploaded or generated media |
| Analytics view | Aggregated episode metrics | Raw customer media or provider payloads |
| Learning pipeline | Explicitly eligible non-YouCam data only | Any YouCam-assisted episode |

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
