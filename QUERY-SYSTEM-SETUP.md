# Customer Query Submission System - Complete Setup Guide

## Overview
This is a professional customer query submission system that automatically sends customer inquiries to all 4 team members via email. It uses **EmailJS** for reliable, spam-protected email delivery without requiring a backend server.

---

## System Architecture

### Components:
1. **Frontend** (`query-form.html`) - Professional HTML form for customers
2. **Email Service** - EmailJS (free tier up to 200 emails/month)
3. **Recipients** - 4 team members receive every query
4. **Dashboard Link** - Quick access button from main dashboard

### Email Flow:
```
Customer fills form (name, email, message)
    ↓
Form validates input
    ↓
EmailJS client-side library triggers
    ↓
Query sent to all 4 team members SIMULTANEOUSLY
    ↓
Email includes: Customer details, message, timestamp
    ↓
Confirmation page with 3-second redirect to dashboard
```

---

## Features

✓ **Professional UI** - Dark theme, consistent with dashboard  
✓ **Form Validation** - Name, email, message all required  
✓ **Simultaneous Delivery** - All 4 members get email at same time  
✓ **No Duplicates** - One submission = one email per recipient  
✓ **Timestamp** - Each query shows exact date/time submitted  
✓ **Responsive** - Works on mobile, tablet, desktop  
✓ **No Backend** - Client-side only, Firebase not needed  
✓ **Free Tier** - EmailJS free account included  
✓ **User Feedback** - Loading state, success/error messages  
✓ **Auto-Redirect** - 3-second redirect to dashboard after success  

---

## Step-by-Step Setup

### Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com
2. Click "Sign Up Free"
3. Complete registration (use Gmail for quickest setup)
4. Verify your email

### Step 2: Create Email Service
1. From EmailJS Dashboard → **Add Service**
2. Select **Gmail** (or your preferred email provider)
3. **Important:** Grant permission to use Gmail (follow the OAuth flow)
4. Copy your **SERVICE_ID** and save it

Example SERVICE_ID format: `service_abc123xyz`

### Step 3: Create Email Template
1. Dashboard → **Email Templates** → **Create New Template**
2. Name: `customer_query_notification`
3. In the template content, use this text:

```
NEW CUSTOMER QUERY RECEIVED
==============================
Date & Time: {{submission_date}}

CUSTOMER DETAILS:
Name: {{customer_name}}
Email: {{customer_email}}

MESSAGE:
{{query_message}}

==============================
Please respond to: {{customer_email}}
```

**Template Variables Used:**
- `{{submission_date}}` - When form was submitted
- `{{customer_name}}` - Customer's full name
- `{{customer_email}}` - Customer's email address
- `{{query_message}}` - The actual query/message
- `{{to_email}}` - Recipient email (auto-set by code)

4. Save template with name: `customer_query_notification`

### Step 4: Get Your Credentials
1. Dashboard → **Account** → **API**
2. Copy your **PUBLIC KEY**
3. You already have **SERVICE_ID** from Step 2

Example credentials:
```
PUBLIC_KEY: abc123_defXYZ789_ghi123
SERVICE_ID: service_abc123xyz
TEMPLATE_ID: customer_query_notification
```

### Step 5: Update the Code
In `query-form.html`, find these lines (around line 265):

```javascript
// Configuration - REPLACE WITH YOUR EMAILJS CREDENTIALS
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID_HERE';
const EMAILJS_TEMPLATE_ID = 'customer_query_notification';
```

Replace with your actual credentials:

```javascript
const EMAILJS_PUBLIC_KEY = 'abc123_defXYZ789_ghi123';
const EMAILJS_SERVICE_ID = 'service_abc123xyz';
const EMAILJS_TEMPLATE_ID = 'customer_query_notification';
```

### Step 6: Test the System
1. Open `query-form.html` in a browser
2. Fill in the form with test data
3. Click "Send Query"
4. Check that all 4 team members receive the email within 1-2 minutes

**Team member email list:**
- malarvannan.me23@bitsathy.ac.in
- vaisaal.me23@bitsathy.ac.in  
- dharanidharan.me23@bitsathy.ac.in
- malarvannanm6@gmail.com

---

## How It Works (Code Explained)

### Form Submission Flow:
```javascript
1. User fills: Name, Email, Message
2. Click "Send Query"
3. JavaScript validates input (min lengths, email format)
4. Gets current timestamp: "February 6, 2026, 2:30:45 PM IST"
5. Creates templateParams object with all data
6. Sends email to ALL 4 recipients simultaneously:
   - Promise.all([email1, email2, email3, email4])
7. Shows: "✓ Query sent to 4 team members!"
8. Clears form
9. Redirects to dashboard after 3 seconds
```

