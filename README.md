Nice — this project is a production-grade skeleton for your tender website backend.

What's included:
- Signup/Login with password or OTP (email/sms mock)
- Strong password policy (8-32 chars, no spaces, upper/lower/number)
- Nodemailer template for OTP emails (HTML + plain text)
- Pluggable SMS (mock + hint for Twilio)
- JWT auth and role-based middleware
- Winston structured logging (console + file)
- Rate-limits and validation for OTP endpoints

Place your credentials in .env (copy .env.example -> .env) and run `npm install` then `npm run dev`.

Logger usage:
- `src/utils/logger.ts` exports `logger` — use `logger.info('message', { meta })`, `logger.error(err)`.
- Logs are kept in `logs/combined.log` and `logs/error.log`.
