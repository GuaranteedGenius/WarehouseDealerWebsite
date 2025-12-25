# Industrial Realty Partners - Warehouse & Industrial Real Estate Website

A production-ready website and CMS for industrial real estate agents, built with Next.js 14, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

### Public Website
- **Home Page**: Hero section, featured properties, about section, property types
- **Properties Gallery**: Filterable grid with search, pagination, and status filtering
- **Property Detail**: Photo gallery, key stats, highlights, and lead capture forms
- **Contact Page**: Contact form with validation and email notifications
- **SEO**: Dynamic meta tags, OpenGraph, sitemap.xml, robots.txt

### Admin CMS Dashboard
- **Secure Authentication**: Email/password login with session management
- **Property Management**: Create, edit, archive properties with image upload
- **Image Management**: Drag-and-drop upload, reorder, delete
- **Lead Management**: View and manage inbound inquiries with status tracking
- **Dashboard**: Quick stats and recent activity overview

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: iron-session for secure session management
- **Storage**: S3-compatible storage (or local fallback for development)
- **Email**: Nodemailer for lead notifications
- **Validation**: Zod for type-safe form validation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- (Optional) S3-compatible storage account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd warehouse-dealer-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/warehouse_dealer"

   # Auth (generate a secure 32+ character secret)
   AUTH_SECRET="your-super-secret-key-min-32-chars-here"

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_SITE_NAME="Industrial Realty Partners"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Public site: http://localhost:3000
   - Admin login: http://localhost:3000/admin/login
     - Email: `admin@example.com`
     - Password: `admin123`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AUTH_SECRET` | Session encryption key (32+ chars) | Yes |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Yes |
| `NEXT_PUBLIC_SITE_NAME` | Site name for branding | No |
| `STORAGE_ENDPOINT` | S3-compatible endpoint | No |
| `STORAGE_BUCKET` | S3 bucket name | No |
| `STORAGE_ACCESS_KEY` | S3 access key | No |
| `STORAGE_SECRET_KEY` | S3 secret key | No |
| `STORAGE_REGION` | S3 region | No |
| `SMTP_HOST` | SMTP server host | No |
| `SMTP_PORT` | SMTP server port | No |
| `SMTP_USER` | SMTP username | No |
| `SMTP_PASS` | SMTP password | No |
| `NOTIFY_TO_EMAIL` | Email for lead notifications | No |

## Project Structure

```
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data script
├── public/
│   └── uploads/          # Local image storage (dev)
├── src/
│   ├── app/
│   │   ├── (public)/     # Public website routes
│   │   ├── admin/        # Admin CMS routes
│   │   └── api/          # API routes
│   ├── components/
│   │   ├── forms/        # Form components
│   │   ├── layout/       # Header, Footer
│   │   ├── properties/   # Property components
│   │   └── ui/           # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts       # Authentication utilities
│   │   ├── db.ts         # Prisma client
│   │   ├── email.ts      # Email notifications
│   │   ├── rate-limit.ts # Rate limiting
│   │   ├── storage.ts    # File storage (S3/local)
│   │   ├── utils.ts      # Utility functions
│   │   └── validations.ts # Zod schemas
│   └── types/            # TypeScript types
```

## Database Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database (development)
npm run db:push

# Create a migration (production)
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Production Checklist

- [ ] Set up PostgreSQL database
- [ ] Configure S3-compatible storage for images
- [ ] Set all required environment variables
- [ ] Set up SMTP for email notifications
- [ ] Change default admin password
- [ ] Configure your domain and SSL

## Content Models

### Property
- Title, address, city, state, zip
- Description (markdown/text)
- Square feet, clear height, dock doors, drive-in doors
- Acreage, lease/sale type, price/rate
- Available date, highlights
- Status: Available, Under Contract, Leased, Sold
- Featured flag

### Lead
- Name, email, phone, company
- Message, preferred date/time
- Type: Contact, Request Info, Schedule Walkthrough
- Status: New, Contacted, Closed
- Associated property (optional)

## Security Features

- CSRF protection via Next.js
- Secure session cookies (httpOnly, secure)
- Input validation with Zod
- Rate limiting on form submissions
- Honeypot spam protection
- Password hashing with bcrypt
- Protected admin routes

## License

MIT
