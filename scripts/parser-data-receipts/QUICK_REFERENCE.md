# 🚀 Quick Reference - Recipe SQL Parser

## ⚡ Common Commands

```bash
# Basic Usage
node parseSQLToDatabase.js              # Parse & insert to database
node parseSQLToDatabase.js test         # Test parsing only
node parseSQLToDatabase.js clear        # Clear all data

# With memory optimization
node --max-old-space-size=4096 parseSQLToDatabase.js
```

## 📊 Expected Output Numbers

| Data | Count | 
|------|-------|
| Recipes | 100 |
| Ingredients | ~1,075 |
| Steps | ~560 |
| Images | ~935 |

## 🔍 Quick Checks

```bash
# Check if file exists
ls recipes.sql

# Quick recipe count
grep -c "INSERT INTO receipts" recipes.sql

# Check database connection
npx prisma studio

# Verify data in database
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  console.log('Recipes:', await prisma.receipt.count());
  await prisma.\$disconnect();
})();
"
```

## 🛠️ Troubleshooting Commands

```bash
# Debug parsing issues
node parseSQLToDatabase.js test | grep "parsing data"

# Check for JSON output
ls -la *.json

# Memory issues
node --max-old-space-size=8192 parseSQLToDatabase.js

# Database reset
node parseSQLToDatabase.js clear && node parseSQLToDatabase.js
```

## 📁 File Locations

```
scripts/
├── recipes.sql                 # Source data (REQUIRED)
├── parsed_recipes.json         # Output after normal run
├── test_parsed_recipes.json    # Output after test run
└── parseSQLToDatabase.js       # Main script
```

## ⚠️ Safety Checklist

- [ ] File `recipes.sql` exists in scripts directory
- [ ] Database connection working (`npx prisma generate`)
- [ ] Backup database if running in production
- [ ] Run test mode first: `node parseSQLToDatabase.js test`
- [ ] Check expected numbers match output

## 🔄 Typical Workflow

1. **Setup**: `cd scripts && ls recipes.sql`
2. **Test**: `node parseSQLToDatabase.js test`
3. **Verify**: Check JSON output and numbers
4. **Run**: `node parseSQLToDatabase.js`
5. **Validate**: `npx prisma studio`

## 📞 Quick Help

| Problem | Solution |
|---------|----------|
| 0 recipes | Check file format, run test mode |
| Database error | Check `.env`, run `npx prisma generate` |
| Memory error | Add `--max-old-space-size=4096` |
| Missing file | Ensure `recipes.sql` in scripts folder |

---
**💡 Tip**: Always test first! `node parseSQLToDatabase.js test` 