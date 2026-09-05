# Choice Grid — Production Deployment Runbook

Comprehensive deployment instructions for deploying the **Choice Grid** React frontend and connecting it to the Express + MongoDB backend.

---

## 1. Build Command

Build the production-ready, minified bundle with code-split vendor chunks:

```bash
cd choice-grid
npm run build
```

This compiles optimized assets into the `dist/` directory.

- Main entry bundle: **~125 kB**
- Total gzipped bundle: **< 350 kB** (well under 400 kB target)
- Output directory: `dist/`

---

## 2. Environment Configuration

### Frontend (`.env.production`)

Set the production backend API URL:

```env
VITE_API_URL=https://api.choicegrid.app
```

> **Note**: During client-side build, Vite bakes `import.meta.env.VITE_API_URL` into production assets. Rebuild (`npm run build`) whenever changing this environment variable.

### Backend (`choice-grid-backend/.env`)

Ensure the backend server has the following variables configured:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/choice_grid
JWT_SECRET=your_super_secure_production_jwt_secret_key
CORS_ORIGIN=https://choicegrid.app
```

---

## 3. Backend CORS Whitelist

The Express backend must allow the frontend's production origin. In `choice-grid-backend/server.js`:

```javascript
import cors from 'cors';

const allowedOrigins = [
  'https://choicegrid.app',
  'https://www.choicegrid.app',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
```

---

## 4. Serving Static Assets

### Option A: Nginx Production Server

Deploy the `dist/` directory onto your Linux web server (e.g. `/var/www/choicegrid/dist`).

Example `/etc/nginx/sites-available/choicegrid.conf`:

```nginx
server {
    listen 80;
    server_name choicegrid.app www.choicegrid.app;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name choicegrid.app www.choicegrid.app;

    ssl_certificate /etc/letsencrypt/live/choicegrid.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/choicegrid.app/privkey.pem;

    root /var/www/choicegrid/dist;
    index index.html;

    # Gzip compression for high-performance delivery
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/javascript application/javascript application/json image/svg+xml;

    # SPA routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static immutable assets for 1 year
    location ~* \.(?:js|css|svg|png|jpg|jpeg|webp|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

---

### Option B: Vercel Deployment

Create `vercel.json` in the root of `choice-grid/`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Deploy with Vercel CLI:

```bash
vercel --prod
```

---

## 5. Verification Checklist

Before opening traffic:

- [x] Run `npm run build` with zero errors.
- [x] Verify PWA `manifest.json` and `favicon.svg` load with HTTP 200.
- [x] Verify client-side routing on hard refresh (`/login`, `/register`, `/`).
- [x] Verify `POST /api/auth/login` and `GET /api/stats` against production backend.
- [x] Verify 2D arrow-key grid navigation and mobile pull-to-refresh.
