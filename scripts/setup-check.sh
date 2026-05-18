#!/bin/bash
# SQLite Migration Setup Checklist
# Run through these steps untuk complete setup

echo "🎯 SQLite Migration Setup Checklist"
echo "================================="
echo ""

# Check 1: Node/npm/bun installed
echo "✓ Check 1: Package Manager"
if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo "  ✅ npm found: v$npm_version"
else
    echo "  ❌ npm not found"
    exit 1
fi

# Check 2: Project structure
echo ""
echo "✓ Check 2: Project Structure"
files=(
    "src/db/schema.sql"
    "src/integrations/sqlite/client.ts"
    "src/integrations/sqlite/queries.ts"
    "src/integrations/sqlite/index.ts"
    "scripts/init-db.js"
    "SQLITE_MIGRATION.md"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        all_exist=false
    fi
done

if [ "$all_exist" = false ]; then
    echo ""
    echo "⚠️  Some files are missing. Please check migration files."
    exit 1
fi

# Check 3: .env.local
echo ""
echo "✓ Check 3: Environment Configuration"
if [ -f ".env.local" ]; then
    echo "  ✅ .env.local exists"
else
    echo "  ⚠️  .env.local not found"
    echo "  📝 Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "  ✅ .env.local created"
    fi
fi

# Check 4: better-sqlite3
echo ""
echo "✓ Check 4: Dependencies"
if npm list better-sqlite3 &>/dev/null; then
    version=$(npm list better-sqlite3 --depth=0 2>/dev/null | grep better-sqlite3)
    echo "  ✅ better-sqlite3 installed"
else
    echo "  ⚠️  better-sqlite3 not installed"
    echo "  📦 Installing better-sqlite3..."
    npm install better-sqlite3
    if [ $? -eq 0 ]; then
        echo "  ✅ better-sqlite3 installed successfully"
    else
        echo "  ❌ Failed to install better-sqlite3"
        echo "  💡 Try: npm install better-sqlite3 --verbose"
        exit 1
    fi
fi

# Check 5: Database initialization
echo ""
echo "✓ Check 5: Database Initialization"
if [ -d "data" ] && [ -f "data/app.db" ]; then
    echo "  ✅ Database file exists: data/app.db"
else
    echo "  📝 Initializing database..."
    npm run db:init
    if [ $? -eq 0 ]; then
        echo "  ✅ Database initialized"
    else
        echo "  ❌ Database initialization failed"
        exit 1
    fi
fi

echo ""
echo "================================="
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Review SQLITE_MIGRATION.md for detailed docs"
echo "2. Run 'npm run dev' to start development server"
echo "3. Visit http://localhost:5173"
echo ""
echo "Need help? Check:"
echo "  - MIGRATION_SUMMARY.md"
echo "  - SQLITE_MIGRATION.md"
echo ""
