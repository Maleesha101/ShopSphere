# ShopSphere Security Lab - Makefile
# Provides convenient commands for building, running, and resetting the lab

.PHONY: up up-vulnerable up-hardened down reset build logs clean help

# Default target
.DEFAULT_GOAL := help

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

help: ## Show this help message
	@echo "$(GREEN)ShopSphere Security Lab$(NC)"
	@echo ""
	@echo "Usage:"
	@echo "  make $(YELLOW)up$(NC)              Start the lab (default: vulnerable mode)"
	@echo "  make $(YELLOW)up-vulnerable$(NC)   Start in vulnerable mode"
	@echo "  make $(YELLOW)up-hardened$(NC)     Start in hardened mode"
	@echo "  make $(YELLOW)down$(NC)           Stop all containers"
	@echo "  make $(YELLOW)reset$(NC)          Full reset (down + rebuild)"
	@echo "  make $(YELLOW)build$(NC)          Build all Docker images"
	@echo "  make $(YELLOW)logs$(NC)           Show live logs"
	@echo "  make $(YELLOW)clean$(NC)          Remove containers, volumes, and caches"

up: ## Start lab in vulnerable mode
	@echo "$(YELLOW)Starting ShopSphere in VULNERABLE mode...$(NC)"
	LAB_MODE=vulnerable docker compose up --build -d
	@echo "$(GREEN)Lab running at http://localhost:8080$(NC)"

up-vulnerable: ## Start lab in vulnerable mode
	@echo "$(YELLOW)Starting ShopSphere in VULNERABLE mode...$(NC)"
	LAB_MODE=vulnerable docker compose up --build -d
	@echo "$(GREEN)Lab running at http://localhost:8080$(NC)"

up-hardened: ## Start lab in hardened mode
	@echo "$(YELLOW)Starting ShopSphere in HARDENED mode...$(NC)"
	LAB_MODE=hardened docker compose up --build -d
	@echo "$(GREEN)Lab running at http://localhost:$${NGINX_PORT:-8080} (redirects to https://localhost:$${NGINX_HTTPS_PORT:-8443})$(NC)"

down: ## Stop all containers
	docker compose down

reset: ## Full reset - remove all containers, volumes, and rebuild
	@echo "$(RED)Performing full reset...$(NC)"
	docker compose down -v
	docker compose up --build -d
	@echo "$(GREEN)Reset complete. Lab is ready at http://localhost:8080$(NC)"

build: ## Build all Docker images
	docker compose build

logs: ## Show live logs
	docker compose logs -f

logs-api: ## Show API logs only
	docker compose logs -f api

clean: ## Remove containers, volumes, and rebuild from scratch
	docker compose down -v --rmi all --remove-orphans
	docker volume prune -f
