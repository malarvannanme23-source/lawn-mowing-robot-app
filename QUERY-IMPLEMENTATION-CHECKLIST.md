# CUSTOMER QUERY SYSTEM - IMPLEMENTATION CHECKLIST

## Complete Setup Walkthrough

Use this checklist to ensure everything is set up correctly. Check off each item as you complete it.

---

## PHASE 1: EmailJS Setup (10 minutes)

### Create EmailJS Account
- [ ] Go to https://www.emailjs.com
- [ ] Click "Sign Up Free" or "Create Account"
- [ ] Email: Enter your email address
- [ ] Password: Create secure password
- [ ] Click "Sign Up"
- [ ] Verify your email (check inbox)
- [ ] Log in to EmailJS dashboard

**Save this:** Your EmailJS account credentials

---

### Connect Email Service (Gmail)

**Note:** EmailJS needs to send emails FROM your account. Gmail is recommended.

1. [ ] From EmailJS Dashboard, click **"Add Service"**
2. [ ] Select **"Gmail"** from the email services list
3. [ ] Click **"Connect with Gmail"**
4. [ ] You'll be redirected to Google sign-in
5. [ ] Enter your Gmail email address
6. [ ] Enter your Gmail password (or use app-specific password if 2FA enabled)
7. [ ] Gmail will ask for permission - click **"Allow"**
8. [ ] You'll be redirected back to EmailJS
9. [ ] Click **"Confirm"** if asked

**What happened:**
- [ ] Service created and authenticated
- [ ] EmailJS can now send emails through your Gmail account
- [ ] Note the **SERVICE_ID** (format: `service_abc123xyz`) 

**Save this:** Your SERVICE_ID
```
SERVICE_ID: ___________________________
```

---

## PHASE 2: Email Template Setup (8 minutes)

### Create New Email Template

1. [ ] From EmailJS Dashboard, click **"Email Templates"**
2. [ ] Click **"Create New Template"**

### Configure Template Basic Info

3. [ ] **Template Name:** `customer_query_notification` (exact spelling important!)
4. [ ] **Subject:** `New Customer Query Received`
5. [ ] **From:** Select your Gmail address

### Add Template Content

6. [ ] Click on the template content area
7. [ ] Delete default content
8. [ ] Paste this exact template:

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

9. [ ] Verify all template variables are correct:
   - [ ] `{{submission_date}}`
   - [ ] `{{customer_name}}`
   - [ ] `{{customer_email}}`
   - [ ] `{{query_message}}`

### Save Template

10. [ ] Click **"Save"** button
11. [ ] Confirm: Template saved with name `customer_query_notification`

**Template is now ready for use!**

---

## PHASE 3: Get API Credentials (5 minutes)

### Find PUBLIC_KEY

1. [ ] From EmailJS Dashboard, click **"Account"** (top right)
2. [ ] Click **"API"** tab
3. [ ] Look for **"Public Key"** section
4. [ ] Click the key to copy it (or copy manually)
5. [ ] Save it securely

**Save this:** Your PUBLIC_KEY
```
PUBLIC_KEY: ___________________________
```

### Find SERVICE_ID

You already have this from Step 1.8, but verify:

1. [ ] Go back to **"Email Services"**
2. [ ] Click your Gmail service
3. [ ] Copy the **SERVICE_ID** (should start with `service_`)

**Verify this:** Your SERVICE_ID
```
SERVICE_ID: ___________________________
```

### Verify TEMPLATE_ID

1. [ ] Go to **"Email Templates"**
2. [ ] Find your template: `customer_query_notification`
3. [ ] This is your TEMPLATE_ID

