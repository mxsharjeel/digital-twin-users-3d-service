# Digital Twin Users 3D Service

A service for managing digital twin users and their 3D representations.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your database connection in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/digital_twin_3d?schema=public"
```

3. Run Prisma migrations:
```bash
npm run prisma:migrate
```

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

## Development

Run the development server:
```bash
npm run dev
```

## Database Schema

The service includes the following models:
- **User**: User accounts
- **DigitalTwin**: 3D digital twin representations with position, rotation, scale
- **Animation**: Animation definitions for digital twins
- **Interaction**: Interaction handlers for digital twins
- **Session**: User session management

## Scripts

- `npm run dev` - Run development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
