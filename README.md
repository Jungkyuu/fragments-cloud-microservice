# Fragments Microservice

[![CI](https://github.com/Jungkyuu/fragments-cloud-microservice/actions/workflows/ci.yml/badge.svg)](https://github.com/Jungkyuu/fragments-cloud-microservice/actions/workflows/ci.yml)

RESTful API service built with Node.js, Express, Docker, and AWS (S3 & DynamoDB) for storing, managing, and converting text, Markdown, JSON, and image fragments.

## Overview

The service decouples fragment metadata from raw payload storage:
- **DynamoDB** stores item metadata (fragment ID, owner ID, MIME type, byte size, creation/update timestamps).
- **S3** stores the raw binary or text data.
- **In-memory storage** is available via `DATA_LAYER=memory` for local development and fast unit testing without AWS dependencies.

On-the-fly format conversion is handled through URL extensions (e.g., requesting `GET /v1/fragments/:id.html` converts a stored `text/markdown` fragment into HTML).

## Architecture

```mermaid
flowchart TB
    Client["Client / Hurl"]

    subgraph Docker["Docker Compose - Local Environment"]
        API["Fragments API<br/>Node.js 22 + Express"]

        S3["LocalStack<br/>Amazon S3"]
        DB["DynamoDB Local"]

        API -->|"Fragment data"| S3
        API -->|"Fragment metadata"| DB
    end

    Client -->|"HTTP REST Requests"| API

    subgraph CI["CI/CD - GitHub Actions"]
        Trigger["Push / Pull Request"]
        Workflow["GitHub Actions"]
        Lint["ESLint"]
        Tests["Unit Tests"]
        Build["Docker Build"]
        Integration["Hurl Integration Tests"]

        Trigger --> Workflow
        Workflow --> Lint
        Workflow --> Tests
        Workflow --> Build
        Workflow --> Integration
    end

    Integration -.->|"API Testing"| API
    
## Tech Stack

- **Runtime & Framework:** Node.js 22, Express
- **Storage:** AWS S3, AWS DynamoDB (LocalStack & DynamoDB Local for local testing)
- **Authentication:** HTTP Basic Auth
- **Testing & Linting:** Jest, Supertest, Hurl, ESLint, Hadolint
- **Containerization & CI/CD:** Docker, Docker Compose, GitHub Actions

## API Reference

All `/v1/fragments` routes require HTTP Basic Authentication (`Authorization: Basic <credentials>`).

| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :---: |
| `GET` | `/v1/health` | Health check and service status | `200` |
| `POST` | `/v1/fragments` | Create a new fragment (`Content-Type` validated) | `201` |
| `GET` | `/v1/fragments` | Get a list of fragment IDs for the current user | `200` |
| `GET` | `/v1/fragments?expand=1` | Get full metadata for all fragments owned by the user | `200` |
| `GET` | `/v1/fragments/:id` | Get metadata for a specific fragment | `200` |
| `GET` | `/v1/fragments/:id/raw` | Get raw fragment data with its original `Content-Type` | `200` |
| `GET` | `/v1/fragments/:id.:ext` | Convert and return fragment data in the requested format (`.html`, `.txt`, etc.) | `200` |
| `PUT` | `/v1/fragments/:id` | Replace existing fragment data (requires matching `Content-Type`) | `200` |
| `DELETE` | `/v1/fragments/:id` | Delete fragment metadata and raw data | `200` |

## Getting Started

### 1. Run Locally (In-Memory Mode)

```bash
npm ci
npm run lint
npm test
```

### 2. Run with Docker Compose (LocalStack S3 + DynamoDB Local)

Make sure Docker, AWS CLI, and [Hurl](https://hurl.dev/) are installed locally.

```bash
# Build and start the API, LocalStack, and DynamoDB Local containers
docker compose up -d --build

# Create the local S3 bucket and DynamoDB table
./scripts/local-aws-setup.sh

# Run end-to-end integration tests
npm run test:integration

# Stop and remove containers
docker compose down
```

## CI Pipeline

Every push and pull request to `main` triggers `.github/workflows/ci.yml`:
1. **Lint:** Runs ESLint across the codebase.
2. **Dockerfile Lint:** Validates `Dockerfile` best practices using Hadolint.
3. **Unit Tests:** Executes Jest unit tests and generates coverage reports.
4. **Integration Tests:** Spins up the full Docker Compose stack and runs Hurl HTTP assertions against LocalStack and DynamoDB Local.
