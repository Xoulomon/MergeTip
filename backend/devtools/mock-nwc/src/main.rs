//! Mock NWC wallet: answers NIP-47 `pay_invoice` requests on a local relay with fake preimages.

use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();
    tracing::info!("mock-nwc started");
    // TODO: connect to RELAY_URL and respond to NIP-47 requests.
    tokio::signal::ctrl_c().await?;
    Ok(())
}
