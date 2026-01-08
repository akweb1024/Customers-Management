#!/bin/bash

# NextAuth Secret Generator Script
# This script generates secure random secrets for NextAuth.js

echo "🔐 NextAuth Secret Generator"
echo "=============================="
echo ""

echo "Generating AUTH_SECRET..."
AUTH_SECRET=$(openssl rand -base64 32)
echo "AUTH_SECRET=\"$AUTH_SECRET\""
echo ""

echo "Generating NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\""
echo ""

echo "✅ Secrets generated successfully!"
echo ""
echo "📋 Copy these to your .env file:"
echo "================================="
echo "AUTH_SECRET=\"$AUTH_SECRET\""
echo "NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\""
echo "NEXTAUTH_URL=\"http://localhost:3000\"  # Change for production"
echo ""
echo "⚠️  Remember to restart your dev server after updating .env!"
