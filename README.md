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

## Discord Webhook Setup

To receive order notifications via Discord:

1. **Create Webhook in Discord**:
   - Go to your Discord server settings
   - Navigate to Integrations → Webhooks
   - Create a new webhook for your orders channel
   - Copy the webhook URL

2. **Configure the Code**:
   - Open `app.js`
   - Find `const webhookURL = 'YOUR_DISCORD_WEBHOOK_URL';`
   - Replace with your actual webhook URL

3. **Test the Integration**:
   - Submit a test order
   - Check your Discord channel for the notification

The webhook will send rich embeds with order details and mention you (@1160306193567338579).

## How to Respond to Tickets

1. **Access Admin Panel**: Click the "Admin" button (centered at bottom) and enter password: `Himgyiocc1#`
2. **View Tickets**: All customer orders are displayed in a table format with quantities and totals
3. **Respond**: Type your response in the textarea for each order
4. **Contact Customer**: Use their Discord username shown in the order details
5. **Update Status**: Click "Respond" to save response or "Close" to mark as completed

## Technologies
- HTML5, CSS3, JavaScript
- Discord Webhooks for notifications
- No backend required (uses localStorage)
- Professional static design