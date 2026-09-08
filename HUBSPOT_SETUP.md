# HubSpot CRM Integration & Credentials Guide

This guide walks you through setting up your HubSpot CRM credentials and configuring the custom properties required for this booking and revenue analytics dashboard.

---

## 1. Credentials You Need

To connect this dashboard to your HubSpot CRM securely, you only need:
1. **HubSpot Private App Access Token** (starts with `pat-na1-...` or `pat-eu1-...`)

*(Previously HubSpot used legacy API keys, which have been deprecated in favor of Private App Tokens for higher security and scoped permissions).*

---

## 2. Step-by-Step: How to Get Your Access Token

### Step 1: Log in to your HubSpot Account
Go to [app.hubspot.com](https://app.hubspot.com) and log in with an Administrator or super-admin account.

### Step 2: Open Settings
Click on the **Settings gear icon (⚙️)** in the top navigation bar (upper right corner).

### Step 3: Navigate to Private Apps
In the left sidebar menu:
1. Scroll down to **Account Setup** > **Integrations**.
2. Click on **Private Apps**.
   *(Direct URL: `https://app.hubspot.com/settings/{YOUR_PORTAL_ID}/integrations/private-apps`)*

### Step 4: Create a New Private App
1. Click the orange **"Create a private app"** button.
2. In the **Basic Info** tab:
   - **Name**: e.g., `Booking Revenue Dashboard`
   - **Description**: `Private app token for reading booking data and revenue metrics.`
   - (Optional) Upload an icon.

### Step 5: Configure Required Scopes (Permissions)
1. Click on the **Scopes** tab.
2. Under the **CRM** category, find and select the following scopes:
   - ✅ `crm.objects.contacts.read` (Read contact records)
   - *(Optional if you also store bookings as Deals)*: `crm.objects.deals.read`
   - *(Optional if you use Custom Objects)*: `crm.objects.custom.read`
3. Check the box to grant **Read** permission for contacts.

### Step 6: Create & Copy the Token
1. Click **"Create app"** in the top right.
2. Review the prompt and click **"Continue creating"**.
3. In the modal that appears, click **"Show token"** and then **"Copy"**.
   > ⚠️ **Important**: Copy this token immediately! HubSpot will only show it to you once in its entirety for security reasons.

### Step 7: Paste Token in your `.env` File
Open `.env` in the root of this project and paste your token:
```env
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 3. HubSpot Custom Contact Properties Setup

The dashboard reads the following fields for each booking record. If these custom properties do not yet exist in your HubSpot CRM, here is how to create them:

### Step 1: Go to Properties Settings
1. Click the **Settings gear icon (⚙️)**.
2. In the left sidebar under **Data Management**, click **Properties**.
3. Ensure the object type selected is **Contact properties** (or Deals if you record bookings as Deals).

### Step 2: Verify or Create the Custom Properties

| Property Label | Field Type | Default Internal Name | Description / Example Values |
| :--- | :--- | :--- | :--- |
| **Services** | Single-line text or Dropdown | `services` | e.g. `Consultation`, `Follow-up`, `Full Treatment`, `Diagnostic` |
| **Service Cost** | Number / Currency | `service_cost` | e.g. `150`, `300`, `75` |
| **Booking Date** | Date or Date-Time picker | `booking_date` | Date/time format matching Google Calendar e.g. `2026-09-08T14:00:00Z` |
| **Booking Status** | Dropdown select or Text | `booking_status` | Options: `Confirmed`, `visited`, `cancelled` |

### Step 3: Check the Internal Name
In HubSpot, property labels can differ from their **Internal Name** (API name):
1. In **Settings > Properties**, click on your property.
2. Look at the code icon `</>` next to the label to see the **Internal Name**.
3. If your internal names are different (for example `service_booked` instead of `services`), simply update the mappings in `.env`:
   ```env
   HUBSPOT_PROP_SERVICE=your_custom_internal_name
   HUBSPOT_PROP_COST=your_cost_internal_name
   HUBSPOT_PROP_BOOKING_DATE=your_date_internal_name
   HUBSPOT_PROP_BOOKING_STATUS=your_status_internal_name
   ```

---

## 4. Standard Contact Fields Used

The dashboard automatically reads HubSpot's built-in standard contact fields:
- `email` (User email)
- `firstname` (First name)
- `lastname` (Last name)
- `phone` (Contact number)

---

## 5. Revenue Calculation Rules in Dashboard

- **Actual Revenue**: Sum of `service cost` for records where `booking_status` is `'visited'`.
- **Estimated Revenue**: Sum of `service cost` for all records except those where `booking_status` is `'cancelled'` (i.e. `'visited'` + `'Confirmed'`).
- **Cancellation Rate**: `(Cancelled Bookings / Total Bookings) * 100%`.
- **Completion Rate**: `(Visited Bookings / Total Bookings) * 100%`.
