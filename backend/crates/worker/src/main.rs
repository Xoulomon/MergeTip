//! MergeTip job runner: processes events, pays tips, retries and expires pledges.

use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    tracing::info!("mergetip-worker started");
    // TODO: claim jobs from the `jobs` table and dispatch by kind.
    tokio::signal::ctrl_c().await?;
    Ok(())
}
