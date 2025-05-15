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

# Create nginx config directories (Alpine Linux specific)
RUN mkdir -p /etc/nginx/conf.d
RUN mkdir -p /etc/nginx/http.d

# Copy nginx config to both possible locations
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/http.d/default.conf

# Create a startup script directly in the build
RUN printf '#!/bin/sh\necho "Starting application..."\necho "Checking frontend files:"\nls -la /var/www/html\necho "Checking nginx config:"\nls -la /etc/nginx/conf.d\nls -la /etc/nginx/http.d\necho "Starting backend server..."\ncd /app/backend && node server.js & \necho "Starting nginx..."\nnginx -g "daemon off;"\n' > /app/start.sh
RUN chmod +x /app/start.sh

# Expose ports
EXPOSE 80
EXPOSE 5001

# Command to run
CMD ["/app/start.sh"] 