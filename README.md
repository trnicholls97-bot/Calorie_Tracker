# Calorie_Tracker
Simple tracker with AI API integrations

# System Architecture Overview

This application is a full-stack calorie tracking tool composed of three primary systems:

* **Frontend (Vercel static hosting)**
* **Backend API (Vercel serverless functions)**
* **Data + AI services (Firebase + Anthropic)**

---

# 1. Frontend (Client Layer)

**Location:** `/public/index.html`
**Hosted on:** Vercel (static)

### Responsibilities

* Capture user input (free-text food descriptions)
* Send requests to backend API
* Render stored entries
* Handle UI state (loading, errors, results)

### Key behaviors

* Sends POST requests to `/api/log-food`
* Fetches stored data from `/api/get-entries`
* Does not store sensitive data (no API keys)

---

# 2. Backend API (Serverless Layer)

**Location:** `/api/*`
**Runtime:** Vercel serverless (Node.js)

### Endpoints

#### `/api/log-food`

* Accepts user input
* Calls Anthropic API (Claude)
* Parses structured nutrition data
* Stores result in Firebase

#### `/api/get-entries`

* Fetches stored entries from Firestore
* Returns ordered results (latest first)

---

### Responsibilities

* Secure handling of API keys (never exposed to client)
* Input validation and request control
* Orchestration between AI and database
* Error handling and response normalization

---

# 3. AI Layer (Anthropic Claude)

**Service:** Anthropic Messages API
**Model:** Claude Haiku (lightweight model for cost efficiency)

### Responsibilities

* Convert natural language food descriptions into structured nutrition data

### Input

```text
"2 eggs and toast with butter"
```

### Output (JSON)

```json
{
  "food": "eggs and toast with butter",
  "portion": "2 eggs + 2 slices toast + butter",
  "calories": 350,
  "protein_g": 18,
  "carbs_g": 30,
  "fat_g": 20,
  "tags": ["breakfast", "eggs"]
}
```

---

# 4. Data Layer (Firebase Firestore)

**Service:** Firebase Firestore
**Accessed via:** Firebase Admin SDK (server-side only)

### Collection

```text
entries
```

### Document structure

```json
{
  "food": string,
  "portion": string,
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "tags": string[],
  "timestamp": string (ISO)
}
```

---

### Responsibilities

* Persistent storage of food logs
* Querying entries (ordered by timestamp)
* Supporting future filtering/search (via tags/macros)

---

# 5. Data Flow

```text
User Input (Frontend)
        ↓
POST /api/log-food
        ↓
Vercel Function
        ↓
Anthropic API (parse food → JSON)
        ↓
Normalize + validate
        ↓
Firebase Firestore (store entry)
        ↓
Response returned to frontend
        ↓
Frontend refreshes entries via /api/get-entries
```

---

# 6. Security Model

### Protected

* `ANTHROPIC_API_KEY`
* `FIREBASE_SERVICE_ACCOUNT`

Stored as:

```text
Vercel Environment Variables
```

### Guarantees

* No secrets exposed to client
* All external API calls happen server-side
* Firebase accessed only via Admin SDK

---

# 7. Deployment Architecture

### GitHub

* Source of truth for code

### Vercel

* Builds and deploys frontend + API
* Injects environment variables at runtime
* Handles serverless execution

### Firebase

* Stores persistent data
* No direct client access

---

# 8. Key Design Decisions

### Serverless backend

* Eliminates need for dedicated server
* Scales automatically

### AI parsing instead of manual entry

* Allows flexible natural language input
* Reduces user friction

### Firestore (NoSQL)

* Flexible schema for evolving data
* Efficient for time-based queries

### Haiku model selection

* Lower cost than larger models
* Sufficient for structured parsing tasks

---

# 9. Current Limitations

* No authentication (single-user implicit model)
* No rate limiting on API routes
* AI output depends on model consistency
* No caching (duplicate requests cost tokens)
* Basic UI (no advanced filtering or analytics yet)

---

# 10. Future Extensions

* Search/filter endpoints (by tags, macros, date)
* Daily/weekly summaries
* User authentication
* Rate limiting / quota control
* Caching repeated food entries
* Enhanced UI (charts, trends, macro targets)

---

If you want, I can also generate:

* a shorter “project overview” version
* or a diagram-style README with visuals instead of text-heavy sections

