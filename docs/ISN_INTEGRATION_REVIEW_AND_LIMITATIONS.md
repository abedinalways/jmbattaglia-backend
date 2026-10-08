# ISN Integration Analysis, Limitations & Backend Review

**Project:** Custom Inspection Ordering Portal with ISN Integration  
**Backend:** NestJS (TypeScript) + PostgreSQL / Prisma  
**External Integration:** Inspection Support Network (ISN) Public REST API  
**Date:** October 2026  
**Document Purpose:** In-depth technical review identifying architectural gaps between the UI/UX design (Figma) and the external ISN REST API capabilities, with concrete mitigations for implementation.

---

## 1. Executive Summary & Core Objective

The client's business runs operations, inspector calendars, billing, and work orders inside **Inspection Support Network (ISN)**.
However, ISN's default online scheduler is visually dated, rigid, and does not convert well. 

The custom portal acts as an **educational, high-converting customer ordering frontend**, while **ISN remains the authoritative operational backend**.

### Core Architecture Principle:
> **Do not replicate ISN’s engine, but do not rely on ISN for rich marketing/CMS content.**
> The Portal Backend serves as a smart orchestration middleware:
> - Managing marketing packages, educational videos/images, tooltips, and bundles in a local database.
> - Translating user selections, resolving client/agent identities, computing time slots, and securely generating orders in ISN via REST API calls.

---

## 2. Figma Assumptions vs. ISN API Reality (Gap & Limitations Matrix)

| Priority | Feature / Flow | Figma / Frontend Assumption | ISN Public REST API Reality | Required Architectural Solution / Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| 🔴 **Critical** | **Package & Bundle Creation** | Admin creates/edits bundles in portal and syncs/saves them to ISN. | ISN Public API exposes `GET /packages` only. There is **no public API to create/update packages in ISN**. An ISN package is merely a list of service IDs with no intrinsic pricing. | **Hybrid Package Model:** All marketing bundles, visual descriptions, videos, badges, and upsell rules live in the local Portal DB. Packages in the portal map to a collection of concrete ISN `service` IDs. When booking, send those service IDs directly to ISN. |
| 🔴 **Critical** | **Pricing & Calculations** | Frontend calculates total cost from local package prices and submits fixed amounts. | ISN has an internal pricing engine based on square footage, zip code, foundation type, and age. Submitting static prices bypasses company pricing rules or creates ledger discrepancies. | **Authoritative Server Re-Quote:** Fetch baseline service fees via `GET /services?withAssociations` for initial display, then call `POST /calculateservicequote` (or inspect draft order via `GET /order/{id}`) before confirming the final price to the customer. |
| 🔴 **Critical** | **Buyer's Agent vs. Client Info** | Agent or Buyer fills a single unified contact form. | ISN strictly models **Clients** (`clientuuid`) and **Real Estate Agents** (`buyersagentuuid` / `sellersagentuuid`) as distinct entities with different schema requirements and permissions. | **Multi-Role Contact Pipeline:** If the user is an Agent booking for a client, the form must capture both Client info and Agent info. The backend performs `GET /client/lookup/{email}` (creating via `POST /client` if missing) and `GET /agent/lookup/{email}`. |
| 🟠 **High** | **Time Slot Availability** | UI displays fixed slots (e.g. 9:00 AM, 1:00 PM, 3:00 PM) for the user to select. | `GET /availableslots` returns **entire inspector working windows** (e.g., `8:00 AM - 5:00 PM`), **NOT individual pre-sliced appointments**. Furthermore, dates are returned in `M/D/YYYY HH:MM` local time. | **Slot Slicing Engine in Backend:** Backend queries `GET /availableslots` for the given ZIP and `services[]`, calculates estimated inspection duration, splits the inspector's window into 15/30-minute quarter-hour start times (:00, :15, :30, :45), and serves clean bookable slots to the frontend. |
| 🟠 **High** | **Slot Reservation / Holding** | Selecting a slot in Step 4 holds or locks that time on the calendar while user finishes form. | **ISN has no hold or reservation lock endpoint.** Anyone else booking concurrently can take the inspector. | **Two-Stage Order Lifecycle (Draft & Check):**<br>1. On slot selection/review, create a **Draft Order** (`POST /order` without scheduling). Creating a draft order immediately hides that inspector's time window from subsequent availability queries.<br>2. On final submit, verify and transition to scheduled via `PUT /order/{id}` with `inprogress: false` and `scheduled: timestamp`. |
| 🟠 **High** | **Order Submission Lifecycle** | Single `POST` request creates and finalizes the order simultaneously. | Creating directly as scheduled triggers automated emails/SMS to inspector and client immediately, without safety checks. | **Controlled Staging Flow:** Backend creates draft (`inprogress: true`), inspects the created record via `GET /order/{id}` to ensure all fees and services matched, and then executes final scheduling. During dev/testing, include `"sendemailevents": false, "sendsmsevents": false`. |
| 🟠 **High** | **HTTP Protocol Quirks** | Standard JSON REST client for all endpoints. | 1. Errors return HTTP 200 with `{ "status": "error", "message": "..." }`.<br>2. `POST` accepts JSON only if `Content-Type: application/json` is explicit.<br>3. `PUT` / `DELETE` historically require `application/x-www-form-urlencoded` or custom handling.<br>4. Unknown routes return `405 Method Not Allowed`, not `404`. | **Robust ISN HTTP Adapter:** Build a dedicated `IsnApiClient` wrapper in NestJS that handles Basic Auth, forces strict payload validation, inspects response body `status` flags, and handles encoding differences. |
| 🟡 **Medium** | **Property & Form Fields** | Portal form fields might not match ISN schema keys. | ISN requires specific property keys (`address1`, `city`, `state`, `zip`, `squarefeet`, `yearbuilt`, `foundation`, etc.). Unknown keys are either dropped or trigger a `partial` status. | **Field Mapping & Metadata Layer:** Clean normalization layer in backend. Any portal-specific custom data not accepted by ISN is stored in the portal database and appended to ISN `notes`. |
| 🟡 **Medium** | **Dynamic Dropdowns (Foundation, Referral Reasons, Order Types)** | Hardcoded frontend options for foundation types, property types, and referral sources. | ISN accounts have custom-configured lookup lists for `ordertypes`, `referral-reasons`, and property attributes that vary per company. | **Cached Reference Data Service:** Backend provides cached endpoints (`/api/reference/order-types`, `/api/reference/services`, etc.) populated by fetching directly from ISN so options stay in sync with the client's ISN account. |

