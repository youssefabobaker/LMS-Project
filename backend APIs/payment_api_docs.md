# 💳 Payment Controller — API Documentation

> **Base URL:** `https://{your-domain}/api/Payment`  
> **Auth:** JWT Bearer Token required (except Webhook)  
> **Content-Type:** `application/json`

---

## Overview

The Payment controller integrates with **Paymob** as the payment gateway.  
The typical payment flow is:

```
Frontend                      Backend                     Paymob
   │                              │                          │
   │──POST /api/Payment/Start──►  │                          │
   │                              │──Create Order + Fees──►  │
   │                              │◄──Payment URL ──────────  │
   │◄──{ paymentUrl }────────────  │                          │
   │                              │                          │
   │──Redirect to paymentUrl────────────────────────────────►│
   │                              │                          │
   │                              │◄──POST /webhook (HMAC)──  │
   │                              │──Verify & Update DB───►  │
```

---

## Endpoints

---

### 1. Start Payment

Initiates a new payment session for the authenticated student. Returns a Paymob payment URL to redirect the user to.

| Property       | Value                        |
|----------------|------------------------------|
| **Method**     | `POST`                       |
| **URL**        | `/api/Payment/Start`         |
| **Auth**       | ✅ Bearer JWT Token required  |
| **Body**       | _(empty — no request body)_  |

#### ✅ Success Response — `200 OK`

```json
{
  "paymentUrl": "https://accept.paymob.com/api/acceptance/iframes/...?payment_token=..."
}
```

| Field        | Type     | Description                                              |
|--------------|----------|----------------------------------------------------------|
| `paymentUrl` | `string` | Redirect the student to this URL to complete the payment |

#### ❌ Error Responses

| Status | Condition                                           | Body                                    |
|--------|-----------------------------------------------------|-----------------------------------------|
| `401`  | Missing or invalid JWT token                        | _(Unauthorized — no body)_              |
| `404`  | Student account not found                           | `"Student not found"`                   |
| `500`  | Student already paid / Fee config issue / Any error | Error message string                    |

> **⚠️ Already Paid:** If the student has already completed payment for the current academic year, the backend throws `"Already paid"` and returns a `500`. Handle this gracefully in the UI (show a "You've already paid" message instead of a generic error).

#### Frontend Integration Example

```javascript
async function startPayment(token) {
  const response = await fetch('/api/Payment/Start', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const { paymentUrl } = await response.json();
  
  // Redirect to Paymob payment page
  window.location.href = paymentUrl;
}
```

---

### 2. Payment Webhook *(Paymob → Backend)*

This endpoint is **called by Paymob**, not by your frontend. It receives the payment result after the user completes or fails a payment on Paymob's hosted page.

> **ℹ️ Note:** You do **not** need to call this endpoint from the frontend. However, you need to know about it to handle the **redirect** that happens after Paymob finishes.

| Property       | Value                                         |
|----------------|-----------------------------------------------|
| **Method**     | `POST`                                        |
| **URL**        | `/api/Payment/webhook`                        |
| **Auth**       | ❌ No JWT required (called by Paymob server)  |
| **Body**       | Raw JSON (Paymob webhook payload)             |
| **Query Param**| `?hmac=` — HMAC signature for verification   |

#### Webhook Request Body (sent by Paymob)

```json
{
  "obj": {
    "id": 123456789,
    "pending": false,
    "amount_cents": 50000,
    "success": true,
    "is_auth": false,
    "is_capture": false,
    "is_standalone_payment": true,
    "is_voided": false,
    "is_refunded": false,
    "is_3d_secure": true,
    "integration_id": 1234,
    "profile_id": 5678,
    "has_parent_transaction": false,
    "created_at": "2024-01-15T10:30:00Z",
    "currency": "EGP",
    "owner": 999,
    "error_occured": false,
    "order": {
      "id": 11111,
      "merchant_order_id": "42"
    },
    "source_data": {
      "type": "card",
      "pan": "1234",
      "sub_type": "MasterCard"
    }
  },
  "hmac": "abc123...",
  "type": "TRANSACTION",
  "id": "evt_xyz"
}
```

