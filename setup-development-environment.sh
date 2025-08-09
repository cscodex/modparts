#!/bin/bash

# 🚀 Sardaarji Auto Parts - Development Environment Setup Script
# Created: August 8, 2025
# Purpose: Automated setup for safe development workflow

set -e  # Exit on any error

echo "🚀 Setting up Sardaarji Auto Parts Development Environment..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_status "All prerequisites are installed ✓"
}

# Create development directory structure
setup_directory_structure() {
    print_step "Setting up directory structure..."
    
    # Create development directories
    mkdir -p docs/{api,deployment,testing}
    mkdir -p tests/{unit,integration,e2e}
    mkdir -p scripts
    mkdir -p backups
    
    print_status "Directory structure created ✓"
}

# Setup environment files
setup_environment_files() {
    print_step "Creating environment configuration files..."
    
    # Development environment file
    cat > .env.development << EOF
# Development Environment Configuration
# Created: $(date)

# API Configuration
VITE_API_URL=http://localhost:3000/api
NODE_ENV=development

# Database Configuration (Development)
DATABASE_URL=postgresql://localhost:5432/modparts_development
SUPABASE_URL=your_supabase_development_url
SUPABASE_ANON_KEY=your_supabase_development_anon_key

# Payment Configuration (TEST KEYS ONLY)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_test_webhook_secret

VITE_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret

# Email Configuration (Development)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
SMTP_FROM=dev@sardaarjiautoparts.com

# Security
JWT_SECRET=your_development_jwt_secret_here
ENCRYPTION_KEY=your_development_encryption_key_here

# Analytics (Development)
GOOGLE_ANALYTICS_ID=GA-DEV-123456
SENTRY_DSN=your_development_sentry_dsn
EOF

    # Production environment template
    cat > .env.production.template << EOF
# Production Environment Configuration Template
# DO NOT COMMIT THIS FILE WITH REAL VALUES

# API Configuration
VITE_API_URL=https://your-domain.com/api
NODE_ENV=production

# Database Configuration (Production)
DATABASE_URL=postgresql://production_db_url
SUPABASE_URL=your_supabase_production_url
SUPABASE_ANON_KEY=your_supabase_production_anon_key

# Payment Configuration (LIVE KEYS)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_live_key_here
STRIPE_SECRET_KEY=sk_live_your_stripe_live_secret_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_live_webhook_secret

VITE_PAYPAL_CLIENT_ID=your_paypal_live_client_id
PAYPAL_CLIENT_SECRET=your_paypal_live_secret

# Email Configuration (Production)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@sardaarjiautoparts.com

# Security
JWT_SECRET=your_production_jwt_secret_here
ENCRYPTION_KEY=your_production_encryption_key_here

# Analytics (Production)
GOOGLE_ANALYTICS_ID=GA-PROD-123456
SENTRY_DSN=your_production_sentry_dsn
EOF

    print_status "Environment files created ✓"
    print_warning "Please update .env.development with your actual development credentials"
}

# Update .gitignore for security
update_gitignore() {
    print_step "Updating .gitignore for security..."
    
    cat >> .gitignore << EOF

# Development Environment Security
.env
.env.local
.env.development
.env.production
.env.*.local

# Development Files
/backups/*.sql
/logs/*.log
/temp/*
.DS_Store
Thumbs.db

# IDE Files
.vscode/
.idea/
*.swp
*.swo

# Test Coverage
coverage/
.nyc_output/

# Development Database
*.sqlite
*.db
EOF

    print_status ".gitignore updated for security ✓"
}

# Create development scripts
create_development_scripts() {
    print_step "Creating development scripts..."
    
    # Development setup script
    cat > scripts/setup-dev.sh << 'EOF'
#!/bin/bash
echo "🔧 Setting up development environment..."

# Install dependencies
echo "Installing backend dependencies..."
npm install

echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Setup development database
echo "Setting up development database..."
# Add your database setup commands here

echo "✅ Development environment ready!"
EOF

    # Test runner script
    cat > scripts/run-tests.sh << 'EOF'
#!/bin/bash
echo "🧪 Running test suite..."

# Backend tests
echo "Running backend tests..."
npm test

# Frontend tests
echo "Running frontend tests..."
cd frontend && npm test && cd ..

# Integration tests
echo "Running integration tests..."
# Add integration test commands here

echo "✅ All tests completed!"
EOF

    # Make scripts executable
    chmod +x scripts/*.sh
    
    print_status "Development scripts created ✓"
}

# Setup Git branches for development
setup_git_branches() {
    print_step "Setting up Git branches for development workflow..."
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_warning "Not in a Git repository. Initializing..."
        git init
        git add .
        git commit -m "Initial development setup"
    fi
    
    # Create feature branches for each enhancement phase
    git checkout -b feature/payment-integration 2>/dev/null || git checkout feature/payment-integration
    git checkout -b feature/security-hardening 2>/dev/null || git checkout feature/security-hardening
    git checkout -b feature/product-reviews 2>/dev/null || git checkout feature/product-reviews
    git checkout -b feature/performance-optimization 2>/dev/null || git checkout feature/performance-optimization
    git checkout -b feature/seo-enhancements 2>/dev/null || git checkout feature/seo-enhancements
    
    # Return to main branch
    git checkout main 2>/dev/null || git checkout master 2>/dev/null || git checkout -b main
    
    print_status "Git branches created ✓"
}

# Create documentation files
create_documentation() {
    print_step "Creating development documentation..."
    
    # Development README
    cat > README-DEVELOPMENT.md << EOF
# Sardaarji Auto Parts - Development Guide

## Quick Start

1. Run setup script: \`./setup-development-environment.sh\`
2. Update \`.env.development\` with your credentials
3. Install dependencies: \`./scripts/setup-dev.sh\`
4. Start development: \`npm run dev\`

## Development Workflow

1. Create feature branch: \`git checkout -b feature/your-feature\`
2. Make changes and test thoroughly
3. Commit with descriptive messages
4. Push to your fork for review

## Testing

Run all tests: \`./scripts/run-tests.sh\`

## Environment Variables

- Development: \`.env.development\`
- Production: \`.env.production\` (create from template)

## Security Notes

- Never commit real API keys
- Use test credentials for development
- Regular security scans recommended

## Support

See enhancement documents for detailed implementation guides.
EOF

    print_status "Documentation created ✓"
}

# Main execution
main() {
    print_status "Starting development environment setup..."
    
    check_prerequisites
    setup_directory_structure
    setup_environment_files
    update_gitignore
    create_development_scripts
    setup_git_branches
    create_documentation
    
    echo ""
    echo "🎉 Development environment setup complete!"
    echo "=================================================="
    echo ""
    print_status "Next steps:"
    echo "1. Update .env.development with your actual credentials"
    echo "2. Run: ./scripts/setup-dev.sh"
    echo "3. Start development: npm run dev"
    echo "4. Begin with critical security fixes (see IMMEDIATE_ACTION_ITEMS_2025-08-08.md)"
    echo ""
    print_warning "Remember: Always work on feature branches, never directly on main!"
    echo ""
}

# Run main function
main "$@"
EOF
