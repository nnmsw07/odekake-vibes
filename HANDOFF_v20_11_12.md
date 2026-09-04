# v20.11.12 handoff

Goal: stop photo-less SNS spot slides from repeating the same `KIBUN NOTE + three metrics` visual.

Implemented five deterministic note-card variants based on carousel slide position:
1. `note-quote` — large editorial headline and chips
2. `note-metrics` — three mood/fit scores
3. `note-best` — numbered best-for list
4. `note-moment` — editorial moment / collection
5. `note-facts` — compact fact tiles

The variants rotate and repeat only after five spot slides. Auto-resolved strict-safe Commons images still replace a note card when available. The resolver removes variant CSS classes before turning a note into an image card.
