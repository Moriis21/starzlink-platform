# StarzLink

Professional opportunity platform connecting students and professionals with scholarships, jobs, training, campus updates, and career development resources.

Live application: [https://starzlink-platform.vercel.app](https://starzlink-platform.vercel.app)

## Status

Active web application

## Key capabilities

- User registration, profile completion, and email verification
- Scholarship, job, training, and campus update discovery
- Saved opportunities and notifications
- Administrative dashboards and analytics
- InsForge backend integration
- Stripe payment and webhook support

## Technology

- Next.js
- TypeScript
- Tailwind CSS
- InsForge
- Framer Motion
- Recharts
- Vitest

## Local development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

### Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | `next dev` |
| `npm run build` | `next build` |
| `npm run start` | `next start` |
| `npm run lint` | `eslint` |
| `npm run test` | `vitest run` |
| `npm run test:watch` | `vitest` |

## Configuration

Copy the provided environment template to a local environment file, then supply values for the variables required by your deployment.

Variables documented in `.env.example`:

- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `GROQ_API_KEY`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Never commit production credentials or private keys.

## Project structure

| Path | Purpose |
| --- | --- |
| `.github/` | GitHub workflows and repository automation |
| `app/` | Application routes and server or client features |
| `components/` | Reusable user interface components |
| `context/` | Shared React context providers |
| `hooks/` | Reusable application hooks |
| `insforge/` | InsForge backend configuration and functions |
| `lib/` | Shared libraries and workspace packages |
| `migrations/` | Database migrations |
| `public/` | Static assets |
| `scripts/` | Maintenance and build scripts |
| `tests/` | Automated tests |
| `types/` | Shared type definitions |

## Security

- Keep credentials and production environment files out of version control.
- Review authentication, authorization, database policies, and input validation before production use.
- Run the available lint, type checking, test, and build commands before deployment.

## License

No license file is currently included. All rights are reserved unless the repository owner states otherwise.

## Maintainer

Morris L. Dorley Jr, [@Moriis21](https://github.com/Moriis21)

