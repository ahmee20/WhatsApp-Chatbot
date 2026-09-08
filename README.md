# AI-Powered WhatsApp Booking Agent & HubSpot CRM Revenue Analytics Dashboard

An end-to-end intelligent appointment scheduling and revenue analytics solution for dental clinics and service businesses. 

This repository combines:
1. **An Autonomous n8n AI Agent**: Handles WhatsApp text and voice note interactions, consults a Google Sheets service catalog, checks real-time availability in Google Calendar, sends Gmail confirmation notifications, and records lead/booking data directly in **HubSpot CRM**.
2. **A Real-Time Revenue Analytics Dashboard**: Built with **React**, **Tailwind CSS**, and **Recharts**, with a local **Express API Proxy** to monitor actual revenue (completed visits), estimated revenue (active pipeline), service breakdowns, cancellation rates, and customer booking logs.

---

## 🏗️ System Architecture

```
                       +-------------------------------+
                       |    WhatsApp User (Voice/Text)  |
                       +---------------+---------------+
                                       |
                                       v
                       +-------------------------------+
                       |   n8n Automation Workflow     |
                       | - WhatsApp Trigger            |
                       | - Audio Download & Whisper    |
                       | - Qwen AI Agent + Buffer Mem  |
                       +---------------+---------------+
                                       |
         +-----------------------------+-----------------------------+
         |                             |                             |
         v                             v                             v
+------------------+         +--------------------+        +--------------------+
|  Google Sheets   |         |  Google Calendar   |        |    Gmail API       |
| (Service Catalog)|         | (Booking/Slots)    |        | (Confirmations)    |
+------------------+         +--------------------+        +--------------------+
                                       |
                                       v
                         +---------------------------+
                         |     HubSpot CRM (v3)      |
                         |  Custom Contact Record    |
                         +-------------+-------------+
                                       |
                                       v
                         +---------------------------+
                         |  Express Backend Proxy    |
                         |  (Port 3001, CORS & Auth) |
                         +-------------+-------------+
                                       |
                                       v
                         +---------------------------+
                         |   React + Tailwind CSS    |
                         |    Analytics Dashboard    |
                         +---------------------------+
```

---

## 🤖 1. WhatsApp AI Agent (n8n Workflow)

The n8n workflow (`whatsapp_workflow.json`) orchestrates the customer booking lifecycle:

### Workflow Capabilities
- **Voice & Audio Processing**:
  - Automatically identifies incoming audio/voice messages.
  - Downloads media securely via WhatsApp Cloud API.
  - Transcribes voice notes into text using **OpenAI Whisper**.
- **AI Agent Intelligence**:
  - Powered by **Qwen Cloud Chat Model (`qwen3.7-flash`)** with sliding window conversation memory keyed by the user's WhatsApp ID.
  - Understands queries in English, Hindi, and Urdu (responding in Roman Urdu or English as appropriate).
- **Tool Integrations**:
  1. **Google Sheets Tool**: Retrieves dental services, pricing, and procedures from the catalog.
  2. **Google Calendar Tools**:
     - `Get availability in calendar`: Evaluates available slots using ISO 8601 time formats.
     - `Create an event in Google Calendar`: Books confirmed slots with the event description formatted as `Client Name + Service`.
     - `Update an event` / `Delete an event`: Allows rescheduling or cancellations using calendar event reference IDs.
  3. **Gmail Tool**: Automatically emails appointment details and reference numbers to the client upon confirmation.
  4. **WhatsApp Message Tool**: Dispatches final confirmation replies directly in the chat.
  5. **HubSpot CRM Tool**: Creates or updates contacts with custom booking properties.

---

## 📊 2. Revenue Analytics Dashboard

Built using modern **React + Tailwind CSS** with a minimal, clean, white-theme editorial aesthetic (zero bounding boxes, clean typography, no glow effects, and light-theme charts).

### Core Features

- **Actual Revenue vs. Estimated Revenue**:
  - **Actual Revenue**: Strictly calculates the sum of `service_cost` for records where `booking_status === 'visited'`.
  - **Estimated Revenue**: Strictly calculates the sum of all records **except** those marked `'cancelled'` (i.e. `'visited'` + `'Confirmed'`).
  - **Dedicated Trend Graphs**: Individual, dedicated area trend charts for both Actual Revenue and Estimated Revenue.
- **Revenue by Service (Pie Chart)**:
  - Interactive Pie chart breaking down revenue contributions by service with a toggle between Estimated and Actual revenue.
- **Cancellation vs. Booking Rate (Bar Chart)**:
  - Clean horizontal Bar chart comparing Visited (attended), Confirmed (upcoming), and Cancelled bookings alongside loss metrics.
- **Timeframe Filtering**:
  - Dynamically filter data by **Day (24h)**, **Week (7d)**, **Month (30d)**, or **All Time**.
- **Customer Bookings Explorer**:
  - Full data table displaying Customer Name, User Email, Phone Number, Service Booked, Cost, Booking Date (formatted for Google Calendar), and Booking Status.
  - Searchable by customer name, email, phone, or service.
  - Filterable by service and status.
  - Built-in **Export CSV** function.
- **Secure Backend API Proxy**:
  - Express server (`server/index.js`) keeps the HubSpot Private App token private (never exposed to browser clients) and handles CORS.
  - Built-in demo fallback mode ensures the dashboard works immediately out of the box even before API tokens are supplied.

---

## 🏷️ 3. HubSpot CRM Custom Properties Mapping

