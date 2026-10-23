//! Mock LNURL-pay server: serves `/.well-known/lnurlp/{user}` for local Lightning addresses.

use axum::{Router, routing::get};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let app = Router::new().route("/healthz", get(|| async { "ok" }));

    let addr = std::env::var("MOCK_LNURL_ADDR").unwrap_or_else(|_| "0.0.0.0:8090".into());
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    tracing::info!(%addr, "mock-lnurl listening");
    axum::serve(listener, app).await?;
    Ok(())
}
