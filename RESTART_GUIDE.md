# 🚀 GUIDE DE REDÉMARRAGE - APPLICATION PROPRE

## ✅ What Was Fixed

### 1. **Configuration Management**
- ✅ Created `src/config.js` - Centralized environment configuration
- ✅ Created `.env.local` - Local development environment file
- ✅ Removed hardcoded environment variables from services

### 2. **Error Handling & Validation**
- ✅ Created `src/middleware/errorHandler.js` - Global error handler  
- ✅ Created `src/middleware/validation.js` - Request validation with Joi
- ✅ Created `src/constants/errors.js` - Error definitions and custom error class
- ✅ Integrated with Express app for automatic error handling

### 3. **Code Cleanup**
- ✅ **Merged Controllers**: SearchController + ScrapingController → Single SearchController
- ✅ **Removed Dead Code**:
  - Deleted `ScrapingController.js` (merged)
  - Deleted `ImapService.js` (unimplemented Phase 6)
  - Deleted `QuoteParserService.js` (unimplemented Phase 7)
  - Deleted `StorageService.js` (unimplemented Phase 7)
  - Deleted `scrapingRoutes.js` (merged into searchRoutes)

### 4. **Logging Improvements**
- ✅ Removed excessive emojis from logs (🔍📧🧪 → clean text)
- ✅ Standardized log format across all services
- ✅ Improved logger to handle metadata correctly

### 5. **Package Cleanup**
- ✅ Removed unused dependencies (75 packages):
  - `googleapis` (for Phase 6 IMAP)
  - `imap` (for Phase 6 IMAP)
  - `mailparser` (for Phase 6 IMAP)
  - `google-auth-library` (for Phase 6 IMAP)
  - `uuid` (unused)
  - `node-schedule` (for Phase 6)

### 6. **Routes & Backward Compatibility**
- ✅ Updated `searchRoutes.js` with validation middleware
- ✅ Added alias route `/api/scrape-emails` → `/api/search` for backward compatibility
- ✅ Added `/api/scrape-url` endpoint

---

## 🏃 HOW TO START THE APPLICATION

### Step 1: Ensure Configuration
```bash
# Make sure .env.local exists with your API keys
# See .env.local and .env.example for required values
cat .env.local
```

### Step 2: Install Dependencies (if not done)
```bash
npm install
```

### Step 3: Start Development Server
```bash
# Option A: Development mode with auto-reload
npm run dev

# Option B: Production mode
npm start
```

### Step 4: Verify Server is Running
```
GET http://localhost:3000/health
Response: { "status": "ok", "timestamp": "..." }

GET http://localhost:3000/api
Response: { "message": "API SourceBot v1.0.0", ... }
```

### Step 5: Check Configuration
```
GET http://localhost:3000/api/diagnostic
Response: {
  "status": "ok",
  "googlePlacesApiConfigured": true|false,
  "environment": "development",
  ...
}
```

---

## ⚙️ ENVIRONMENT SETUP

### Required API Keys
You need to set these in `.env.local`:

1. **Google Places API**
   ```
   GOOGLE_PLACES_API_KEY=your_key_here
   ```
   - Get from: https://console.cloud.google.com
   - Enable: Google Places API, Maps JavaScript API

2. **Mailjet Email Service**
   ```
   MAILJET_API_KEY=your_key
   MAILJET_API_SECRET=your_secret
   ```
   - Get from: https://app.mailjet.com/account

### Optional Settings
```bash
# Test mode (emails sent to TEST_EMAIL instead of real recipients)
TEST_MODE=true
TEST_EMAIL=test-inbox@example.com

# Mock email mode (simulates emails without actually sending)
MOCK_EMAIL_MODE=true

# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📋 AVAILABLE ROUTES

### Search & Scraping
```
POST /api/search
Body: { keyword, location, radius }
Response: { results: [...companies with emails], count, ... }
Aliases: POST /api/scrape-emails (backward compat)

POST /api/scrape-url
Body: { url }
Response: { emails: [...], found: count }

GET /api/place/:placeId
Response: { data: {...place details} }
```

### Email Sending
```
POST /api/email/send
POST /api/email/send-batch
POST /api/email/send-to-search-results
```

### Configuration & Testing
```
GET /api/config
GET /api/diagnostic
GET /api/test-google-places
```

---

## 🧪 TESTING ENDPOINTS

### Test Search
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "restaurant",
    "location": "Paris",
    "radius": 50
  }'
```

### Test Google Places API
```bash
curl http://localhost:3000/api/test-google-places
```

### Test Configuration
```bash
curl http://localhost:3000/api/diagnostic
```

---

## 📊 ARCHITECTURE IMPROVEMENTS

### Before
```
❌ process.env scattered everywhere
❌ Duplicate controller logic
❌ Inconsistent error handling
❌ Excessive emojis in logs
❌ Dead services imported
❌ No validation middleware
```

### After
```
✅ Centralized config.js
✅ Single SearchController  
✅ Global error handler
✅ Clean, parseable logs
✅ Only active code
✅ Request validation
✅ Type-safe error handling
```

---

## 🛠️ TROUBLESHOOTING

### "Google Places API not configured"
- Add `GOOGLE_PLACES_API_KEY` to `.env.local`
- Verify API key is valid
- Check API is enabled in Google Cloud Console

### "Mailjet credentials missing"
- Add `MAILJET_API_KEY` and `MAILJET_API_SECRET` to `.env.local`
- Get credentials from https://app.mailjet.com/account

### Validation errors on POST requests
- Check request body matches schema in `src/middleware/validation.js`
- See error response for details on which fields failed validation

### Port 3000 already in use
- Change PORT in `.env.local`: `PORT=3001`
- Or kill existing process: `npm run dev` uses nodemon, or Ctrl+C existing server

---

## 📦 NEXT STEPS (Planned Phases)

**Phase 6** (Future): IMAP email synching
- Re-implement `ImapService.js`
- Auto-fetch quote responses
- Add dependencies: `imap`, `mailparser`

**Phase 7** (Future): Quote parsing & storage
- Re-implement `QuoteParserService.js`
- Re-implement `StorageService.js`
- Parse email responses for prices, MOQs, delivery times

---

## ✨ SUMMARY

Your application is now:
- ✅ **Cleaner** - Dead code removed, focused on current features
- ✅ **More Maintainable** - Centralized config, clear error handling
- ✅ **More Secure** - Validated inputs, standardized error responses
- ✅ **Production-Ready** - No emojis in logs, proper middleware stack
- ✅ **Backward Compatible** - Old routes still work via aliases

Happy coding! 🎉
