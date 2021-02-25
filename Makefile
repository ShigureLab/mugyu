
run:
	deno run --allow-read --allow-net --allow-write --unstable ./src/index.ts

install:
	deno install --allow-net --allow-write --allow-read --unstable -n mugyu ./src/index.ts

cache:
	deno cache ./src/index.ts

bundle:
	deno bundle ./src/index.ts ./mugyu.js
