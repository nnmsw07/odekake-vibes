# v20.11.18 handoff

The screenshot showing a gray Hero with a huge `イメージ` label was not a Google attribution issue. The static fallback path for six newly added spots was broken (`images/ai/cafe-interior.jpg` did not exist), and the image error handler removed the `<img>` before the async Google Places replacement arrived.

This release fixes both the broken assets and the runtime rescue path. It also ensures the manually selected Google Hero index can be honored for editorial/event names whose text does not closely match the Google Place display name.
