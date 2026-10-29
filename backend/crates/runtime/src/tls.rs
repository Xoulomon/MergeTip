//! Picks rustls' process-wide crypto provider.
//!
//! The dependency tree enables both of rustls' providers (`aws-lc-rs` through reqwest, `ring`
//! through the Nostr client), and with both present rustls cannot choose one itself: the first
//! TLS connection that relies on the default (NWC relays over `wss://`) panics. Installing one
//! explicitly at startup avoids that.

/// Installs `aws-lc-rs` as the default provider. Call first thing in `main`; calling it again
/// is harmless.
pub fn install_crypto_provider() {
    // Err only means a provider is already installed, which is what we want.
    let _ = rustls::crypto::aws_lc_rs::default_provider().install_default();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_default_provider_is_available_afterwards() {
        install_crypto_provider();
        install_crypto_provider();
        assert!(rustls::crypto::CryptoProvider::get_default().is_some());
        // What the relay client builds for `wss://`; this is the call that panicked without a
        // default provider.
        let _config = rustls::ClientConfig::builder()
            .with_root_certificates(rustls::RootCertStore::empty())
            .with_no_client_auth();
    }
}
