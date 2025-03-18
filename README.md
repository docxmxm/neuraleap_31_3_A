# NeuraLeap AI Education Website

This repository contains the codebase for the NeuraLeap AI Education platform, a comprehensive web application for AI education and resources.

## Recent Authentication Flow Fixes

We've recently fixed issues with the authentication flow that were causing login credentials to be exposed in the URL. Here's a summary of the changes:

### Security Improvements:
- Fixed form submission handling to prevent credentials from appearing in URL parameters
- Added URL parameter cleaning to remove sensitive data from browser history
- Updated redirection logic to properly send users to their dashboard after login
- Enhanced session management to improve login persistence

### Technical Fixes:
1. **Login Form Handling**: Modified the form submission to properly use JavaScript events instead of default form behavior
2. **AuthManager Enhancement**: Added URL parameter cleaning functionality in the AuthManager class
3. **Supabase Client Configuration**: Updated persistSession settings and redirect URLs
4. **Dashboard Protection**: Added robust authentication verification to dashboard pages

### How to Test:
1. Start the local development server: `python3 -m http.server 8000`
2. Navigate to http://localhost:8000
3. Try logging in with valid credentials
4. You should be redirected to the dashboard without credentials in the URL

## Application Structure

The application is structured as follows:

- `/pages`: Main pages of the application
  - `/dashboard`: Protected pages requiring authentication
  - `/login.html`, `/register.html`: Authentication pages
- `/js`: JavaScript modules
  - `auth-manager.js`: Handles authentication flows
  - `supabase-client.js`: Configures and initializes Supabase client
- `/components`: Reusable HTML components (header, footer, etc.)
- `/css`: Stylesheets for the application
- `/assets`: Images, icons, and other static assets

## Development Setup

To run the application locally:

1. Clone this repository
2. Navigate to the project directory
3. Start a local server:
   ```
   python3 -m http.server 8000
   ```
4. Open a browser and navigate to `http://localhost:8000`

## Authentication Flow

The authentication system uses Supabase for user management and follows these steps:

1. User enters credentials on login page
2. Credentials are securely sent to Supabase via the JavaScript API
3. Upon successful authentication, the user is redirected to their dashboard
4. The session is persisted using JWT tokens for seamless user experience
5. Protected pages check authentication status before rendering content

## Technologies Used

- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS for styling
- Supabase for authentication and backend services
- Modern browser APIs for enhanced user experience

# NeuraLeap - Advanced AI Learning Platform

NeuraLeap is an advanced AI learning platform offering cutting-edge courses on large language models, neural networks, and AI safety.

