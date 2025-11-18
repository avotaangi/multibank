# Build stage
FROM node:18-alpine as build

WORKDIR /app

      # Build arguments for Vite environment variables
      ARG VITE_API_BASE
      ARG VITE_CLIENT_ID_ID
      ARG VITE_TELEGRAM_BOT_USERNAME
      ARG VITE_TELEGRAM_WEBAPP_URL

      # Set environment variables for build
      ENV VITE_API_URL=${VITE_API_BASE}
      ENV VITE_API_BASE=${VITE_API_BASE}
      ENV VITE_CLIENT_ID_ID=${VITE_CLIENT_ID_ID}
      ENV VITE_TELEGRAM_BOT_USERNAME=${VITE_TELEGRAM_BOT_USERNAME}
      ENV VITE_TELEGRAM_WEBAPP_URL=${VITE_TELEGRAM_WEBAPP_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
