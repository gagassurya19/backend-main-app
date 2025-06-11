# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source code
COPY src ./src/

# Copy .env file if it exists (optional for production)
COPY .env* ./

# Create uploads directory
RUN mkdir -p uploads

# Change ownership of app directory to existing node user
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose the port the app runs on
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
  const options = { hostname: 'localhost', port: 8080, path: '/', timeout: 2000 }; \
  const req = http.request(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
  req.on('error', () => process.exit(1)); req.end();"

# Start the application
CMD ["npm", "start"] 