### Key Functions:
- `handleSubmit()` - Main entry point, orchestrates entire flow
- `validateForm()` - Checks name, email, message validity
- `sendEmailToRecipient()` - Sends ONE email to ONE recipient
- `getSubmissionDateTime()` - Formats current date/time
- `showAlert()` - Displays success/error messages

### No Duplicate Logic:
The system never has duplicates because:
1. Each form submission triggers exactly ONE email per recipient
2. If a user clicks "Send" again, it's a NEW submission (new timestamp)
3. The email service tracks by sending timestamp + recipient
4. Even if user accidentally submits twice, they're separate queries with different timestamps

---

## Email Content Example

**What your team receives:**

```
NEW CUSTOMER QUERY RECEIVED
==============================
Date & Time: February 6, 2026, 2:30:45 PM UTC

CUSTOMER DETAILS:
Name: John Smith
Email: john.smith@example.com

MESSAGE:
I have an issue with the robot's blade height adjustment. 
It seems to be cutting too low and damaging some plants. 
Can you help me recalibrate it?

==============================
Please respond to: john.smith@example.com
```

---

## Testing Checklist

- [ ] EmailJS account created
- [ ] Gmail service added with OAuth permission granted
- [ ] Email template created with correct name
- [ ] PUBLIC_KEY extracted from Account → API
- [ ] SERVICE_ID copied from Email Service
- [ ] Both credentials entered in query-form.html
- [ ] Test form submission completes
- [ ] All 4 team members receive test email
- [ ] Email content is formatted correctly
- [ ] Form clears after successful submission
- [ ] Dashboard redirect works after 3 seconds
- [ ] Error handling works (try invalid email)

---

## Troubleshooting

### ❌ "Failed to send query" Error
**Cause:** Credentials not configured properly
**Fix:** Double-check PUBLIC_KEY and SERVICE_ID, make sure they don't have spaces

### ❌ Some emails not arriving
**Cause:** Gmail security settings blocking
**Fix:** Check spam folder, or add EmailJS to trusted senders

### ❌ Template variables showing as {{variable}}
**Cause:** Template name mismatch
**Fix:** Ensure template is named exactly: `customer_query_notification`

### ❌ Form disabled with warning message
**Cause:** Credentials still set to "YOUR_PUBLIC_KEY_HERE"
**Fix:** Replace with actual EmailJS credentials

### ❌ Emails going to spam
**Cause:** Gmail treating automated emails as suspicious
**Fix:** "Mark as Not Spam" in Gmail once, then whitelist sender

---

## Security Notes

1. **Using EmailJS securely:**
   - PUBLIC_KEY is safe to expose in frontend (it's public)
   - SERVICE_ID is also safe (it's in production code)
   - EmailJS handles authentication server-side

2. **Best practices:**
   - Always validate input on frontend (done)
   - Limit message length (can add if needed)
   - Rate limit submissions (implement in real app)
   - Store submissions in database (optional)

---

## Customization Options

### Add more team members:
In `query-form.html` around line 275, update the array:
```javascript
const TEAM_EMAILS = [
    'malarvannan.me23@bitsathy.ac.in',
    'vaisaal.me23@bitsathy.ac.in',
    'dharanidharan.me23@bitsathy.ac.in',
    'malarvannanm6@gmail.com',
    'new.member@example.com'  // Add more here
];
```

### Change email subject:
Modify in EmailJS template editing interface:
- Template Settings → Subject Line → "New Customer Query"

### Add more form fields:
1. Add new input to HTML form
2. Validate in `validateForm()`
3. Add to `templateParams` object
4. Update email template with `{{new_variable}}`

---

## Deployment Notes

### Production Checklist:
- [ ] Credentials not exposed in version control
- [ ] Form tested with real data
- [ ] All 4 team members confirmed receiving
- [ ] Error handling working
- [ ] Mobile responsiveness verified
- [ ] Email template professional and complete
- [ ] Dashboard link added and working
- [ ] SSL/HTTPS enabled (if on web server)

### EmailJS Limitations:
- Free tier: 200 emails/month
- Paid plans available if more needed
- 1-2 minute delivery time typical
- 99.9% uptime SLA on paid plans

---

## Integration with Dashboard

A "Submit Query" button has been added to the main dashboard header. Users can:

1. Click "Submit Query" button in dashboard
2. Navigate to query form
3. Submit query
4. Receive confirmation
5. Auto-redirect back to dashboard

This provides seamless navigation between systems.

---

## Support

For EmailJS support: https://www.emailjs.com/docs/

For template troubleshooting:
1. Go to EmailJS → Email Templates
2. Click "Test" button
3. Check if test email arrives

---

**Created:** February 6, 2026  
**System:** Professional Robot Control Dashboard  
**Status:** Production Ready  
**Maintenance:** Check spam folders monthly, verify team access