The n8n workflow and the dashboard share the following schema in HubSpot:

| Data Field | HubSpot Internal Name | Configurable in `.env` | Values / Format |
| :--- | :--- | :--- | :--- |
| **User Email** | `email` (or `user_email`) | Default contact field | `patient@example.com` |
| **First Name** | `firstname` | Default contact field | Text |
| **Last Name** | `lastname` | Default contact field | Text |
| **Phone Number**| `phone` (or `contact_num`) | Default contact field | `+1 (555) 000-0000` |
| **Service Booked** | `services` | `HUBSPOT_PROP_SERVICE` | `Strategy Consultation`, `Audit`, etc. |
| **Service Cost** | `service_cost` | `HUBSPOT_PROP_COST` | Number / Currency (e.g. `250`) |
| **Booking Date** | `booking_date` | `HUBSPOT_PROP_BOOKING_DATE` | ISO 8601 (e.g. `2026-09-08T14:30:00Z`) |
| **Booking Status**| `booking_status` | `HUBSPOT_PROP_BOOKING_STATUS` | `'Confirmed'`, `'visited'`, `'cancelled'` |

---

## 🛠️ 4. Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/)
- A HubSpot Account with admin permissions
- (For the chatbot) An active [n8n](https://n8n.io/) instance

---

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/ahmee20/WhatsApp-Chatbot.git
cd WhatsApp-Chatbot
npm install
```

---

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your HubSpot credentials:
```env
# HubSpot Private App Access Token (starts with pat-na1-... or pat-eu1-...)
HUBSPOT_ACCESS_TOKEN=your_hubspot_token_here

# Backend Proxy Server Port
PORT=3001

# HubSpot Property Mappings
HUBSPOT_PROP_SERVICE=services
HUBSPOT_PROP_COST=service_cost
HUBSPOT_PROP_BOOKING_DATE=booking_date
HUBSPOT_PROP_BOOKING_STATUS=booking_status

# Fallback to realistic demo data if token is not set
USE_MOCK_FALLBACK=true
```

---

### Step 3: Run the Dashboard
Run both the frontend client and backend proxy concurrently:

```bash
npm start
```
*(or `npm run dev`)*

- **Dashboard UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001/api/bookings](http://localhost:3001/api/bookings)

---

## 🔑 5. Obtaining HubSpot Credentials (Step-by-Step)

1. Log in to [app.hubspot.com](https://app.hubspot.com) with an Administrator account.
2. Click the **Settings gear icon (⚙️)** in the top right navigation bar.
3. In the left sidebar, navigate to **Account Setup > Integrations > Private Apps**.
4. Click the orange **"Create a private app"** button.
5. Under the **Basic Info** tab, enter a name (e.g., `WhatsApp Booking Revenue Dashboard`).
6. Under the **Scopes** tab, search for and check:
   - ✅ `crm.objects.contacts.read` (Required for dashboard)
   - ✅ `crm.objects.contacts.write` (Required for n8n to record contacts)
7. Click **Create app** > **Continue creating**.
8. Click **Show token**, copy your token (e.g. `pat-na1-...`), and paste it into `.env` under `HUBSPOT_ACCESS_TOKEN`.

---

## 📈 6. Revenue Calculation Logic

$$\text{Actual Revenue} = \sum_{\text{status} = \text{'visited'}} \text{service\_cost}$$

$$\text{Estimated Revenue} = \sum_{\text{status} \ne \text{'cancelled'}} \text{service\_cost} = \sum_{\text{status} \in \{\text{'visited'}, \text{'Confirmed'}\}} \text{service\_cost}$$

$$\text{Cancellation Rate} = \left( \frac{\text{Cancelled Bookings}}{\text{Total Bookings}} \right) \times 100\%$$

---

## 📁 Repository Structure

```
.
├── whatsapp_workflow.json   # Exported n8n workflow for WhatsApp AI Agent
├── package.json             # Scripts and dependencies
├── vite.config.js           # Vite frontend configuration with /api proxy
├── tailwind.config.js       # Tailwind design system configuration
├── postcss.config.js        # PostCSS configuration
├── .env.example             # Environment variable template
├── HUBSPOT_SETUP.md         # Detailed HubSpot credentials guide
├── README.md                # Comprehensive documentation
├── server/
│   ├── index.js             # Express backend proxy
│   └── hubspotService.js    # HubSpot API v3 connector & demo data fallback
└── src/
    ├── main.jsx             # React entrypoint
    ├── App.jsx              # Main dashboard application
    ├── index.css            # Tailwind directives & typography
    ├── components/
    │   ├── Navbar.jsx       # Header with timeframe filter & credentials guide
    │   ├── MetricCards.jsx  # KPI summary cards
    │   ├── RevenueCharts.jsx # Dedicated Actual & Estimated Revenue trend charts
    │   ├── ServiceChart.jsx # Pie chart for Revenue by Service
    │   ├── CancellationChart.jsx # Bar chart for Cancellation vs Booking Rate
    │   ├── BookingsTable.jsx# Searchable customer table with CSV export
    │   └── HubSpotGuideModal.jsx # In-app credentials helper modal
    ├── hooks/
    │   └── useBookings.js   # State management & revenue calculation formulas
    └── utils/
        ├── formatters.js    # Currency, percentage, and date formatters
        └── mockData.js      # Client-side fallback generator
```

---

## 📄 License
MIT License. Built for seamless clinic scheduling and revenue intelligence.
