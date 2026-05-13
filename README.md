# ACM Cinema E-Booking System

A full-stack cinema booking application built with Next.js frontend and Spring Boot backend. Users can browse movies, select seats, and purchase tickets online.

> **Disclaimer**: This is a student project for educational purposes only. The application does not process real payments and is not intended for commercial use. All booking functionality is simulated for demonstration purposes.

## Project Links

- **Frontend Deployment**: [Vercel](https://acm-cinema.vercel.app/)
- **Backend API**: [Render](https://absolute-cinema-movies.onrender.com/)
- **Project Management**: [Jira](https://csci-4050-mmbbfc.atlassian.net/jira/software/projects/SCRUM/summary?atlOrigin=eyJpIjoiNzk4MzY3MjBjNzBjNGI3N2FhYjkxZDNlYTRhOTQ5NGYiLCJwIjoiaiJ9)
- **Design System**: [Figma](https://www.figma.com/community/file/1602290226089410310)
- **Video Demo**" [YouTube](https://youtu.be/92fEVh5wNyI)

## Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Data Fetching**: React Query (TanStack Query)
- **Authentication**: JWT with HTTP-only cookies

### Backend

- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Database**: PostgreSQL (Neon Cloud)
- **Authentication**: Spring Security with JWT
- **Database Migration**: Flyway
- **Email**: SMTP (Gmail)

### DevOps & Tools

- **Frontend Deployment**: Vercel
- **Backend Deployment**: TBD
- **Database**: Neon PostgreSQL
- **Version Control**: Git
- **Package Management**: npm (frontend), Maven (backend)

## Quick Start

### Prerequisites

- Node.js 18+ (for frontend)
- Java 17+ (for backend)
- Git (for version control)
- PostgreSQL client tools (for database backups)

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd swe-proj-acm
   ```

2. **Install frontend dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   # macOS/Linux:
   source set_env.sh

   # Windows PowerShell:
   .\set_env.ps1
   ```

4. **Start the application:**

   ```bash
   # Terminal 1 - Frontend (http://localhost:3000)
   npm run dev

   # Terminal 2 - Backend (http://localhost:8080)
   source ../set_env.sh  # From project root
   cd backend
   ./mvnw spring-boot:run  # macOS/Linux
   # mvnw spring-boot:run  # Windows
   ```

   **Important**: If running from IDE (IntelliJ, Eclipse, VS Code), make sure to configure environment variables in IDE settings

## Features

### Movie Management

- Browse current and upcoming movies
- Filter movies by genre, date, and title
- View detailed movie information with trailers
- Check showtime and seat availability

### Booking System

- Interactive seat selection with real-time availability
- Multi-step booking process
- Secure payment integration _(Coming Soon)_
- Email confirmations

### User Management

- User registration and authentication
- Profile management
- Order history
- Admin dashboard for movie and user management

### Security Features

- JWT-based authentication
- Password encryption (BCrypt)
- CORS configuration
- Input validation and sanitization

## Database Management

### Schema Migrations (Flyway)

Database schema changes are managed with Flyway migrations in `backend/src/main/resources/db/migration/`.

**Create a new migration:**

```bash
# Example: V2__add_users_table.sql
CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Backups

**Manual backup:**

```bash
source set_env.sh  # Sets environment variables
./db_backup/backup_postgres.sh
```

**Restore from backup:**

```bash
# Restore to same database
./db_backup/restore_postgres.sh db_backup/backups/backup_2024-10-07_143022.dump

# Restore to different database
./db_backup/restore_postgres.sh db_backup/backups/backup_2024-10-07_143022.dump "postgresql://user:pass@host:5432/different_db"
```

**Automatic daily backups:**

```bash
source set_env.sh
./db_backup/setup_daily_backup.sh
```

**Cleanup old backups:**

```bash
./db_backup/cleanup_backups.sh [backup_folder] [days_to_keep]
```

## Development

### Available Scripts

**Frontend:**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

**Backend:**

```bash
./mvnw spring-boot:run           # Start development server
./mvnw clean package            # Build JAR file
./mvnw test                     # Run tests
```

### Environment Variables

The application requires several environment variables. Copy `set_env.example` to `set_env.sh` (Unix) or `set_env.ps1` (Windows) and fill in your values:

- `DATABASE_URL` - JDBC connection string for Java backend
- `PG_DATABASE_URL` - PostgreSQL connection string for CLI tools
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT token signing
- `MAIL_*` - Email configuration for notifications

## Documentation

- **[Developer Guide](./DEVELOPMENT_GUIDE.md)** - Comprehensive technical documentation
- **[API Reference](./DEVELOPMENT_GUIDE.md#api-reference)** - Endpoint documentation
- **[Component Guide](./DEVELOPMENT_GUIDE.md#frontend-components)** - Frontend component usage

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team

- **Frontend Development**: [Thai Nguyen, Kayla McGuinn, Sidhant Dash, Hilton DeVille]
- **Backend Development**: [Thai Nguyen, Vishal Apparajav, Hilton DeVille, Sidhant Dash]
- **Database Design**: [Hilton DeVille, Vishal Apparajav, Thai Nguyen]
- **Scrum Master**: [Thai Nguyen]
- **Maintenance:** [Thai Nguyen]

---

Built by the ACM Cinema Team (aka Mermaid Man & Barnacle Boy Fan Club)
