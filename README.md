# Minecraft Netherite Shop

A static web application for a Minecraft-themed shop featuring Netherite items with a galaxy background.

## Features
- Galaxy background with animated stars
- Shop items: Netherite sword, pickaxe, axe, armor sets, and diamond armor
- Ticket system for user inquiries
- Admin panel for managing tickets and restocking (password: Himgyiocc1#)

## Deployment to Netlify
1. Connect this GitHub repo to Netlify
2. Set build command: (leave empty for static site)
3. Publish directory: (leave as root)
4. Deploy

## Local Development
Run `npm start` to serve locally with http-server.

## Email Setup with EmailJS

To enable email notifications for tickets and responses:

1. **Create EmailJS Account**: Go to [emailjs.com](https://www.emailjs.com/) and sign up
2. **Add Email Service**: In your EmailJS dashboard, add a new email service (Gmail, Outlook, etc.)
3. **Create Email Templates**:
   - **Admin Template** (for new tickets): Create template with variables `{{from_name}}`, `{{from_email}}`, `{{item}}`, `{{message}}`, `{{ticket_id}}`
   - **Customer Template** (for responses): Create template with variables `{{to_name}}`, `{{to_email}}`, `{{item}}`, `{{original_message}}`, `{{response}}`, `{{ticket_id}}`
4. **Get IDs**: Copy your Service ID, Admin Template ID, Customer Template ID, and Public Key
5. **Update Code**: Replace the placeholders in `app.js`:
   - `YOUR_PUBLIC_KEY` → Your EmailJS Public Key
   - `YOUR_SERVICE_ID` → Your Email Service ID
   - `YOUR_ADMIN_TEMPLATE_ID` → Admin notification template ID
   - `YOUR_CUSTOMER_TEMPLATE_ID` → Customer response template ID

## Technologies
- HTML5, CSS3, JavaScript
- EmailJS for email notifications
- No backend required (uses localStorage)