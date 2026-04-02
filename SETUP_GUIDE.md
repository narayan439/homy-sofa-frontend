# Homy Sofa — Setup & Installation Guide

Complete step-by-step guide for setting up and deploying Homy Sofa.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Frontend Setup](#frontend-setup)
3. [Backend Setup](#backend-setup)
4. [Database Setup](#database-setup)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Development Workflow](#development-workflow)
8. [Docker Deployment](#docker-deployment)
9. [Troubleshooting](#troubleshooting)

---

## 📋 Prerequisites

### System Requirements
- **OS:** Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Disk Space:** 5GB minimum
- **RAM:** 4GB minimum (8GB recommended)

### Required Software

#### For Frontend Development
- **Node.js:** v16.x or v18.x ([Download](https://nodejs.org/))
- **npm:** v7.x or v8.x (comes with Node.js)
- **Angular CLI:** v15+ (installed via npm)

#### For Backend Development
- **Java JDK:** v17 or v21 ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Maven:** v3.8+ ([Download](https://maven.apache.org/download.cgi))
- **MySQL:** v8.0+ ([Download](https://dev.mysql.com/downloads/mysql/))

#### For Docker (Optional)
- **Docker:** Latest stable ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose:** Latest stable

### Verification

```bash
# Check Node.js version
node --version        # Should be v16+
npm --version         # Should be v7+

# Check Java version
java -version         # Should be v17+

# Check Maven version
mvn --version         # Should be v3.8+

# Check MySQL version
mysql --version       # Should be v8.0+
```

---

## 🖥️ Frontend Setup

### Step 1: Clone Repository
```bash
cd Documents/GitHub
git clone https://github.com/your-username/homy-sofa-frontend.git
cd homy-sofa-frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will download all required packages from npm registry (~500MB).

**Expected output:**
```
added 1000 packages in 2m
```

### Step 3: Verify Installation
```bash
ng version
```

Expected output should show Angular CLI version 15+.

### Step 4: Environment Configuration

Create/update environment files for different environments:

#### `src/environments/environment.ts` (Development)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

#### `src/environments/environment.prod.ts` (Production)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.homysofa.com/api'  // Update with your backend URL
};
```

### Step 5: Build Verification
```bash
ng build
```

Expected: `dist/homy-sofa-frontend/` folder created with optimized bundles.

---

## 🔧 Backend Setup

### Step 1: Navigate to Backend
```bash
cd backend/Homy-backend
```

### Step 2: Verify Maven & Java
```bash
java -version
mvn --version
```

### Step 3: Create Application Properties

Create `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/homy_db
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Flyway Configuration (Database Migrations)
spring.flyway.locations=classpath:db/migration
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true

# File Upload Configuration
app.upload.dir=uploads/backend
app.max-upload-size=10485760  # 10MB

# JWT Configuration
jwt.secret=your-super-secret-key-here-min-32-characters-long
jwt.expiration=86400000  # 24 hours in milliseconds

# Email Configuration (Optional)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# CORS Configuration
server.servlet.cors.allowed-origins=http://localhost:4200,http://localhost:3000
server.servlet.cors.allowed-methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
server.servlet.cors.allowed-headers=*
server.servlet.cors.allow-credentials=true

# Logging
logging.level.root=INFO
logging.level.com.homy.backend=DEBUG
```

### Step 4: Download Dependencies
```bash
mvn clean compile
```

This downloads all Maven dependencies (~500MB).

### Step 5: Build Project
```bash
mvn clean package
```

Expected: `target/Homy-backend-*.jar` file created.

---

## 🗄️ Database Setup

### Step 1: Create Database

```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE homy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional, for security)
CREATE USER 'homy_user'@'localhost' IDENTIFIED BY 'homy_password';
GRANT ALL PRIVILEGES ON homy_db.* TO 'homy_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Step 2: Verify Connection

```bash
# Test connection with root user
mysql -u root -p -h localhost -e "CREATE TABLE homy_db.test_table (id INT); DROP TABLE homy_db.test_table;"

# Test connection with homy_user
mysql -u homy_user -p -h localhost homy_db -e "SELECT 1;"
```

### Step 3: Flyway Migrations

Migrations run automatically on application startup. Migration files are in:
```
backend/Homy-backend/src/main/resources/db/migration/
```

**Migration files:**
- `V1__initial_schema.sql` — Initial tables
- `V2__assign_technician.sql` — Add technician support
- `V3__add_booking_indexes.sql` — Optimize queries

**Manual migration (if needed):**
```bash
cd backend/Homy-backend
mvn flyway:migrate -Dflyway.configFiles=src/main/resources/flyway.properties
```

### Step 4: Create Admin User (Optional)

After backend starts, create admin via API or database:

```sql
INSERT INTO admin_users (email, password, name, created_at) VALUES 
('admin@example.com', '$2a$10$...hashed_password...', 'Administrator', NOW());
```

Or use the API endpoint (POST `/api/auth/register`).

---

## ⚙️ Configuration

### Frontend Configuration Files

**`angular.json`** — Angular CLI configuration
```json
{
  "projects": {
    "homy-sofa-frontend": {
      "architect": {
        "serve": {
          "options": {
            "port": 4200,
            "proxyConfig": "proxy.conf.json"
          }
        }
      }
    }
  }
}
```

**`proxy.conf.json`** — Development proxy (avoid CORS issues)
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "logLevel": "debug"
  }
}
```

**`tsconfig.json`** — TypeScript configuration
```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Backend Configuration

**Key configuration properties:**

| Property | Description | Default | Production |
|----------|-------------|---------|-----------|
| `server.port` | Server port | 8080 | 8080 |
| `spring.datasource.url` | Database URL | localhost:3306 | remote-db:3306 |
| `spring.jpa.hibernate.ddl-auto` | Schema generation | validate | validate |
| `jwt.secret` | JWT secret key | - | Use environment variable |
| `app.upload.dir` | Upload directory | uploads/backend | /var/uploads |
| `server.servlet.cors.allowed-origins` | CORS origins | localhost:4200 | Production domain |

### Using Environment Variables

For security, use environment variables instead of hardcoding secrets:

**Backend (application.properties):**
```properties
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
spring.mail.password=${MAIL_PASSWORD}
```

**Set environment variables:**

**Windows (Command Prompt):**
```cmd
set DB_PASSWORD=your-secure-password
set JWT_SECRET=your-jwt-secret-key-min-32-chars
set MAIL_PASSWORD=your-app-password
mvn spring-boot:run
```

**macOS/Linux (Bash):**
```bash
export DB_PASSWORD=your-secure-password
export JWT_SECRET=your-jwt-secret-key-min-32-chars
export MAIL_PASSWORD=your-app-password
mvn spring-boot:run
```

---

## 🚀 Running the Application

### Option 1: Development Mode (Side-by-side)

**Terminal 1 — Frontend:**
```bash
cd homy-sofa-frontend
npm start
# or: ng serve
# Visit: http://localhost:4200
```

**Terminal 2 — Backend:**
```bash
cd backend/Homy-backend
mvn spring-boot:run
# Backend runs on: http://localhost:8080
```

**Expected output:**

Frontend:
```
✔ Compiled successfully.
LocalServerUrl: http://localhost:4200/
```

Backend:
```
Tomcat started on port(s): 8080
Started HomyBackendApplication in 5.234 seconds
```

### Option 2: Run Built JAR

**Build:**
```bash
cd backend/Homy-backend
mvn clean package
```

**Run:**
```bash
java -jar target/Homy-backend-*.jar
```

### Option 3: Run Production Build

**Build frontend:**
```bash
cd homy-sofa-frontend
ng build --configuration production
```

**Result:** Optimized build in `dist/homy-sofa-frontend/`

**Serve with Nginx:**
```bash
# Copy dist to Nginx html directory
cp -r dist/homy-sofa-frontend/* /usr/share/nginx/html/

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔄 Development Workflow

### Project Structure
```
homy-sofa-frontend/
├── src/app/
│   ├── user/              # Public site (lazy-loaded)
│   ├── admin/             # Admin dashboard (lazy-loaded)
│   ├── technician/        # Technician portal (lazy-loaded)
│   ├── core/              # Services, guards, interceptors
│   ├── shared/            # Shared components, material module
│   └── models/            # Data models/interfaces
├── package.json           # Frontend dependencies
└── angular.json           # Angular CLI config
```

### Adding a New Feature

1. **Generate component:**
   ```bash
   ng generate component admin/new-feature/new-feature
   ```

2. **Add to module:**
   ```typescript
   // admin.module.ts
   import { NewFeatureComponent } from './new-feature/new-feature.component';
   
   @NgModule({
     declarations: [NewFeatureComponent],
     imports: [CommonModule, SharedModule]
   })
   ```

3. **Add route:**
   ```typescript
   // admin-routing.module.ts
   {
     path: 'new-feature',
     component: NewFeatureComponent,
     canActivate: [AdminGuard]
   }
   ```

### Running Tests

**Frontend:**
```bash
npm test
# or
ng test
```

**Backend:**
```bash
cd backend/Homy-backend
mvn test
```

### Code Quality

**Lint Check:**
```bash
# Frontend
ng lint

# Backend (using checkstyle)
mvn checkstyle:check
```

---

## 🐳 Docker Deployment

### Build Docker Images

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/homy-sofa-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build:**
```bash
docker build -t homy-frontend:latest .
```

**Backend Dockerfile:**
```dockerfile
FROM maven:3.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/Homy-backend-*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

**Build:**
```bash
cd backend/Homy-backend
docker build -t homy-backend:latest .
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: homy_db
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  backend:
    build: ./backend/Homy-backend
    environment:
      DB_PASSWORD: root
      JWT_SECRET: your-secret-key-here
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    links:
      - mysql

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql-data:
```

**Run:**
```bash
docker-compose up -d
```

**Access:**
- Frontend: http://localhost
- Backend API: http://localhost:8080
- MySQL: localhost:3306

---

## 🐛 Troubleshooting

### Frontend Issues

#### Issue: `npm install` fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### Issue: `ng serve` shows errors
**Solution:**
```bash
# Check Angular version
ng version

# Update Angular CLI
npm install -g @angular/cli@latest

# Upgrade project (carefully)
ng update @angular/cli @angular/core
```

#### Issue: CORS errors
**Solution:** Ensure `proxy.conf.json` is configured:
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false
  }
}
```

### Backend Issues

#### Issue: Port 8080 already in use
**Solution:**
```bash
# Find process using port 8080
netstat -tlnp | grep 8080

# Kill process
kill -9 <PID>

# Or change port in application.properties
server.port=8081
```

#### Issue: Database connection fails
**Solution:**
```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1;"

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Check application.properties connection string
spring.datasource.url=jdbc:mysql://localhost:3306/homy_db
```

#### Issue: Flyway migration fails
**Solution:**
```bash
# Check migration files
ls src/main/resources/db/migration/

# View migration status
mvn flyway:info -Dflyway.configFiles=src/main/resources/flyway.properties

# Repair (use with caution)
mvn flyway:repair
```

### Database Issues

#### Issue: MySQL won't start
**macOS (Homebrew):**
```bash
brew services restart mysql
```

**Windows (Services):**
```cmd
net start MySQL80
```

**Linux (systemd):**
```bash
sudo systemctl restart mysql
```

#### Issue: Lost root password
```bash
# Reset MySQL root password (macOS)
sudo mysqld_safe --skip-grant-tables &
mysql -u root
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new-password';
```

### Docker Issues

#### Issue: Docker container won't start
**Solution:**
```bash
# View logs
docker logs <container-id>

# Rebuild image
docker-compose build --no-cache

# Restart services
docker-compose down
docker-compose up -d
```

#### Issue: Database not initializing
**Solution:**
```bash
# Check MySQL volume
docker volume ls
docker volume inspect <volume-name>

# Remove volume and recreate
docker-compose down -v
docker-compose up -d
```

---

## ✅ Post-Setup Checklist

- [ ] Frontend running on http://localhost:4200
- [ ] Backend running on http://localhost:8080
- [ ] MySQL database created and accessible
- [ ] Admin user created and can login
- [ ] Services visible in /services endpoint
- [ ] Can create booking via API
- [ ] Can view bookings in admin dashboard
- [ ] File uploads working (try uploading service image)
- [ ] Email notifications configured (if applicable)
- [ ] SSL/HTTPS configured (production only)

---

## 📞 Getting Help

- **Documentation:** Check [PROJECT_FUNCTIONALITY.md](PROJECT_FUNCTIONALITY.md)
- **API Reference:** See [API_REFERENCE.md](API_REFERENCE.md)
- **Architecture:** Refer to [ARCHITECTURE.md](ARCHITECTURE.md)
- **Workflows:** Review [WORKFLOWS.md](WORKFLOWS.md)

---

**Last Updated:** March 2024

For the latest updates, visit the [GitHub Repository](https://github.com/your-username/homy-sofa-frontend).
