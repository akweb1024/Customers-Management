#!/bin/sh

# Generate the database if it doesn't exist or update schema
npx prisma db push --accept-data-loss

# Run seeding if database is fresh (Optional, but useful for first deploy)
# npm run seed

# Start the application
node server.js
