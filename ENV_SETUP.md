# Environment Variables Setup

This project uses environment variables for configuration. Follow these steps to set up your `.env` file.

## Steps to Create .env File

1. Create a new file named `.env` in the root directory of the project (same level as `package.json`)

2. Copy the contents from `.env.example` file or use the template below:

```env
# Website Configuration
VITE_APP_NAME=BidMaster
VITE_APP_DESCRIPTION=Your trusted platform for online bidding and direct purchases. Find amazing deals on unique products.

# Owner/Company Information
VITE_OWNER_NAME=BidMaster Team
VITE_OWNER_EMAIL=support@bidmaster.com
VITE_OWNER_PHONE=+1 (555) 123-4567
VITE_OWNER_ADDRESS=123 Auction St, City, State 12345

# Social Media Links
VITE_SOCIAL_INSTAGRAM=https://instagram.com
VITE_SOCIAL_FACEBOOK=https://facebook.com
VITE_SOCIAL_TWITTER=https://twitter.com
VITE_SOCIAL_LINKEDIN=https://linkedin.com

# Admin Configuration
VITE_ADMIN_EMAIL=admin@bidmaster.test
VITE_ADMIN_PASSWORD=admin123

# Copyright Year
VITE_COPYRIGHT_YEAR=2024
```

3. Update the values according to your needs:
   - **VITE_APP_NAME**: Change "BidMaster" to your website name
   - **VITE_OWNER_NAME**: Your company/owner name
   - **VITE_OWNER_EMAIL**: Your contact email
   - **VITE_OWNER_PHONE**: Your contact phone number
   - **VITE_OWNER_ADDRESS**: Your business address
   - **VITE_SOCIAL_*****: Update with your social media links
   - **VITE_ADMIN_EMAIL**: Admin login email
   - **VITE_ADMIN_PASSWORD**: Admin login password
   - **VITE_COPYRIGHT_YEAR**: Current year or your copyright year

4. Save the file as `.env` (make sure it starts with a dot)

5. Restart your development server for changes to take effect:
   ```bash
   npm run dev
   ```

## Important Notes

- All environment variables must start with `VITE_` prefix for Vite to expose them
- Never commit your `.env` file to version control (it's already in .gitignore)
- Use `.env.example` as a template for other developers
- After changing `.env` file, restart the dev server

## Where These Values Are Used

- **App Name**: Navbar logo, Footer, Home page hero section
- **Owner Info**: Footer contact section
- **Social Links**: Footer social media icons
- **Admin Credentials**: Default admin user creation, Login page demo info
- **Copyright Year**: Footer copyright text

