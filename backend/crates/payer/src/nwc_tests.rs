//! The NIP-47 client against the mock wallet, over an in-process relay.

use std::time::Duration;

use mergetip_core::Msats;
use nostr_sdk::prelude::{EventBuilder, FinalizeEvent, Keys, MockRelay, SecretKey, Tag};

use super::*;
use crate::{
    SenderWallet,
    testing::{MintParams, MockWallet, behaviour, mint_invoice},
};

const SEED: [u8; 32] = [9; 32];

async fn setup() -> (MockRelay, MockWallet, NwcWallet) {
    let relay = MockRelay::run().await.unwrap();
    let url = relay.url().await.to_string();
    let wallet = MockWallet::start(&url, SEED).await.unwrap();
    let client = NwcWallet::connect(wallet.uri()).await.unwrap();
    (relay, wallet, client)
}

fn invoice(sats: u64) -> crate::testing::MintedInvoice {
    mint_invoice(&MintParams {
        amount: Msats::new(sats * 1_000),
        seed: SEED,
        ..MintParams::default()
    })
}

#[tokio::test]
async fn takes_the_newest_info_event_when_relays_disagree() {
    // Like Alby Hub: two relays in the URI, one still holding an older info event.
    let current = MockRelay::run().await.unwrap();
    let stale = MockRelay::run().await.unwrap();
    let wallet_secret = [7; 32];
    let wallet = MockWallet::start_with(crate::testing::MockWalletOptions {
        relay: current.url().await.to_string(),
        advertised_relay: None,
        seed: SEED,
        wallet_secret: Some(wallet_secret),
        app_secret: None,
    })
    .await
    .unwrap();

    let keys = Keys::new(SecretKey::from_slice(&wallet_secret).unwrap());
    let older = EventBuilder::new(Kind::WalletConnectInfo, "pay_invoice")
        .tag(Tag::parse(["encryption", "nip04"]).unwrap())
        .custom_created_at(Timestamp::now() - Duration::from_secs(3_600))
        .finalize(&keys)
        .unwrap();
    let publisher = Client::default();
    publisher.add_relay(stale.url().await).await.unwrap();
    publisher.connect().await;
    publisher.send_event(&older).await.unwrap();

    let both = format!("{}&relay={}", wallet.uri(), stale.url().await);
    let client = NwcWallet::connect(&both).await.unwrap();
    assert_eq!(client.cipher, Nip47Ciphers::NIP44V2);
    assert!(client.get_info().await.unwrap().supports("pay_invoice"));
}

#[tokio::test]
async fn reads_capabilities_and_prefers_nip44() {
    let (_relay, _wallet, client) = setup().await;
    let info = client.get_info().await.unwrap();
    assert!(info.supports("pay_invoice"));
    assert!(info.supports("lookup_invoice"));
    assert_eq!(info.encryption, Encryption::Nip44);
    assert_eq!(info.relays.len(), 1);
}

#[tokio::test]
async fn pays_and_returns_a_verified_preimage() {
    let (_relay, wallet, client) = setup().await;
    let minted = invoice(21);
    let proof = client
        .pay_invoice(
            &minted.bolt11,
            &minted.payment_hash,
            Duration::from_secs(10),
        )
        .await
        .unwrap();
    assert_eq!(proof.preimage, minted.preimage);
    assert_eq!(wallet.paid_hashes(), [minted.payment_hash]);
}

#[tokio::test]
async fn wallet_errors_keep_their_nip47_code() {
    let (_relay, _wallet, client) = setup().await;
    for (sats, expected) in [
        (
            behaviour::INSUFFICIENT_BALANCE_SATS,
            WalletErrorCode::InsufficientBalance,
        ),
        (
            behaviour::QUOTA_EXCEEDED_SATS,
            WalletErrorCode::QuotaExceeded,
        ),
    ] {
        let minted = invoice(sats);
        let err = client
            .pay_invoice(
                &minted.bolt11,
                &minted.payment_hash,
                Duration::from_secs(10),
            )
            .await
            .unwrap_err();
        match err {
            PayError::Wallet { code, .. } => {
                assert_eq!(code, expected);
                assert!(code.is_terminal());
            }
            other => panic!("expected a wallet error, got {other:?}"),
        }
    }
}

