# CUSTOMER QUERY SYSTEM - QUICK SETUP (5 Minutes)

## TLDR Setup Instructions

### 1️⃣ Create EmailJS Account (1 min)
Visit: https://www.emailjs.com → Sign Up Free

### 2️⃣ Create Gmail Service (1 min)
- Dashboard → Add Service
- Select: Gmail
- Grant OAuth permission
- **Copy SERVICE_ID**

### 3️⃣ Create Email Template (1 min)
- Dashboard → Email Templates → Create New
- **Name:** `customer_query_notification`
- **Content:**
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

### 4️⃣ Get Credentials (1 min)
- Account → API
- **Copy PUBLIC_KEY**

### 5️⃣ Update Code (1 min)
In `query-form.html` line ~265:

```javascript
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID_HERE';
```

Replace with your actual keys (no spaces).

---

## Files Included

1. **query-form.html** - Professional customer query form
2. **QUERY-SYSTEM-SETUP.md** - Full documentation
3. **Updated dashboard.html** - Added "Submit Query" button

---

## Team Email Recipients

✉️ malarvannan.me23@bitsathy.ac.in  
✉️ vaisaal.me23@bitsathy.ac.in  
✉️ dharanidharan.me23@bitsathy.ac.in  
✉️ malarvannanm6@gmail.com

---

## How It Works

```
Customer submits form
    ↓
Validation (name, email, message)
    ↓
Send to ALL 4 team members simultaneously
    ↓
Each gets: Name + Email + Message + Timestamp
    ↓
Show confirmation
    ↓
Auto-redirect to dashboard
```

**Key Feature:** No duplicates! Each submission = 1 email per recipient.

---

## Features

✅ Dark theme professional UI  
✅ Form validation (email format, min length)  
✅ Simultaneous delivery to 4 members  
✅ Timestamp on each query  
✅ Success/error messages with icons  
✅ Auto-redirect after submit  
✅ Responsive mobile design  
✅ NO backend server needed  
✅ Free EmailJS tier (200/month)  

---

## Test It

1. Open query-form.html
2. Fill form (any test data)
3. Click "Send Query"
4. Check all 4 team emails within 2 minutes
5. Should receive identical emails with customer details

---

## Credentials Format

**PUBLIC_KEY example:**  
`abc123defXYZ789ghiJKL456mno`

**SERVICE_ID example:**  
`service_abc123xyz789def`

**Template ID:**  
`customer_query_notification` (const, don't change)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to send query" | Check credentials, remove extra spaces |
| Form stays disabled | Credentials not set, check line 265 |
| Emails in spam | Check spam folder, then mark as "Not Spam" |
| Template variables showing | Template name must be exactly: `customer_query_notification` |
| Some emails missing | Check all 4 email addresses are correct |

---

## Production Checklist

- [ ] Sign up for EmailJS
- [ ] Create Gmail service with OAuth
- [ ] Create email template with correct name
- [ ] Copy PUBLIC_KEY and SERVICE_ID
- [ ] Update query-form.html with credentials
- [ ] Test form submission completes
- [ ] Verify all 4 team members receive test email
- [ ] Check email formatting looks professional
- [ ] Mobile responsive testing done
- [ ] Error handling verified
- [ ] Dashboard link working

---

**Ready to deploy!** Once setup complete, customers can click "Submit Query" from dashboard.

For detailed docs: See `QUERY-SYSTEM-SETUP.md`
