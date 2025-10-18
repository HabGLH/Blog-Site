# BlogApp - React Frontend

A modern, responsive blog application built with React, Vite, and Tailwind CSS. This frontend application provides a complete blogging platform with user authentication, post management, and a beautiful user interface.

## Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Protected routes
- User session management

### 📝 Post Management
- Create, read, update, and delete posts
- Rich text content support
- Tag system for post categorization
- Author attribution

### 🎨 User Interface
- Modern, responsive design with Tailwind CSS
- Search and filter functionality
- Post cards with preview
- Loading states and error handling
- Mobile-friendly navigation

### 🚀 Additional Features
- Real-time post statistics
- Tag-based filtering
- Search across posts, authors, and content
- Dashboard for authenticated users
- Clean, intuitive navigation

## Tech Stack

- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.1.14
- **Routing**: React Router DOM 7.9.4
- **HTTP Client**: Axios 1.12.2
- **State Management**: React Context API

## Project Structure

```
src/
├── api/                 # API client configuration
│   ├── axiosClient.js   # Axios instance with interceptors
│   ├── authApi.js       # Authentication API calls
│   └── postApi.js       # Posts API calls
├── components/          # Reusable UI components
│   ├── Loader.jsx       # Loading spinner component
│   ├── Navbar.jsx       # Navigation bar
│   ├── PostCard.jsx     # Post preview card
│   ├── PostForm.jsx     # Post creation/editing form
│   └── ProtectedRoute.jsx # Route protection wrapper
├── context/             # React Context providers
│   └── AuthContext.jsx  # Authentication state management
├── pages/               # Page components
│   ├── Dashboard.jsx    # User dashboard
│   ├── Home.jsx         # Home page with posts
│   ├── Login.jsx        # Login page
│   ├── PostDetail.jsx   # Individual post view
│   └── Register.jsx     # Registration page
├── App.jsx              # Main app component
└── main.jsx             # App entry point
```

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- Backend API server running on `http://localhost:5000`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The application expects a backend API with the following endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/verify` - Token verification
- `POST /auth/logout` - User logout

### Posts
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create new post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

## Key Features Explained

### Authentication Flow
1. Users can register or login through dedicated pages
2. JWT tokens are stored in localStorage
3. Axios interceptors automatically add tokens to requests
4. Protected routes redirect unauthenticated users to login

### Post Management
1. Authenticated users can create posts through the dashboard
2. Posts support rich text content and tags
3. Users can edit and delete their own posts
4. All posts are displayed on the home page with search/filter options

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive grid layouts for post cards
- Adaptive navigation for different screen sizes
- Touch-friendly interface elements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