#### Webhook Response — `200 OK`

```json
{
  "success": true,
  "orderId": 11111,
  "transactionId": 123456789
}
```

| Field           | Type      | Description                                    |
|-----------------|-----------|------------------------------------------------|
| `success`       | `boolean` | `true` = payment succeeded, `false` = failed   |
| `orderId`       | `int`     | Paymob order ID                                |
| `transactionId` | `long`    | Paymob transaction ID                          |

---

## Post-Payment Redirect Handling *(Frontend)*

After the user completes payment on Paymob's hosted page, Paymob redirects them back to your configured **return URL** (e.g., `https://yourapp.com/payment/result`).

Paymob appends query parameters to the return URL:

```
https://yourapp.com/payment/result
  ?success=true
  &id=123456789
  &order=11111
  &merchant_order_id=42
  &amount_cents=50000
  &currency=EGP
  &error_occured=false
  &pending=false
  ...and more
```

### Key Query Parameters from Paymob Redirect

| Parameter           | Type      | Description                          |
|---------------------|-----------|--------------------------------------|
| `success`           | `boolean` | `true` if payment was successful     |
| `pending`           | `boolean` | `true` if payment is still pending   |
| `error_occured`     | `boolean` | `true` if there was an error         |
| `id`                | `number`  | Paymob transaction ID                |
| `order`             | `number`  | Paymob order ID                      |
| `merchant_order_id` | `string`  | Your internal payment/order ID       |
| `amount_cents`      | `number`  | Amount paid in cents (÷100 for EGP)  |
| `currency`          | `string`  | Currency code (e.g., `"EGP"`)        |

### Example Result Page Handler

```javascript
// On your /payment/result page
const params = new URLSearchParams(window.location.search);

const success = params.get('success') === 'true';
const pending = params.get('pending') === 'true';
const errorOccured = params.get('error_occured') === 'true';
const amountCents = parseInt(params.get('amount_cents') || '0');
const amountEGP = amountCents / 100;

if (success && !pending && !errorOccured) {
  showSuccessMessage(`Payment of ${amountEGP} EGP completed successfully!`);
} else if (pending) {
  showPendingMessage('Your payment is being processed. Please wait.');
} else {
  showFailureMessage('Payment failed. Please try again.');
}
```

---

## Payment Status Values

These are the possible internal payment statuses stored in the database:

| Value | Name        | Description                              |
|-------|-------------|------------------------------------------|
| `0`   | `Pending`   | Payment created, awaiting completion     |
| `1`   | `Paid`      | Payment successfully completed           |
| `2`   | `Failed`    | Payment failed or HMAC mismatch          |
| `3`   | `Cancelled` | Payment was cancelled                    |
| `4`   | `Refunded`  | Payment was refunded                     |

---

## Complete Frontend Flow Summary

```
1. User clicks "Pay Now"
   └─► POST /api/Payment/Start  (with Bearer token, no body)
       ├─► 404 → "Student not found"  → Show error
       ├─► 500 "Already paid"         → Show "Already paid" message
       └─► 200 { paymentUrl }         → window.location.href = paymentUrl

2. User is redirected to Paymob hosted payment page
   └─► User enters card details

3. Paymob calls POST /api/Payment/webhook  (server-to-server, not frontend)
   └─► Backend verifies HMAC, updates payment status in DB

4. Paymob redirects user back to your configured return URL
   └─► Parse query params from URL
       ├─► success=true  → Show success screen  ✅
       ├─► pending=true  → Show pending screen  ⏳
       └─► error/failure → Show failure screen  ❌
```

---

## Developer Notes

- Always send the **JWT Bearer token** in the `Authorization` header for the `/Start` endpoint.
- **Do not** call the webhook endpoint from the frontend — it is exclusively for Paymob's server callbacks.
- The `paymentUrl` returned by `/Start` is a fully-formed Paymob URL — redirect directly to it.
- The payment amount is calculated **automatically** on the backend based on the student's academic year and department fees — no amount is needed in the request body.
- Currency is always **`EGP`** (Egyptian Pounds).
- Paymob returns `amount_cents`, so divide by **100** to display the amount in EGP on the result page.
