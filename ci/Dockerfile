FROM node:22-bookworm-slim

# git is required because nacho-build reads git state for versioning
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /work
COPY . .

# `prepare` bootstraps esbuild → dist/esm, then the real nacho-build runs
RUN npm ci

ENTRYPOINT ["/work/ci/run.sh"]