**Note:** TEMPLATE_ID = `customer_query_notification` (constant, don't change)

---

## PHASE 4: Update Code (3 minutes)

### Edit query-form.html

1. [ ] Open `query-form.html` in your code editor
2. [ ] Find line ~265 (search for "CONFIGURATION")
3. [ ] Look for this section:

```javascript
// Configuration - REPLACE WITH YOUR EMAILJS CREDENTIALS
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID_HERE';
const EMAILJS_TEMPLATE_ID = 'customer_query_notification';
```

### Replace Credentials

4. [ ] Replace `YOUR_PUBLIC_KEY_HERE` with your actual PUBLIC_KEY
   - Remove the text `YOUR_PUBLIC_KEY_HERE`
   - Paste your key between the quotes
   - Example: `const EMAILJS_PUBLIC_KEY = 'abc123_xyz789';`

5. [ ] Replace `YOUR_SERVICE_ID_HERE` with your actual SERVICE_ID
   - Remove the text `YOUR_SERVICE_ID_HERE`
   - Paste your key between the quotes
   - Example: `const EMAILJS_SERVICE_ID = 'service_abc123xyz';`

6. [ ] Leave TEMPLATE_ID as is: `customer_query_notification`

### Result should look like:
```javascript
const EMAILJS_PUBLIC_KEY = 'abc123_defXYZ789_ghi456jkl';
const EMAILJS_SERVICE_ID = 'service_abc123xyz';
const EMAILJS_TEMPLATE_ID = 'customer_query_notification';
```

7. [ ] Save the file (Ctrl+S)

**Credentials are now embedded in the code!**

---

## PHASE 5: Team Email Verification (2 minutes)

### Verify Team Recipient List

Check the team email addresses in query-form.html (around line 275):

```javascript
const TEAM_EMAILS = [
    'malarvannan.me23@bitsathy.ac.in',
    'vaisaal.me23@bitsathy.ac.in',
    'dharanidharan.me23@bitsathy.ac.in',
    'malarvannanm6@gmail.com'
];
```

- [ ] Email 1: `malarvannan.me23@bitsathy.ac.in` ✓
- [ ] Email 2: `vaisaal.me23@bitsathy.ac.in` ✓
- [ ] Email 3: `dharanidharan.me23@bitsathy.ac.in` ✓
- [ ] Email 4: `malarvannanm6@gmail.com` ✓

All 4 emails should be correct. If any are different, update them now.

---

## PHASE 6: Test the System (10 minutes)

### First Offline Test

1. [ ] Open `query-form.html` in a web browser
2. [ ] Verify page loads and looks professional
3. [ ] Verify dark theme is visible
4. [ ] Verify "Submit Query" header is there
5. [ ] Verify 4 recipient badges show at bottom

### Test Form Validation

6. [ ] Click "Send Query" with empty form
   - [ ] Error appears: "Please enter a valid name"
   
7. [ ] Fill only Name: "Test"
8. [ ] Click "Send Query"
   - [ ] Error appears: "Please enter a valid email"
   
9. [ ] Fill Name and Email but no message
10. [ ] Click "Send Query"
    - [ ] Error appears: "Please enter a message"

11. [ ] Fill Name: "Test User"
12. [ ] Fill Email: "invalid-email"
13. [ ] Click "Send Query"
    - [ ] Error appears: "Please enter a valid email address"

Validation is working! ✓

### Test Form with Valid Data

14. [ ] Fill all fields with valid data:
    - Name: `Test Customer`
    - Email: `test@example.com`
    - Message: `This is a test query submission to verify the system works.`

15. [ ] Click "Send Query" button

**Watch for:**
- [ ] Button becomes disabled (loading state)
- [ ] Spinner icon appears
- [ ] Alert shows "Sending query to all team members..."
- [ ] After 1-2 seconds: Success message appears
- [ ] Success message is GREEN
- [ ] Success message says "✓ Query sent successfully to 4 team members!"

16. [ ] After 3 seconds, page redirects to `dashboard.html`
    - [ ] If it doesn't auto-redirect, click "← Back to Dashboard" link

**Form submission successful!** ✓

### Verify Email Delivery (Critical!)

17. [ ] Check your Gmail inbox
    - [ ] Open your email account (the one connected to EmailJS)
    - [ ] Look for "Sent" folder
    - [ ] You should see 4 IDENTICAL emails:
      - [ ] One to: malarvannan.me23@bitsathy.ac.in
      - [ ] One to: vaisaal.me23@bitsathy.ac.in
      - [ ] One to: dharanidharan.me23@bitsathy.ac.in
      - [ ] One to: malarvannanm6@gmail.com

18. [ ] Open one of the sent emails and verify content:
    - [ ] Subject: "New Customer Query Received"
    - [ ] Body includes: "Test Customer"
    - [ ] Body includes: "test@example.com"
    - [ ] Body includes: "This is a test query submission..."
    - [ ] Body includes: Date/Time (e.g., "February 6, 2026, 2:30:45 PM UTC")

19. [ ] Ask team members to check their email:
    - [ ] malarvannan.me23@bitsathy.ac.in - [  ] Received
    - [ ] vaisaal.me23@bitsathy.ac.in - [  ] Received
    - [ ] dharanidharan.me23@bitsathy.ac.in - [  ] Received
    - [ ] malarvannanm6@gmail.com - [  ] Received

**All 4 team members received identical emails!** ✓

---

## PHASE 7: Edge Cases Testing (5 minutes)

### Test Error Handling

20. [ ] Temporarily break the PUBLIC_KEY in code:
    - [ ] Change one character in PUBLIC_KEY
    - [ ] Refresh page
    - [ ] Page should show warning: "EmailJS not configured"
    - [ ] Submit button should be disabled
    - [ ] Fix the key back

21. [ ] Test network error (if possible):
    - [ ] Disable internet temporarily
    - [ ] Try to submit form
    - [ ] Error message should appear
    - [ ] Re-enable internet

22. [ ] Test really long message:
    - [ ] Paste a 500+ character message
    - [ ] Submit form
    - [ ] Should accept and send normally

23. [ ] Test special characters in name:
    - [ ] Name: "João Silva-Santos"
    - [ ] Submit form
    - [ ] Should send without issues

---

## PHASE 8: Dashboard Integration (3 minutes)

### Verify Dashboard Link

1. [ ] Open `dashboard.html` in browser
2. [ ] Look at top right of header
3. [ ] You should see a cyan "Submit Query" button
4. [ ] Click it
5. [ ] Should navigate to `query-form.html`
6. [ ] Verify page loads correctly

### Verify Back Link

7. [ ] In `query-form.html`, click "← Back to Dashboard"
8. [ ] Should navigate back to `dashboard.html`
9. [ ] Both pages should load correctly

**Navigation working!** ✓

---

## PHASE 9: Production Readiness (5 minutes)

### Code Review

- [ ] Check that credentials are inserted correctly (no placeholder text)
- [ ] Check that all 4 team emails are correct
- [ ] Check that template name is `customer_query_notification`
- [ ] Verify no console errors (open DevTools: F12)

### File Checklist

- [ ] `query-form.html` - Professional query form
- [ ] `dashboard.html` - Updated with Submit Query button
- [ ] `QUERY-SYSTEM-SETUP.md` - Full documentation
- [ ] `QUERY-QUICK-START.md` - Quick reference
- [ ] `QUERY-TECHNICAL-ARCHITECTURE.md` - Technical details
- [ ] `QUERY-IMPLEMENTATION-CHECKLIST.md` - This file

### Browser Testing

- [ ] Tested in Chrome ✓
- [ ] Tested in Firefox ✓
- [ ] Tested on Mobile (responsive) ✓
- [ ] Tested on Tablet ✓

### Email Testing

- [ ] Sent test email ✓
- [ ] All 4 recipients received ✓
- [ ] Email formatting correct ✓
- [ ] Links/formatting work ✓

---

## PHASE 10: Final Deployment

### Before Going Live

- [ ] All testing phases completed
- [ ] All 4 team members verified they can receive emails
- [ ] Form works with real customer data
- [ ] Error handling verified
- [ ] Mobile responsiveness confirmed
- [ ] No console errors or warnings

### Deployment Steps

1. [ ] Upload files to your hosting service:
   - [ ] `query-form.html`
   - [ ] `dashboard.html`

2. [ ] Test again on live server
   - [ ] Submit test query
   - [ ] Verify emails arrive
   - [ ] Check links work

3. [ ] Announce to team members:
   - [ ] "Customer Query system is live"
   - [ ] "You'll receive emails when customers submit"
   - [ ] "Reply directly to customer email address"

4. [ ] Monitor first week:
   - [ ] Check spam folders
   - [ ] Verify email delivery
   - [ ] Watch for issues

---

## PHASE 11: Ongoing Maintenance (Monthly)

### Monthly Checklist

- [ ] Check EmailJS quota (free: 200/month)
- [ ] Verify all 4 team members still receiving emails
- [ ] Check spam folders for legitimate emails (mark as "Not Spam")
- [ ] Review error logs if any failures occurred
- [ ] Ensure credentials haven't been exposed

### When to Upgrade EmailJS Plan

If you exceed 200 emails/month, upgrade to:
- **Pro Plan** ($14.99/month): 5000 emails
- **Team Plan** ($99/month): 50000 emails

---

## TROUBLESHOOTING QUICK REFERENCE

| Issue | Solution |
|-------|----------|
| "Failed to send query" error | Check PUBLIC_KEY and SERVICE_ID are correct (no extra spaces) |
| Form doesn't submit | Refresh page, check browser console (F12) for errors |
| Emails not arriving | Check Sent folder in Gmail, verify all 4 recipient addresses |
| Emails in spam folder | Open email, click "Not Spam" to whitelist sender |
| Submit button disabled with warning | Credentials not configured, check line 265 in code |
| Page doesn't load at all | Check file path is correct, try clear browser cache |
| Template variables showing as {{variable}} | Template name must be exactly `customer_query_notification` |
| Different emails arriving at each recipient | Check your email template - make sure it's the same for all |

---

## Support Resources

- **EmailJS Docs:** https://www.emailjs.com/docs/
- **ErrorJS Test Button:** Go to Email Templates → Click Template → "Test" button
- **Template Variables:** EmailJS docs → Variables & Parameters
- **Security Issues:** Email security@emailjs.com

---

## Sign-Off

- [ ] All checks completed
- [ ] System tested and working
- [ ] Team members notified
- [ ] Documentation saved
- [ ] Deployment complete
- [ ] Ready for customer submissions

**Date Completed:** _______________  
**Completed By:** _______________  
**Team Lead Sign-Off:** _______________  

---

**System Status: ✓ PRODUCTION READY**

Customers can now submit queries from the dashboard, and all team members will receive notifications immediately!
