# Mindscape

A comprehensive mental health platform designed specifically for students to track their wellness journey, access self-assessments, and book counseling sessions with mental health professionals.

## 🌟 Features

- **User Authentication & Profiles**: Secure user registration and profile management
- **Mental Health Assessments**: Comprehensive self-assessments for:
  - Depression screening (PHQ-9 adapted)
  - Anxiety screening (GAD-7 adapted)
  - Perceived stress scale
- **Wellness Score Calculation**: Automated composite wellness score based on assessment results
- **Counseling Session Booking**: Schedule appointments with mental health professionals
- **Progress Tracking**: Monitor mental health journey over time
- **Multi-language Support**: English
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Next.js** (App Router)
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Lucide React** for icons

### Backend
- **Node.js/Express** (Assessment API & User Management)
- **MongoDB** (Assessment data storage)
- **JWT Authentication**

### DevOps
- **Git** for version control

## 📋 Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB (local or Atlas)
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindscape-v3.git
   cd mindscape-v3
   ```

2. **Backend Setup (Node.js)**
   ```bash
   cd backend-node
   npm install
   # Create .env file with MongoDB connection string
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create `.env` files in respective directories:

**backend-node/.env**
```
MONGO_URI=mongodb://localhost:27017/mindscape
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_BASE=http://localhost:5000/api
```

## 📖 Usage

1. **Start all services** (Node.js backend and frontend)
2. **Access the application** at `http://localhost:3000`
3. **Register/Login** to create your account
4. **Complete your profile** with personal information
5. **Take assessments** to get your wellness score
6. **Book counseling sessions** as needed
7. **Track your progress** in the profile dashboard

## 🏗 Project Structure

```
mindscape-v3/
├── frontend/                 # React/Next.js frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Next.js pages
│   │   ├── lib/             # Utility functions
│   │   └── styles/          # Global styles
│   └── public/              # Static assets
├── backend-node/             # Node.js/Express backend
│   ├── controllers/         # Route controllers
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   └── app.js               # Express app setup
├── .gitignore               # Git ignore rules
└── README.md               # Project documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Mental health assessment questions adapted from validated clinical scales
- UI design inspired by modern wellness applications
- Icons provided by Lucide React

## 🔒 Security

This application handles sensitive mental health data. Please ensure:
- All environment variables are properly configured
- MongoDB connections are secured
- JWT secrets are strong and unique
- Regular security updates are applied

---

**Disclaimer**: This application is not a substitute for professional medical advice. Always consult with qualified mental health professionals for personalized guidance.