---

## 3. Deep Dive into Major Technical Challenges

### 3.1. Package & Service Architecture (The "Bundle" Problem)
- **What Figma Shows:** An admin panel where the business owner creates packages (e.g., "Premium Home Buyer Bundle"), sets pricing, adds educational videos, feature bullets, and discount badges.
- **ISN Reality:** ISN’s `/packages` endpoint is read-only. In ISN, an order does not price or execute based on a package UUID; it prices based on individual **Service IDs**. If you send an order with `packages: [{ package: "abc" }]` but leave the `services` array empty, **no services are attached and no fee is charged**.
- **The Solution:** 
  - Our database stores `Package` models containing title, description, marketing copy, video URLs, badges, and a relation to one or more `service_ids` (from ISN).
  - When a customer selects a package, the frontend/backend translates the package into its constituent ISN `services[]`.
  - The order payload sends both the `services` array (for execution and pricing) and the `packages` reference (for ISN record tagging).

### 3.2. Appointment Slicing & Availability
- **ISN Availability API Behavior:**
  ```http
  GET /availableslots?zip=75001&services[]=srv_1&services[]=srv_2&daysahead=7
  ```
  Returns:
  ```json
  {
    "slots": [
      {
        "userid": "inspector_uuid_123",
        "start": "10/12/2026 08:00",
        "end": "10/12/2026 17:00",
        "userdisplay": "John Doe"
      }
    ]
  }
  ```
