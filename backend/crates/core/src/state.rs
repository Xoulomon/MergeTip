//! Tip state machine (PRD: "Payment flow and tip state machine", FR-4.1).
//!
//! All state changes go through [`transition`]; no other code updates `tips.state`.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TipState {
    Received,
    AwaitingSender,
    Verifying,
    AwaitingConfirmation,
    Held,
    Paying,
    Pledged,
    Paid,
    Rejected,
    Cancelled,
    Expired,
    Failed,
    FiatProcessing,
    FiatStuck,
    Refunded,
}

#[derive(Debug, thiserror::Error)]
#[error("illegal tip transition {from:?} -> {to:?}")]
pub struct IllegalTransition {
    pub from: TipState,
    pub to: TipState,
}

pub fn transition(from: TipState, to: TipState) -> Result<(), IllegalTransition> {
    use TipState::*;
    let ok = matches!(
        (from, to),
        (Received, AwaitingSender | Verifying)
            | (AwaitingSender, Verifying | Cancelled)
            | (Verifying, AwaitingConfirmation | Held | Paying | Rejected)
            | (AwaitingConfirmation, Held | Paying | Cancelled)
            | (Held, Paying | Cancelled)
            | (Paying, Paid | Pledged | Failed | FiatProcessing)
            | (Pledged, Paying | Expired)
            | (FiatProcessing, Paid | FiatStuck)
            | (FiatStuck, FiatProcessing | Refunded)
    );
    if ok {
        Ok(())
    } else {
        Err(IllegalTransition { from, to })
    }
}

#[cfg(test)]
mod tests {
    use super::TipState::*;
    use super::*;

    #[test]
    fn happy_path_is_allowed() {
        for (from, to) in [(Received, Verifying), (Verifying, Paying), (Paying, Paid)] {
            assert!(transition(from, to).is_ok());
        }
    }

    #[test]
    fn final_states_cannot_move() {
        assert!(transition(Paid, Paying).is_err());
        assert!(transition(Rejected, Verifying).is_err());
    }
}