#[tokio::test]
async fn a_lost_answer_times_out_and_lookup_finds_the_payment() {
    let (_relay, _wallet, client) = setup().await;
    let minted = invoice(behaviour::PAYS_SILENTLY_SATS);
    let err = client
        .pay_invoice(&minted.bolt11, &minted.payment_hash, Duration::from_secs(2))
        .await
        .unwrap_err();
    assert_eq!(err, PayError::Timeout);

    assert_eq!(
        client.lookup_invoice(&minted.payment_hash).await.unwrap(),
        Lookup::Settled {
            preimage: minted.preimage
        }
    );
}

#[tokio::test]
async fn an_unanswered_payment_looks_pending() {
    let (_relay, _wallet, client) = setup().await;
    let minted = invoice(behaviour::NEVER_ANSWERS_SATS);
    let err = client
        .pay_invoice(&minted.bolt11, &minted.payment_hash, Duration::from_secs(2))
        .await
        .unwrap_err();
    assert_eq!(err, PayError::Timeout);
    assert_eq!(
        client.lookup_invoice(&minted.payment_hash).await.unwrap(),
        Lookup::Pending
    );
}

#[tokio::test]
async fn a_preimage_for_another_hash_is_not_proof() {
    let (_relay, _wallet, client) = setup().await;
    let minted = invoice(21);
    let other = invoice(22);
    let err = client
        .pay_invoice(&minted.bolt11, &other.payment_hash, Duration::from_secs(10))
        .await
        .unwrap_err();
    assert!(matches!(err, PayError::Protocol(_)), "{err:?}");
}

#[tokio::test]
async fn malformed_uris_are_refused_without_network() {
    for uri in [
        "",
        "https://example.com",
        "nostr+walletconnect://nothex?relay=wss://r&secret=x",
    ] {
        assert_eq!(
            NwcWallet::connect(uri).await.unwrap_err(),
            PayError::InvalidUri,
            "{uri}"
        );
    }
}

/// Against a real relay (`docker compose up relay`), to check a production relay handles the
/// NIP-47 event kinds as the in-process one does:
/// `LIVE_RELAY_URL=ws://localhost:7000 cargo test -p mergetip-payer -- --ignored live_relay`
#[tokio::test]
#[ignore = "needs a running relay; set LIVE_RELAY_URL"]
async fn live_relay_round_trip() {
    let url = std::env::var("LIVE_RELAY_URL").expect("LIVE_RELAY_URL");
    let wallet = MockWallet::start(&url, SEED).await.unwrap();
    let client = NwcWallet::connect(wallet.uri()).await.unwrap();
    let info = client.get_info().await.unwrap();
    assert!(info.supports("pay_invoice"));
    let minted = invoice(21);
    let proof = client
        .pay_invoice(
            &minted.bolt11,
            &minted.payment_hash,
            Duration::from_secs(15),
        )
        .await
        .unwrap();
    assert_eq!(proof.preimage, minted.preimage);
}

#[test]
fn fee_limit_refusals_are_recognised() {
    let failed = |message: &str| PayError::Wallet {
        code: WalletErrorCode::PaymentFailed,
        message: message.into(),
    };
    for message in [
        "Routing fee of ⚡️1 required, max fee is ⚡️0", // Coinos, seen live
        "route fee exceeds max fee",
        "Payment failed: fee limit exceeded",
    ] {
        assert!(failed(message).is_fee_limit(), "{message}");
    }
    for message in [
        "no route found",
        "invoice expired",
        "insufficient fee budget? no",
    ] {
        assert!(!failed(message).is_fee_limit(), "{message}");
    }
    // Only a payment failure counts; the same words under another code don't.
    let quota = PayError::Wallet {
        code: WalletErrorCode::QuotaExceeded,
        message: "max fee is 0".into(),
    };
    assert!(!quota.is_fee_limit());
}
