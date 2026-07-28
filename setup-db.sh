#!/bin/bash
# ============================================
# Database Setup Script
# Run this ONCE to create the PostgreSQL user and database
# Requires sudo access
# ============================================

set -e

echo "🔧 Setting up PostgreSQL database..."
echo ""

# Step 1: Install PostgreSQL if not present
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    sudo apt-get update -qq
    sudo apt-get install -y postgresql postgresql-client
    echo "✅ PostgreSQL installed"
else
    echo "✅ PostgreSQL is already installed"
fi

# Step 2: Start PostgreSQL service
echo "🚀 Starting PostgreSQL service..."
sudo systemctl start postgresql 2>/dev/null || sudo service postgresql start 2>/dev/null || sudo pg_ctlcluster $(pg_lsclusters -h | head -1 | awk '{print $1, $2}') start
echo "✅ PostgreSQL service started"

# Step 3: Create database user and database
echo "📊 Creating database user and database..."
sudo -u postgres psql <<-EOSQL
    -- Create user if not exists
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'secureapp') THEN
            CREATE USER secureapp WITH PASSWORD 'secureapp123';
        END IF;
    END
    \$\$;

    -- Create database if not exists
    SELECT 'CREATE DATABASE secure_app_db OWNER secureapp'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'secure_app_db')\gexec

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE secure_app_db TO secureapp;
EOSQL

echo "✅ Database 'secure_app_db' created with user 'secureapp'"

# Step 4: Run Prisma migration
echo "🔄 Running Prisma migration..."
cd "$(dirname "$0")/server"
npx prisma migrate dev --name init --skip-generate
npx prisma generate

echo ""
echo "🎉 Database setup complete!"
echo "   Database: secure_app_db"
echo "   User: secureapp"
echo "   URL: postgresql://secureapp:secureapp123@localhost:5432/secure_app_db"
echo ""
echo "Run './start.sh' to start the application."