## Table of Contents
1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Local Development Setup](#local-development-setup)
4. [Supabase Deployment (Docker-based)](#supabase-deployment-docker-based)
5. [Project Structure](#project-structure)
6. [Backend API Documentation](#backend-api-documentation)
7. [Frontend Components](#frontend-components)
8. [Contributing](#contributing)

## Features

- User authentication with Supabase Auth
- Course catalog and enrollment
- User profile management
- Payment processing with Stripe
- Quiz and assessment system
- AI learning resources
- Responsive design

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Backend**: Django, Django REST Framework
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **Email**: SendGrid
- **Deployment**: Docker, Supabase CLI

## Local Development Setup

### Prerequisites
- Python 3.9+
- Node.js 14+
- Docker
- Git

### Backend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd NerualLeap-Website-master
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows, use `.venv\Scripts\activate`
   ```

3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Set up environment variables (copy .env.example to .env and fill in values)

5. Run migrations and start the development server:
   ```bash
   cd backend
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend Setup

The frontend is a static website. You can simply open the index.html file in your browser or use a simple HTTP server:

```bash
npx serve .
```

## Supabase Deployment (Docker-based)

### Prerequisites

- Docker installed and running
- Supabase account with a new project created
- Project API URL and API key

### Deployment Steps

1. Update your environment variables in `backend/.env` with your Supabase credentials:

   ```
   SUPABASE_URL=https://txggovndoxdybdquopvx.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   DB_HOST=db.txggovndoxdybdquopvx.supabase.co
   DB_PASSWORD=your-database-password
   ```

2. Configure your database settings in `backend/myproject/settings.py` to use Supabase PostgreSQL in production

3. Make the deployment script executable:
   ```bash
   chmod +x deploy/supabase-deploy.sh
   ```

4. Run the Docker-based deployment script:
   ```bash
   ./deploy/supabase-deploy.sh
   ```

5. The script will:
   - Verify Docker is installed and running
   - Use Docker to run Supabase CLI commands
   - Set up your database schema
   - Deploy your frontend files to Supabase Storage
   - Provide instructions for setting up website hosting and custom domain

6. When the script runs:
   - You may need to authenticate with Supabase in a browser window
   - Docker will pull the Supabase CLI image if it's not already present
   - All Supabase operations will happen within Docker containers

7. For the backend, we recommend deploying your Django application with Docker as well:
   - Create a `Dockerfile` for your Django application
   - Build a Docker image for your backend
   - Deploy to a container-friendly service like:
     - Heroku (Docker deployment)
     - DigitalOcean App Platform
     - AWS ECS or Elastic Beanstalk
     - Railway.app (supports Docker)
     - Render.com (supports Docker)

8. Once deployed, your website will be available at your custom domain (e.g., https://neuraleap.com.au)

### Manual Supabase Configuration

After running the deployment script, you'll need to:

1. Enable website hosting in your Supabase Storage bucket through the Supabase dashboard
2. Configure your custom domain in Supabase settings
3. Set up DNS records as instructed by Supabase
4. Configure environment variables on your backend hosting provider

## Project Structure

```
NerualLeap-Website-master/
├── assets/              # Images, videos, and other static assets
├── backend/             # Django backend
│   ├── accounts/        # User authentication and profiles
│   ├── api/             # REST API endpoints
│   ├── core/            # Core functionality
│   ├── myproject/       # Django project settings
│   └── templates/       # Email and HTML templates
├── components/          # Reusable HTML components
├── css/                 # Stylesheets
├── deploy/              # Deployment scripts
├── js/                  # JavaScript files
├── pages/               # HTML pages
├── supabase/            # Supabase configuration and migrations
└── index.html           # Main entry page
```

## Backend API Documentation

The backend provides a RESTful API for the frontend. Key endpoints include:

- `/api/auth/` - Authentication endpoints
- `/api/courses/` - Course catalog and enrollment
- `/api/profiles/` - User profile management
- `/api/payments/` - Payment processing with Stripe
- `/api/quiz/` - Quiz and assessment system

For detailed API documentation, see [BACKEND_API.md](backend/API_DOCUMENTATION.md)

## Frontend Components

The frontend is built with a component-based architecture, using vanilla HTML, CSS, and JavaScript. Key components include:

- Header and navigation
- Course card and listing
- User authentication forms
- Dashboard widgets
- Payment processing

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request 

# NeuraLeap Website

A modern web application for AI learning and education.

## Local Development

This project can be run using a simple Python HTTP server for local development.

### Running the Server

```bash
# From the project root
python3 -m http.server 8000
```

### Accessing the Website

1. Open your browser and navigate to: `http://localhost:8000/`
2. To go directly to the login page: `http://localhost:8000/pages/login.html`

### Important Notes

- The Python SimpleHTTPServer has limitations:
  - It does not support POST requests (you'll see 501 errors if forms try to submit)
  - All authentication happens client-side only using the Supabase JavaScript client
  - Form submissions are handled by JavaScript event handlers that prevent default form submission

### Authentication System

The website implements a client-side authentication system using:
- Supabase Auth for user authentication
- LocalStorage for token persistence
- Auto-login functionality (configurable timeout, default 5 minutes)
- Session timer display
- Protected dashboard pages

### Key Files

- `/js/auth-manager.js` - Core authentication management system
- `/pages/login.html` - Login page with auto-login support
- `/pages/auth-test.html` - Page for testing authentication features
- `/pages/dashboard/*` - Protected dashboard pages

### Browser Support

This website works best in modern browsers that support ES6 features. 