//! Postgres repositories, migrations and the `FOR UPDATE SKIP LOCKED` job queue.

pub use sqlx::PgPool;

/// Embedded migrations from `backend/migrations`.
pub static MIGRATOR: sqlx::migrate::Migrator = sqlx::migrate!("../../migrations");
