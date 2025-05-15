FROM node:20-alpine

WORKDIR /app

# Install necessary dependencies
RUN apk add --no-cache python3 g++ make nginx

# Copy package.json files first (for better caching)
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy application code
COPY . .

# Build the frontend
RUN cd frontend && npm run build

# Set up nginx for the frontend
RUN mkdir -p /var/www/html
RUN cp -r frontend/dist/* /var/www/html/
COPY nginx.conf /etc/nginx/http.d/default.conf

# Prepare startup script
RUN echo '#!/bin/sh\ncd /app/backend && node server.js & nginx -g "daemon off;"' > /start.sh
RUN chmod +x /start.sh

# Expose ports
EXPOSE 80
EXPOSE 5001

# Command to run
CMD ["/start.sh"] 