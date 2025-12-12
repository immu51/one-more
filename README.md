# BidMaster - Online Bidding & Direct Purchase Platform

A modern, responsive frontend application for an online bidding and direct purchase website. Built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Product Browsing**: Browse products with filtering by category and type (auction/direct)
- **Bidding System**: Place bids on auction items with real-time bid history
- **Direct Purchase**: Buy products directly at fixed prices
- **User Authentication**: Mock authentication system with customer and admin roles
- **Admin Dashboard**: Add, edit, delete, and manage products
- **Customer Dashboard**: View profile and bid history
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Beautiful purple gradient hero, smooth animations, and hover effects

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js) or **yarn**

## 🛠️ Setup Instructions

### 1. Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required dependencies including:
- React & React DOM
- React Router DOM
- Tailwind CSS
- Vite
- PostCSS & Autoprefixer

### 2. Run the Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

### 3. Build for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### 4. Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## 📁 Project Structure

```
bidmaster/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx       # Navigation bar
│   │   ├── Footer.jsx       # Footer component
│   │   ├── ProductCard.jsx  # Product card component
│   │   ├── ProductGrid.jsx  # Product grid layout
│   │   ├── ReviewCarousel.jsx # Reviews carousel
│   │   ├── ContactForm.jsx  # Contact form
│   │   ├── Toast.jsx        # Toast notifications
│   │   ├── LoadingSkeleton.jsx # Loading placeholders
│   │   └── PrivateRoute.jsx # Route protection
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Home page
│   │   ├── Products.jsx     # Products listing page
│   │   ├── ProductDetail.jsx # Product detail page
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Registration page
│   │   ├── Dashboard.jsx    # Customer dashboard
│   │   └── Admin.jsx        # Admin dashboard
│   ├── context/             # React Context
│   │   └── AuthContext.jsx  # Authentication context
│   ├── utils/               # Utility functions
│   │   ├── localStorage.js  # localStorage helpers
│   │   └── sampleData.js    # Sample data seeder
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── postcss.config.js       # PostCSS configuration
```

## 🔐 Authentication

### Mock Authentication System

The app uses localStorage for mock authentication. No real backend is required.

### Default Admin Account

- **Email**: `admin@bidmaster.test`
- **Password**: `admin123` (or any password)

### Customer Account

- Create a new account via the Register page
- Or login with any email/password combination (select Customer role)

### How to Login as Admin

1. Go to `/login`
2. Select "Admin" from the role dropdown
3. Enter `admin@bidmaster.test` as email
4. Enter any password
5. Click "Login"

## 📊 Sample Data

The application automatically seeds sample data on first load:

- **6 Sample Products**: Mix of auction and direct purchase items
- **3 Sample Reviews**: Customer testimonials
- **1 Admin User**: Default admin account

All data is stored in localStorage and persists across page refreshes.

## 🎨 Customization

### Colors

The primary color scheme uses purple. To change colors, edit `tailwind.config.js`:

```js
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Adding Real Backend

To replace localStorage with a real API:

1. **Update `src/utils/localStorage.js`**: Replace functions with API calls
2. **Update `src/context/AuthContext.jsx`**: Replace localStorage auth with API authentication
3. **Update components**: Replace `getFromStorage`/`saveToStorage` with API calls

Example API integration points:
- `src/utils/localStorage.js` → API service functions
- `src/context/AuthContext.jsx` → API authentication endpoints
- Product CRUD operations → API endpoints

## 🛣️ Routes

- `/` - Home page
- `/products` - Products listing with filters
- `/products/:id` - Product detail page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Customer dashboard (protected)
- `/admin` - Admin dashboard (protected, admin only)

## 🎯 Key Features Explained

### Product Management (Admin)

- **Add Product**: Fill out the form in the admin dashboard
- **Edit Product**: Click "Edit" on any product
- **Delete Product**: Click "Delete" on any product
- **Toggle Status**: Switch between "Live" and "Draft" status

### Bidding System

- View current bid and bid history
- Place bids (must be higher than current bid)
- See real-time bid updates
- Buy Now option for auction items

### Filtering & Search

- Search products by title or description
- Filter by category
- Filter by type (auction/direct)
- Clear filters to reset

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is busy, Vite will automatically use the next available port. Check the terminal output for the actual port.

### localStorage Issues

If you want to reset all data:
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear localStorage
4. Refresh the page (data will re-seed)

### Build Errors

If you encounter build errors:
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again
4. Run `npm run dev`

## 📝 Code Style

- **Functional Components**: All components use React hooks
- **Comments**: Each component has a header comment explaining its purpose
- **Props**: Props are documented in component comments
- **Naming**: Clear, descriptive names for variables and functions

## 🔄 Future Enhancements

To extend this project:

1. **Real Backend**: Replace localStorage with REST API or GraphQL
2. **Payment Integration**: Add payment gateway for purchases
3. **Email Notifications**: Notify users of bid updates
4. **Image Upload**: Allow admins to upload product images
5. **User Profiles**: Enhanced user profile pages
6. **Wishlist**: Save favorite products
7. **Advanced Filters**: Price range, date filters, etc.

## 📄 License

This project is open source and available for learning purposes.

## 👨‍💻 Development Notes

- All data persists in localStorage
- No real authentication - passwords are stored in plain text (for demo only)
- Images use external URLs (Unsplash) - replace with your own image hosting
- Toast notifications auto-dismiss after 3 seconds
- Product cards have hover effects (scale + shadow)
- Responsive grid: 1 column (mobile), 2 (tablet), 3-4 (desktop)

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

---

**Happy Coding! 🚀**

