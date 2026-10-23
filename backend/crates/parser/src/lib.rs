//! `/tip` command grammar (PRD: "Command syntax", FR-2). Pure, no I/O.
//!
//! ```text
//! /tip @<github-username> <amount>[k] [sats] [on-merge] [for <note>]
//! ```

/// Maximum `/tip` commands honoured per comment (FR-2.1).
pub const MAX_COMMANDS_PER_COMMENT: usize = 5;
/// Maximum note length in characters.
pub const MAX_NOTE_LEN: usize = 140;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TipCommand {
    pub receiver: String,
    pub amount_sats: u64,
    pub on_merge: bool,
    pub note: Option<String>,
}

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum ParseError {
    #[error("malformed /tip command")]
    Malformed,
}

/// Extract every `/tip` command from a comment body.
pub fn parse_comment(_body: &str) -> Vec<Result<TipCommand, ParseError>> {
    todo!("P1-02: grammar, k suffix, on-merge, notes, code-block and quote skipping")
}
