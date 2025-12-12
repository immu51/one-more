
export const appConfig = {
  // Website Information
  appName: import.meta.env.VITE_APP_NAME || 'BidMaster',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Your trusted platform for online bidding and direct purchases.',
  
  // Owner/Company Information
  ownerName: import.meta.env.VITE_OWNER_NAME || 'BidMaster Team',
  ownerEmail: import.meta.env.VITE_OWNER_EMAIL || 'support@bidmaster.com',
  ownerPhone: import.meta.env.VITE_OWNER_PHONE || '8279946669',
  ownerAddress: import.meta.env.VITE_OWNER_ADDRESS || '123 Auction St, City, State 12345',
  
  // Social Media Links
  social: {
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM || 'https://instagram.com',
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK || 'https://facebook.com',
    twitter: import.meta.env.VITE_SOCIAL_TWITTER || 'https://twitter.com',
    linkedin: import.meta.env.VITE_SOCIAL_LINKEDIN || 'https://linkedin.com',
  },
  
  // Admin Configuration
  admin: {
    email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@bidmaster.test',
    password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
  },
  
  // Copyright
  copyrightYear: import.meta.env.VITE_COPYRIGHT_YEAR || new Date().getFullYear().toString(),
};

