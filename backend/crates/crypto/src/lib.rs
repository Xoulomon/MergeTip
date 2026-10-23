//! Envelope encryption (AES-256-GCM data keys wrapped by a master key) and HMAC helpers.

use std::fmt;

/// Wrapper that keeps secrets out of `Debug` output and logs.
pub struct Redacted<T>(pub T);

impl<T> fmt::Debug for Redacted<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("[REDACTED]")
    }
}
