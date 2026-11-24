# Assessment Platform v2.1 – Setup

## Files
Backend: `Code.gs` · Front end (upload to GitHub Pages root): `account.html`, `superadmin.html`, `admin.html`, `theme.css`, `commerce-kit.js` (+ your existing `index.html`, `sw.js`, `manifest.json`, `qr-scanner.js`).

## Backend steps (do all, in order)
1. Replace Code.gs. Run **setupSheets()** (non-destructive – adds Users, Plans, Payments, Settings, Coupons, Announcements, Tickets).
2. Run **authorizeAll()** once and accept the Mail + Drive permissions (this is what fixes "OTP mail never arrives / cannot login").
3. Run **installTriggers()** once.
4. Settings sheet: fill `AdminEmail`, `SupportEmail`, `SiteUrl`. `RequireEmailVerification` = true (OTP) or false (instant login).
5. Deploy → Manage deployments → Edit → **New version** (same /exec URL).

## Pages / URLs
- Users: `https://<your-site>/account.html` (register, login, dashboard, plans, payments, support)
- Question builder for users: **Dashboard → Create assessment** (opens `admin.html`, already signed in). Users see only their own tests; limits come from their plan.
- Super admin: `https://<your-site>/superadmin.html` (also linked in the top bar and footer of account.html). Login `admin` / `Admin@123`, then change the password.

## Login troubleshooting
- If the mail system is not authorised or out of quota, registration now activates the account instantly instead of locking the user out.
- Super admin → Users → **Activate** verifies and enables any account manually.
- Login uses the email address (not a username). Passwords: 8+ characters with letters and numbers.