- **The Problem:** The frontend UI expects clean time options (e.g., `09:00 AM`, `01:00 PM`). ISN gives an entire 9-hour window.
- **The Solution:** 
  The backend must implement a `SlotCalculatorService`:
  1. Take inspector window `[start, end]`.
  2. Compute total inspection duration (sum of service durations or default duration, e.g. 180 minutes).
  3. Divide available window into standard intervals (e.g., every 60 or 120 minutes on the quarter hour: 08:00, 10:00, 13:00, etc.).
  4. Ensure `start_time + duration <= end_time`.
  5. Format times in company local time (`YYYY-MM-DD HH:MM:SS`).

### 3.3. Client & Agent Entity Resolution
- In ISN, creating an order requires referencing existing entity IDs (`clientuuid`, `buyersagentuuid`, `sellersagentuuid`).
- If you blindly create clients on every booking, ISN fills with duplicate client records.
- **Backend Flow:**
  ```
  Customer enters email (client@test.com)
         │
         ▼
  GET /client/lookup/client@test.com
         ├── Found (200 OK with client object) ──> Use client.id
         └── Not Found (200 OK with status: error)
                   │
                   ▼
             POST /client (Create client) ───────> Use new id
  ```
- If an agent is entering their details, look up the agent via `GET /agent/lookup/{email}`. If found, attach `buyersagentuuid`. If not found, log or attach agent notes gracefully (since creating agents requires elevated ISN owner permissions).

### 3.4. Order Submission: Draft vs. Scheduled
- ISN has two order states:
  1. **Draft Order (`inprogress: true` or omitted `inprogress` without `scheduled` timestamp):** Saved on ISN, has an `oid` and `id`, blocks the inspector window from other API lookups, but does **not** send customer confirmation emails, SMS, or dispatch notifications.
  2. **Scheduled Order (`inprogress: false` and `scheduled: "YYYY-MM-DD HH:MM:SS"`):** The inspection is locked into the calendar and ISN notification workflows trigger.
- **Safe Pipeline:**
  1. Backend receives order form data.
  2. Backend performs client/agent lookup/creation.
  3. Backend sends `POST /order` as Draft.
  4. Backend verifies returned `status == "ok"` and reads back the order via `GET /order/{id}` to verify fees.
  5. Backend updates order to Scheduled via `PUT /order/{id}`.
  6. Backend records order in local PostgreSQL database with status `CONFIRMED` and returns success to customer.

---

## 4. Backend Scope & Technology Stack

### 4.1. Local Database (PostgreSQL + Prisma) Scope
The local database stores **only** portal and content management data:
- `AdminUser`: Authentication for portal content managers.
- `PortalPackage`: Marketing packages, display order, badges, upsell recommendations, and linked ISN service IDs.
- `EducationalContent`: Service explanation text, videos, before/after images, and FAQs.
- `Tooltip`: Field-level guidance tooltips for the ordering wizard.
- `OrderLog`: Audit trail of portal submissions with user details, payload snapshot, ISN Order ID (`oid`), and sync status (useful for customer support and webhook tracking).
- `ISNCache`: Cached ordertypes, services, fees, and referral reasons to minimize external API latency.

### 4.2. Technologies
- **Framework:** NestJS (Modular architecture: `IsnModule`, `CatalogModule`, `OrderModule`, `ContentModule`, `AuthModule`).
- **ORM:** Prisma ORM with PostgreSQL.
- **Validation:** `class-validator` + `class-transformer` for strict DTO schemas.
- **External Client:** `Axios` with interceptors handling Basic Auth and ISN error status checks.
- **Storage:** AWS S3 / Cloudflare R2 for educational videos and marketing imagery.

---

## 5. Next Steps

1. **Review & Clarify:** Verify client credentials and permissions (Access Key, Secret Key, Company Key, Office UUID).
2. **Database Schema Design:** Create `schema.prisma` covering portal CMS entities and order sync logs.
3. **ISN Service Client Implementation:** Build and test authentication, availability slot slicing, client lookup, and draft order creation.
4. **Portal API Endpoints:** Expose clean REST endpoints for the Next.js frontend to consume.
