# NeuraLeap - Advanced AI Learning Platform

![NeuraLeap Logo](assets/icons/favicon.png)

## Overview

NeuraLeap is an advanced AI learning platform offering cutting-edge courses on large language models, neural networks, and AI safety. This repository contains the frontend code for the NeuraLeap website.

🔗 [Visit Our Website](https://neuraleap.com.au)

## Features

- Responsive, modern UI using Tailwind CSS
- Interactive course catalog
- User authentication with Supabase
- Student dashboard
- Payment processing integration
- Neural network visualizations and animations

## Project Structure

```
neuraleap-frontend/
├── assets/            # Images, icons, and other static assets
├── components/        # Reusable HTML components (header, footer, etc.)
├── css/               # Stylesheet files
│   ├── animations.css # Animation effects
│   ├── main.css       # Main stylesheet
│   └── dashboard.css  # Dashboard-specific styles
├── js/                # JavaScript functionality
│   ├── main.js          # Core functionality
│   ├── supabase-client.js  # Supabase authentication client
│   ├── neural-network.js   # Neural network visualizations
│   ├── chatbot.js         # Interactive chatbot
│   └── course-detail.js   # Course detail page functionality
├── pages/             # Website pages
│   ├── login.html       # User login
│   ├── register.html    # User registration
│   ├── courses/         # Course-related pages
│   └── dashboard/       # User dashboard pages
└── index.html        # Main entry page
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **CSS Framework**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Hosting**: Supabase Storage

## Local Development

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/neuraleap-frontend.git
   cd neuraleap-frontend
   ```

2. Open the project in your preferred code editor

3. Serve the project using a local server:
   - Using Python:
     ```bash
     python -m http.server 8000
     ```
   - Using Node.js:
     ```bash
     npx serve
     ```

4. Open your browser and navigate to `http://localhost:8000`

## Deployment

This website is deployed using Supabase Storage for hosting and Supabase for authentication and database. For custom domain setup, DNS configuration is required.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Acknowledgments

- Tailwind CSS for the responsive framework
- Supabase for backend services
- All contributors and team members

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries or support, please contact us through our website at [neuraleap.com.au](https://neuraleap.com.au). 