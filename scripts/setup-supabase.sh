#!/bin/bash

# CommunityCoin Supabase Setup Script
# This script helps you set up your Supabase project

set -e

echo "🚀 CommunityCoin Supabase Setup"
echo "================================"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it with:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check for existing Supabase project link
if [ -f "supabase/.temp/project-ref" ]; then
    PROJECT_REF=$(cat supabase/.temp/project-ref)
    echo "📎 Already linked to project: $PROJECT_REF"
else
    echo "📝 Not linked to a Supabase project yet."
    echo ""
    echo "You have two options:"
    echo ""
    echo "OPTION 1: Create a new project at https://supabase.com/dashboard"
    echo "          Then run: supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "OPTION 2: Use Supabase local development"
    echo "          Run: supabase init && supabase start"
    echo ""
    read -p "Would you like to start local development? (y/n): " start_local
    
    if [ "$start_local" = "y" ] || [ "$start_local" = "Y" ]; then
        echo ""
        echo "🐳 Starting local Supabase (requires Docker)..."
        supabase init 2>/dev/null || true
        supabase start
        
        echo ""
        echo "✅ Local Supabase started!"
        echo ""
        echo "Your local credentials:"
        supabase status
    fi
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Run the migration to create tables:"
echo "   supabase db push"
echo "   OR manually run the SQL in supabase/migrations/001_initial_schema.sql"
echo ""
echo "2. Get your project credentials from:"
echo "   - Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api"
echo "   - Local: supabase status"
echo ""
echo "3. Add to your .env file:"
echo "   NEXT_PUBLIC_SUPABASE_URL=your_url"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key"
echo "   SUPABASE_SERVICE_KEY=your_service_key"
echo ""
echo "Done! 🎉"
