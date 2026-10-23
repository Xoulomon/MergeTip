//! Domain types, the tip state machine and shared errors.

pub mod state;

pub use state::{IllegalTransition, TipState, transition};
