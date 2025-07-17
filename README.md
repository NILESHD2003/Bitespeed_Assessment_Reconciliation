# Bitespeed Assessment - Contact Identity Reconciliation

**Live at :** https://bitespeed-assessment.nileshdeshpande.dev  

## Tech Stack

- **Backend Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Class Validator
- **Package Manager:** PNPM

## Introduction

This project is a contact identity reconciliation service built for the Bitespeed assessment. The service provides functionality to identify and link customer contacts across different touchpoints (email and phone number) to maintain a unified customer identity.

The system uses a sophisticated linking mechanism to:
- Track customer interactions across multiple contact points
- Maintain primary and secondary contact relationships
- Provide consolidated contact information for customer identification
- Handle contact reconciliation when new information is discovered

## Architecture Patterns

This project implements several design patterns for maintainability and scalability:

- **Repository Pattern:** Data access abstraction layer (`ContactRepository`)
- **MVC Pattern:** Controller-Service-Repository architecture
- **DTO Pattern:** Data Transfer Objects for request/response validation (`IdentifyDto`)
- **Dependency Injection:** NestJS built-in DI container
- **Modular Architecture:** Feature-based module organization

## API Endpoints

### POST `/identify`

Identifies and links customer contacts based on email and/or phone number.

**Request Body:**
```json
{
  "email": "string (optional)",
  "phoneNumber": "number (optional)"
}
```

**Response Format:**
```json
{
  "contact": {
    "primaryContactId": "number",
    "emails": ["string[]"],
    "phoneNumbers": ["number[]"],
    "secondaryContactIds": ["number[]"]
  }
}
```

**Business Logic:**
- If no existing contact is found, creates a new primary contact
- If one contact is found, returns the contact information
- If multiple contacts are found with different primary IDs, links them and updates secondary contacts

## Data Input Format

### Identify Request
```typescript
{
  email?: string;        // Optional: Valid email address
  phoneNumber?: number;  // Optional: Phone number as integer
}
```

**Validation Rules:**
- At least one of `email` or `phoneNumber` must be provided
- Email must be in valid email format (when provided)
- Phone number must be a valid number (when provided)

### Database Schema
```sql
model Contact {
  id             Int              @id @default(autoincrement())
  phoneNumber    String?
  email          String?
  linkedId       Int?
  linkPrecedence LinkPrecedence   @default(PRIMARY)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  deletedAt      DateTime?
}

enum LinkPrecedence {
  PRIMARY
  SECONDARY
}
```

## Local Setup Guide

### Prerequisites

Before setting up the project locally, ensure you have the following installed:

- **Node.js**
- **PNPM**
- **PostgreSQL**
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/NILESHD2003/Bitespeed_Assessment_Reconciliation.git
cd Bitespeed_Assesment_Reconciliation
```

### Step 2: Install Dependencies

```bash
# Using PNPM (recommended)
pnpm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add the following environment variables to your `.env` file:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/bitespeed_db"
DIRECT_URL="postgresql://username:password@localhost:5432/bitespeed_db"

# Application Configuration
PORT=3000

```

#### Run Prisma Migrations

```bash
# Generate Prisma Client
pnpx prisma generate

# Run database migrations
pnpx prisma migrate dev --name init

```

### Step 5: Verify Database Connection

```bash
# Check migration status
pnpx prisma migrate status
```

### Step 6: Run the Application

#### Development Mode

```bash
# Start the application in development mode with hot reload
pnpm run start:dev
```

#### Production Mode

```bash
# Build the application
pnpm run build

# Start in production mode
pnpm run start:prod
```

### Step 7: Verify Installation

The application should now be running on `http://localhost:3000`

Test the API endpoint:

```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": 1234567890}'
```

## Project Structure

```
src/
├── dto/                 # Data Transfer Objects
│   └── identify.dto.ts
├── identity/           # Identity feature module
│   ├── identity.controller.ts
│   ├── identity.service.ts
│   └── identity.module.ts
├── repository/         # Repository pattern implementation
│   ├── contact.repository.ts
│   └── contact.module.ts
├── prisma/            # Prisma service
│   └── prisma.service.ts
├── app.module.ts      # Root application module
├── app.controller.ts  # Root controller
├── app.service.ts     # Root service
└── main.ts           # Application entry point

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations

test/
├── app.e2e-spec.ts   # End-to-end tests
└── jest-e2e.json     # E2E test configuration
```

**Note:** This project was developed as part of the Bitespeed technical assessment to demonstrate backend development skills using modern TypeScript and NestJS patterns.

## Contact

**LinkedIn:** https://www.linkedin.com/in/nilesh-deshpande2003
**Resume:** https://nileshdeshpande.dev/resume
