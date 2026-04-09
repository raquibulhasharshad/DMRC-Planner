# DMRC Metro Planner 🚇

A premium, full-stack metro navigation application designed for the Delhi Metro (DMRC). This project features intelligent route calculation, accurate fare estimation, and a state-of-the-art responsive user interface.

## 🌟 Key Features

### 🗺️ Intelligent Route Finding
- Calculates the shortest path between any two stations in the DMRC network.
- Visualizes the journey with a detailed timeline, showing all intermediate stations.
- Provides clear interchange instructions (e.g., "Change to Yellow Line").

### 💰 Accurate Fare Estimation
- Real-time fare calculation based on the number of stations traveled.
- Automatic support for **Sunday & Holiday discounts**, ensuring users see the correct price.

### 🛡️ Secure User Authentication
- Complete JWT-based authentication system.
- Secure session management using **HttpOnly & Secure Cookies**.
- Protected API routes and frontend dashboard.

### 👤 Account & Security Management
- **Profile Updates**: Change your display name or phone number seamlessly.
- **Secure Password Reset**: Update credentials with current password verification.
- **Danger Zone (Account Deletion)**: A secure, multi-step account removal process with custom confirmation modals to prevent accidental deletion.

### 📱 State-of-the-Art Responsive UI
- **Mobile First**: Fully optimized for smartphones with a collapsible hamburger menu.
- **Glassmorphism Design**: Modern dark-mode aesthetic with blurred panels and vibrant accents.
- **Cross-Platform**: Consistent experience across Desktop, Tablet, and Mobile.

## 🚀 Tech Stack

- **Frontend**: React.js, Axios, CSS Modules (Vanilla), Responsive Design.
- **Backend**: Java, Spring Boot, Spring Security (JWT), Spring Data JPA.
- **Database**: PostgreSQL (Neon.tech).
- **Security**: JSON Web Tokens (JWT), Cookie-based session tracking.

## 🛠️ Installation & Setup

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL Database

### Backend Setup
1. Navigate to the `Backend/metro` directory.
2. Create a `.env` file (see `.env.example`).
3. Set your environment variables:
   ```env
   DB_URL=your_db_url
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_random_secret
   FRONTEND_URL=http://localhost:5173
   ```
4. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to the `Frontend` directory.
2. Create a `.env` file (see `.env.example`).
3. Set the API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```
4. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```

## 🐋 Docker Support

The project is fully dockerized for both local development and production-ready deployments.

### Local Development (with Docker Compose)
To launch the entire stack (Backend + Frontend) with a single command:
```bash
docker-compose up --build
```
- **Backend**: Available at `http://localhost:8080`
- **Frontend**: Available at `http://localhost:5173`

### Build Images Separately
If you are deploying the frontend and backend to different services:

**Backend**:
```bash
cd Backend/metro
docker build -t dmrc-backend .
```

**Frontend**:
```bash
cd Frontend
docker build -t dmrc-frontend .
```

## 📝 License
This project is for educational/demonstration purposes. All metro data is based on publicly available DMRC information.
