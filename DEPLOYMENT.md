# Deployment Guide

Complete guide to deploy the Car Buyer Assistant application to production.

## Local Testing First

Always test locally before deploying to production.

```bash
npm install
npm run dev
# Test at http://localhost:3000
```

---

## Deployment Options

### Option 1: Heroku (Easiest for Beginners)

#### Prerequisites
- Heroku account (free tier available at https://heroku.com)
- Heroku CLI installed

#### Steps

1. **Login to Heroku:**
```bash
heroku login
```

2. **Create Heroku app:**
```bash
cd /tmp/car-buyer-app
heroku create your-app-name
```

3. **Set environment variables:**
```bash
heroku config:set OPENAI_API_KEY=your_openai_key
heroku config:set RAPIDAPI_KEY=your_rapidapi_key
heroku config:set RAPIDAPI_HOST=vin-decoder19.p.rapidapi.com
heroku config:set NODE_ENV=production
```

4. **Deploy:**
```bash
git push heroku main
# Or if not using git:
heroku deploy --source-dir=.
```

5. **View logs:**
```bash
heroku logs --tail
```

6. **Access your app:**
```
https://your-app-name.herokuapp.com
```

#### Costs
- Free tier: 550 free dyno hours/month
- Paid tier: $7-50/month depending on usage
- Plus API costs (OpenAI ~$0.003 per request)

---

### Option 2: Railway (Modern Alternative)

#### Prerequisites
- Railway account (at https://railway.app)
- GitHub account (recommended)

#### Steps

1. **Connect GitHub repository:**
   - Fork the project to GitHub
   - Go to railway.app
   - Connect GitHub account
   - Select your car-buyer-app repository

2. **Create new project:**
   - Click "New Project"
   - Select "GitHub Repo"
   - Choose car-buyer-app

3. **Add environment variables:**
   - Go to project settings
   - Add variables:
     - `OPENAI_API_KEY`
     - `RAPIDAPI_KEY`
     - `RAPIDAPI_HOST`
     - `NODE_ENV=production`
     - `PORT=3000`

4. **Deploy automatically:**
   - Push to main branch
   - Railway auto-deploys

5. **Access your app:**
   - Check Railway dashboard for URL

#### Costs
- Free tier: $5 monthly credit
- Paid tier: Pay-as-you-go ($0.001/hour compute)

---

### Option 3: Digital Ocean (More Control)

#### Prerequisites
- Digital Ocean account (at https://digitalocean.com)
- SSH key configured

#### Steps

1. **Create droplet:**
   - Go to Create → Droplet
   - Choose: Ubuntu 22.04 LTS
   - Size: Basic ($4-6/month)
   - Add SSH key
   - Click Create

2. **Connect to droplet:**
```bash
ssh root@your_droplet_ip
```

3. **Install dependencies:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs npm git
```

4. **Clone and setup app:**
```bash
cd /home
git clone https://github.com/your-username/car-buyer-app.git
cd car-buyer-app
npm install
```

5. **Setup environment:**
```bash
nano .env
# Add your API keys
# Save with Ctrl+X, Y, Enter
```

6. **Setup PM2 (process manager):**
```bash
sudo npm install -g pm2
pm2 start server.js --name "car-buyer-app"
pm2 startup
pm2 save
```

7. **Setup Nginx (reverse proxy):**
```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/default
```

Add to server block:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

8. **Setup SSL (HTTPS):**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

#### Costs
- Droplet: $4-6/month
- Plus API costs

---

### Option 4: AWS (Enterprise Option)

#### Prerequisites
- AWS account
- AWS CLI configured

#### Using Elastic Beanstalk (Easiest AWS option)

1. **Install EB CLI:**
```bash
pip install awsebcli --upgrade --user
```

2. **Initialize:**
```bash
cd /tmp/car-buyer-app
eb init -p node.js car-buyer-app
```

3. **Create environment:**
```bash
eb create production
```

4. **Set environment variables:**
```bash
eb setenv \
  OPENAI_API_KEY=your_key \
  RAPIDAPI_KEY=your_key \
  NODE_ENV=production
```

5. **Deploy:**
```bash
eb deploy
```

6. **View logs:**
```bash
eb logs
```

#### Costs
- Variable based on usage
- Typically $10-50/month for small app
- Plus API costs

---

## Using Docker (Any Platform)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - RAPIDAPI_KEY=${RAPIDAPI_KEY}
      - RAPIDAPI_HOST=vin-decoder19.p.rapidapi.com
      - NODE_ENV=production
```

Run:
```bash
docker-compose up
```

---

## Environment Variables for Production

### Required
```env
OPENAI_API_KEY=your_openai_api_key
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=vin-decoder19.p.rapidapi.com
```

### Recommended
```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

### Optional (For scaling)
```env
REDIS_URL=redis://localhost:6379
DB_URL=mongodb://connection-string
```

---

## Pre-Deployment Checklist

- [ ] All dependencies installed
- [ ] `.env` file created with all required keys
- [ ] `.env` added to `.gitignore`
- [ ] API keys are valid and have quota
- [ ] Tested locally with `npm run dev`
- [ ] No console.log statements with sensitive data
- [ ] CORS properly configured
- [ ] Error handling in place
- [ ] Health check endpoint working
- [ ] README updated with deployment URL

---

## Post-Deployment

### Monitor Application

```bash
# Check logs
heroku logs --tail          # Heroku
railway logs                 # Railway
eb logs                      # AWS
pm2 logs                     # Digital Ocean

# Monitor errors
# Setup error tracking service (Sentry, LogRocket, etc)
```

### Monitor API Usage

1. **OpenAI Usage:**
   - https://platform.openai.com/account/billing/overview
   - Set spending limits
   - Monitor tokens used

2. **RapidAPI Usage:**
   - https://rapidapi.com/developer/billing
   - Check request limits
   - Monitor costs

### Update Domain (Optional)

Get a custom domain:
1. Register at GoDaddy, Namecheap, etc.
2. Point DNS to your deployment
3. Setup SSL certificate

---

## Scaling Considerations

### If getting high traffic:

1. **Add caching:**
```bash
npm install redis
```

2. **Database for history:**
```bash
npm install mongoose  # For MongoDB
```

3. **Rate limiting:**
```bash
npm install express-rate-limit
```

4. **Load balancer:**
   - Heroku automatic
   - AWS ELB
   - Nginx (Digital Ocean)

### Monitor performance:

- Response times
- API usage
- Error rates
- Server load

---

## Troubleshooting Deployment

### App crashes on startup
```
Check: NODE_ENV is set to 'production'
Check: All environment variables are set
Check: Dependencies are installed
```

### 503 Service Unavailable
```
Check: Server is actually running
Check: PORT environment variable correct
Check: No errors in logs
```

### CORS errors
```
Check: CORS middleware enabled
Check: Frontend URL allowed
Check: Headers configured correctly
```

### API calls failing
```
Check: API keys are valid
Check: API quota not exceeded
Check: Rate limiting not hit
Check: Network connectivity
```

### High latency
```
Optimize: Cache popular searches
Optimize: Add database for quick lookups
Optimize: Implement request batching
Optimize: Use CDN for static files
```

---

## Continuous Deployment (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
```

---

## Backup & Recovery

### Backup your .env file
```bash
# Keep a secure backup (NOT in git)
cp .env ~/.car-buyer-app-backup.env
chmod 600 ~/.car-buyer-app-backup.env
```

### Disaster recovery plan
1. Keep backup of .env elsewhere
2. Document all environment variables
3. Keep API keys in password manager
4. Regular application backups
5. Monitor health checks

---

## Cost Optimization

### Reduce OpenAI costs:
- Cache popular cars
- Implement request deduplication
- Use cheaper models for simple queries
- Batch requests where possible

### Sample monthly costs:
```
Hosting:        $5-10/month
OpenAI:         $10-50/month (depends on usage)
RapidAPI:       Free tier or $5/month
Domain:         $10-15/year
Total:          $20-60/month
```

---

## Getting Help

### Deployment Issues
- Heroku: https://help.heroku.com
- Railway: https://docs.railway.app
- Digital Ocean: https://docs.digitalocean.com
- AWS: https://docs.aws.amazon.com

### API Issues
- OpenAI: https://help.openai.com
- RapidAPI: https://rapidapi.com/support

### Application Issues
- Check logs
- Review error messages
- Test locally first
- Check API keys and quotas

---

**Happy deploying!** 🚀
