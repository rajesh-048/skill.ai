# SkillSphere AI — Deployment Guide

## Architecture

| Component | Platform | URL Pattern |
|-----------|----------|-------------|
| Frontend (React + Vite) | Vercel | `https://your-app.vercel.app` |
| Backend (FastAPI + SQLite) | Railway | `https://your-app.up.railway.app` |

---

## 1. Deploy Backend to Railway

### Prerequisites
- [Railway account](https://railway.app) (free tier works)
- GitHub repo with this code

### Steps

1. **Push code to GitHub**
   ```bash
   git add -A
   git commit -m "Production deploy"
   git push origin main
   ```

2. **Create Railway project**
   - Go to [railway.app](https://railway.app) → New Project → **Deploy from GitHub repo**
   - Select your repo
   - Railway auto-detects the `backend/Dockerfile`

3. **Set environment variables** in Railway dashboard:
   ```
   SECRET_KEY=<generate-a-random-secret-key>
   DEMO_MODE=True
   OPENROUTER_API_KEY=<your-openrouter-key>  # Optional: enables live MiMo AI
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   MIMO_MODEL=xiaomi/mimo-v2.5-pro
   ```

4. **Note your Railway URL** — it will be something like:
   ```
   https://your-project-production.up.railway.app
   ```

---

## 2. Deploy Frontend to Vercel

### Prerequisites
- [Vercel account](https://vercel.com) (free tier works)

### Steps

1. **Update `vercel.json`** — replace the Railway URL in the `rewrites` section:
   ```json
   "destination": "https://YOUR-RAILWAY-URL.up.railway.app/api/:path*"
   ```

2. **Push to GitHub** (if not already done)

3. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com) → New Project → **Import Git Repository**
   - Select your repo
   - Framework Preset: **Other**
   - Root Directory: `/` (leave default)
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`

4. **Deploy** — Vercel auto-deploys on every push to `main`

---

## 3. Environment Variables Reference

### Backend (Railway)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | — | JWT secret (generate with `python -c "import secrets; print(secrets.token_hex(32))"`) |
| `DEMO_MODE` | No | `True` | Enable offline fallback when no AI key is set |
| `OPENROUTER_API_KEY` | No | — | OpenRouter API key for live MiMo responses |
| `MIMO_MODEL` | No | `xiaomi/mimo-v2.5-pro` | MiMo model to use via OpenRouter |
| `OPENAI_API_KEY` | No | — | Direct OpenAI key (fallback) |

### Frontend (Vercel)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `/api` | Set only if backend is on a different domain without proxy |

---

## 4. Custom Domain (Optional)

### Vercel
- Settings → Domains → Add your domain
- Update DNS CNAME to `cname.vercel-dns.com`

### Railway
- Settings → Networking → Generate Domain
- Or add custom domain with DNS verification

---

## 5. Local Development

```bash
# Backend
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --port 8000 --reload

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Frontend runs on `http://localhost:5173`, proxies `/api` to `http://localhost:8000`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors in production | Ensure Railway allows your Vercel domain in CORS settings |
| 502 Bad Gateway | Backend may be cold-starting; wait 30s and retry |
| AI not responding | Check `OPENROUTER_API_KEY` is set in Railway env vars |
| Static files 404 | Ensure `uploads/` directory exists in Railway volume |
