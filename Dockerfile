FROM node:20-alpine

WORKDIR /app

# Install necessary dependencies
RUN apk add --no-cache python3 g++ make nginx supervisor

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

# Use our nginx.conf as the main nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create supervisor configuration
RUN mkdir -p /etc/supervisor.d/
RUN echo "[supervisord]\nnodaemon=true\n\n[program:nginx]\ncommand=nginx -g 'daemon off;'\nautostart=true\nautorestart=true\nstdout_logfile=/dev/stdout\nstdout_logfile_maxbytes=0\nstderr_logfile=/dev/stderr\nstderr_logfile_maxbytes=0\n\n[program:node]\ncommand=node /app/backend/server.js\nautostart=true\nautorestart=true\nstdout_logfile=/dev/stdout\nstdout_logfile_maxbytes=0\nstderr_logfile=/dev/stderr\nstderr_logfile_maxbytes=0" > /etc/supervisor.d/supervisord.ini

# Create a healthcheck endpoint in the backend
RUN echo "\n\n// Health check endpoint\napp.get('/health', (req, res) => {\n  res.status(200).send('OK');\n});\n" >> /app/backend/server.js

# Expose ports
EXPOSE 80
EXPOSE 5001

# Command to run
CMD ["supervisord", "-c", "/etc/supervisor.d/supervisord.ini"] 