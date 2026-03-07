# Files to Delete - Dead Code Cleanup

This file lists all files that should be deleted as they are no longer used:

## Services to Delete (Replaced by merged SearchController)
- src/controllers/ScrapingController.js
  (Functionality merged into SearchController, routes aliased to searchRoutes)

## Stub Services to Delete (Future phases not implemented)
- src/services/ImapService.js
  (Unimplemented placeholder for Phase 6 - IMAP email syncing)

- src/services/QuoteParserService.js
  (Unimplemented placeholder for Phase 7 - Email quote parsing)

- src/services/StorageService.js
  (Unimplemented placeholder for Phase 7 - Local data persistence)

## Route File to Delete
- src/routes/scrapingRoutes.js
  (All routes migrated to searchRoutes.js with aliases for backward compatibility)

## Files NO LONGER NEEDED (Empty/Placeholder)
- src/middleware/ (was empty, now contains validation + errorHandler)
- src/models/ (was empty, not needed for current architecture)

---

## HOW TO DELETE

### Option 1: Using PowerShell (Recommended)
```powershell
cd "c:\Users\Admin\Documents\ENSAM\bachelor 3A\entreprenariat\Projet sourcebot"

Remove-Item -Path "src/controllers/ScrapingController.js"
Remove-Item -Path "src/services/ImapService.js"
Remove-Item -Path "src/services/QuoteParserService.js"
Remove-Item -Path "src/services/StorageService.js"
Remove-Item -Path "src/routes/scrapingRoutes.js"
```

### Option 2: Using File Explorer
Just navigate to each file and delete it manually.

### Option 3: Automatic Cleanup (I can run this for you)
Just give me permission and I'll execute the deletion automatically.

---

## After Deletion
1. Run: `npm install` to install updated dependencies (removes unused packages)
2. Run: `npm run dev` to start the application
3. Test endpoints to verify everything works

---
