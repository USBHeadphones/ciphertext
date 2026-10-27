#!/bin/sh
# Concatenates src/ into the single shipping file ../home-free.html
cd "$(dirname "$0")" && cat src/1-shell.html src/2-data.js src/3-core.js src/4-art.js src/4b-assets.js src/5-props.js src/6a-sculpt.js src/6b-it.js src/7-world.js src/8a-audio-core.js src/8b-audio.js src/9a-state.js src/9b-story.js src/9c-ai.js src/9d-player.js src/9e-loop.js > ../home-free.html
