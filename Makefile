# MergeTip developer tasks. Run `make help` for the list.
SHELL := bash
BACKEND := backend
FRONTEND := frontend

.PHONY: help bootstrap up down dev dev-api dev-worker dev-web dev-app smee migrate openapi \
        fmt lint test check clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

bootstrap: ## Install toolchains and dependencies
	rustup show active-toolchain
	cargo install --locked sqlx-cli --no-default-features --features rustls,postgres
	cargo install --locked cargo-deny cargo-audit cargo-watch
	corepack enable
	cd $(FRONTEND) && pnpm install
	@[ -f .env ] || cp .env.example .env

up: ## Start local services (Postgres, relay, mocks, Mailpit)
	docker compose up -d

down: ## Stop local services
	docker compose down

dev: ## Run api, worker and web app with hot reload
	$(MAKE) -j3 dev-api dev-worker dev-web

dev-api:
	cd $(BACKEND) && cargo watch -x 'run -p mergetip-api'

dev-worker:
	cd $(BACKEND) && cargo watch -x 'run -p mergetip-worker'

dev-web:
	cd $(FRONTEND) && pnpm dev

dev-app: ## Create a personal GitHub App from deploy/manifests/dev.json
	@echo "TODO(P0-08): run the GitHub App manifest flow and write keys to .env"

smee: ## Forward GitHub webhooks to the local api
	npx smee-client --url $$SMEE_URL --target http://localhost:8080/v1/webhooks/github

migrate: ## Apply database migrations
	cd $(BACKEND) && sqlx migrate run

openapi: ## Regenerate openapi/openapi.json and the TS client
	@echo "TODO: dump the utoipa spec from mergetip-api into openapi/openapi.json"
	cd $(FRONTEND) && pnpm gen:api

fmt: ## Format all code
	cd $(BACKEND) && cargo fmt --all
	cd $(FRONTEND) && pnpm format

lint: ## Lint all code
	cd $(BACKEND) && cargo fmt --all --check && cargo clippy --workspace --all-targets -- -D warnings
	cd $(FRONTEND) && pnpm lint

check: ## Type-check the frontend
	cd $(FRONTEND) && pnpm check

test: ## Run all tests
	cd $(BACKEND) && cargo test --workspace
	cd $(FRONTEND) && pnpm test

clean: ## Remove build artifacts
	cd $(BACKEND) && cargo clean
	rm -rf $(FRONTEND)/node_modules $(FRONTEND)/**/build $(FRONTEND)/**/.svelte-kit $(FRONTEND)/**/.output
