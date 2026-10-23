# Multi-stage build for the backend binaries.
#   docker build --build-arg BIN=mergetip-api -t mergetip-api backend/
ARG BIN=mergetip-api

FROM rust:1-bookworm AS build
ARG BIN
WORKDIR /src
COPY . .
ENV SQLX_OFFLINE=true
RUN cargo build --release --locked --bin ${BIN} && cp target/release/${BIN} /app

FROM gcr.io/distroless/cc-debian12
COPY --from=build /app /app
USER nonroot
ENTRYPOINT ["/app"]
