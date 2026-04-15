# CampusPro - Student Freelance Marketplace

**Bridge the Experience Paradox.**

CampusPro is a secure, university-verified marketplace designed specifically for students to monetize their skills, build professional portfolios, and collaborate on real-world projects before graduation.

![CampusPro Banner](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-blue)

---

##  Key Features

- **Smart Skill Matching**: Algorithm-driven matching of listed skills with project requirements.
- **Verified Identity**: Secure institutional verification to ensure a trusted peer-to-peer community.
- **Secure Escrow**: Transactional state management ensuring project stability and payment security.
- **Dynamic Dashboard**: A premium, glassmorphic interface for tracking bids, project progress, and earnings.
- **Integrated Marketplace**: Browse and apply for campus-verified job opportunities in real-time.

---

##  Tech Stack

### Frontend
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: TypeScript

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt
- **Email Service**: [AWS SES](https://aws.amazon.com/ses/)

### Database
- **Database**: [MongoDB](https://www.mongodb.com/)
- **ODM**: [Mongoose](https://mongoosejs.com/)

---

##  Project Structure

```bash
CampusPro/
├── client/              # Next.js Frontend
│   ├── src/app          # App router pages & layouts
│   ├── src/components   # Reusable UI components
│   └── public/          # Static assets
└── server/              # Express Backend
    ├── routes/          # API Endpoints
    ├── models/          # Mongoose Schemas
    ├── middleware/      # Auth & logic middleware
    └── config/          # Database & service configurations
```

---

##  Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CampusPro
```

### 2. Backend Configuration
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
AWS_REGION=your_region
SES_SENDER_EMAIL=your_verified_email
```
Run the server:
```bash
npm run dev
```

### 3. Frontend Configuration
```bash
cd ../client
npm install
```
Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
Run the client:
```bash
npm run dev
```

---

##  Testing & Quality Assurance

CampusPro follows a rigorous testing process to ensure platform stability and security:
- **Testing Guide**: Detailed strategy and unit test coverage can be found in [Testing_Guide.md](./Testing_Guide.md).
- **Test Reports**: View the latest automated testing results in the [Interactive Test Report](./CampusPro_Test_Report.html).

Key testing areas include:
- **Authentication Resilience**: Verifying JWT integrity and role-based access.
- **Transactional Logic**: Ensuring "Skill-Swap" and "Monetary" bid variations are processed correctly.
- **End-to-End Flows**: Full student and client journeys from registration to project completion.

---

##  Security & Verification
CampusPro implements strict security protocols:
- **Password Hashing**: Industry-standard Bcrypt encryption.
- **Session Management**: Secure JWT-based authentication.
- **Domain Restriction**: Optional verification loops for `.edu` email domains to maintain campus integrity.

---

##  Contributing
Contributions are welcome! Please follow these steps:
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.


