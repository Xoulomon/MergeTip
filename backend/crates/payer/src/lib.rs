//! Payer: NWC sender wallets (NIP-47), LNURL receiver endpoints and invoice validation.

use std::time::Duration;

use async_trait::async_trait;

pub mod invoice;
pub mod lnurl;
pub mod nwc;

/// Proof of payment returned by the sender's wallet.
#[derive(Debug, Clone)]
pub struct PaymentProof {
    pub payment_hash: String,
    pub preimage: String,
}

/// An invoice that has passed amount, expiry and description-hash checks.
#[derive(Debug, Clone)]
pub struct ValidatedInvoice {
    pub bolt11: String,
    pub payment_hash: String,
    pub amount_msat: u64,
}

#[derive(Debug, thiserror::Error)]
pub enum PayError {
    #[error("wallet quota exceeded")]
    QuotaExceeded,
    #[error("insufficient balance")]
    InsufficientBalance,
    #[error("rate limited")]
    RateLimited,
    #[error("timed out waiting for wallet")]
    Timeout,
    #[error("wallet error: {0}")]
    Other(String),
}

#[derive(Debug, thiserror::Error)]
pub enum ResolveError {
    #[error("receiver endpoint unreachable")]
    Unreachable,
    #[error("invalid invoice: {0}")]
    InvalidInvoice(String),
}

#[async_trait]
pub trait SenderWallet {
    async fn pay_invoice(&self, bolt11: &str, timeout: Duration) -> Result<PaymentProof, PayError>;
}

#[async_trait]
pub trait ReceiverEndpoint {
    /// Lightning address via LNURL, or a Bitnob payout invoice.
    async fn invoice_for(
        &self,
        amount_sats: u64,
        comment: Option<&str>,
    ) -> Result<ValidatedInvoice, ResolveError>;
}
