# Rokid Max Pro Test Plan

## Scope

The hackathon MVP supports Rokid Max Pro through a browser-based companion view displayed by the paired Station Pro computing unit. This is a wearable display and interaction test, not a claim of native UXR2.0 or 6DoF spatial integration.

## Required hardware

- Rokid Max Pro
- Rokid Station Pro
- Wi-Fi access shared with the deployed MOONLOOP application
- Station Pro browser or an approved browser-capable launcher

## Preflight

1. Deploy the application to an HTTPS URL.
2. Confirm `/wearable` loads on a desktop browser.
3. Confirm the main experience can create and complete an episode.
4. Confirm `/api/episodes/latest` returns only structured episode data and no image URL, API token, or raw YouCam payload.

## On-device test

1. Connect Rokid Max Pro to Station Pro and complete display calibration.
2. Open the deployed HTTPS URL ending in `/wearable`.
3. Confirm the header reports `live`.
4. Complete a customer episode from the main web experience.
5. Confirm the wearable view updates within three seconds.
6. Verify customer intent, selected product, human outcome, and episode score remain readable.
7. Activate `Enter focus view` and verify the intent card becomes the dominant element.
8. Disconnect Wi-Fi and verify the status changes to `offline` without losing control of the device.
9. Reconnect and verify the latest structured episode returns.

## Pass criteria

- No horizontal clipping in the Rokid display.
- Primary text is readable without head movement.
- The experience does not request camera or microphone permission on the wearable view.
- The wearable view never receives the YouCam API key, uploaded media, generated media, or raw provider response.
- The companion reflects a newly confirmed episode within three seconds.

## Deferred native track

Native 6DoF placement, gesture input, camera access, and spatial anchors require a separate UXR2.0 application for Rokid Max Pro plus Station Pro. Those capabilities are outside the browser MVP and must not be described as implemented until verified on physical hardware.
