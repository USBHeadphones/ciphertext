#!/bin/sh
# Runs the shipping game script headlessly and checks geometry, puzzles and the full playthrough.
cd "$(dirname "$0")" && node geom.js && node puzzle.js && node flow.js
