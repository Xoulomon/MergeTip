# The API and the worker in one image, for hosts whose free plan runs a single service (Render).
# Build from the repository root:
#   docker build -f deploy/render/Dockerfile -t mergetip-backend .
FROM rust:1-bookworm AS chef
RUN cargo install cargo-chef --locked --version 0.1.78
WORKDIR /src

# Only the dependency graph: this layer changes when Cargo.toml/Cargo.lock do, not on every edit.
FROM chef AS planner
COPY backend/ .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS build
COPY --from=planner /src/recipe.json recipe.json
RUN cargo chef cook --release --locked --recipe-path recipe.json
COPY backend/ .
# Queries are checked against the committed .sqlx data; no database at build time.
ENV SQLX_OFFLINE=true
RUN cargo build --release --locked --bin mergetip-api --bin mergetip-worker

FROM debian:bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --system --uid 10001 mergetip
COPY --from=build /src/target/release/mergetip-api /src/target/release/mergetip-worker /app/
COPY deploy/render/start.sh /app/start.sh
USER mergetip
ENTRYPOINT ["/app/start.sh"]
