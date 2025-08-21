# Email Setup Guide

To enable real email sending functionality, follow these steps:

## Option 1: Gmail SMTP (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification
3. Click "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### Step 3: Configure Environment Variables
Create a `.env.local` file in your project root:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### Step 4: Restart the Development Server
```bash
npm run dev
```

## Option 2: Other Email Services

You can also use other email services by updating the configuration in `app/api/send-email/route.ts`:

### SendGrid
```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### Mailgun
```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASS
  }
});
```

## Testing

1. Sign in to the app with your email
2. Add some topics and generate a digest
3. Click "Send to Email"
4. Check your inbox for the formatted digest

## Current Status

- ✅ Email API route implemented
- ✅ Beautiful HTML email template
- ✅ Demo mode for testing
- ⚠️ Real email service needs configuration

## Troubleshooting

### "Demo mode" message
This means the email service isn't configured. Follow the setup steps above.

### Email not received
1. Check spam folder
2. Verify email credentials
3. Check console for error messages
4. Ensure 2FA is enabled for Gmail

### Environment variables not working
1. Restart the development server after adding `.env.local`
2. Ensure the file is in the project root
3. Check for typos in variable names


