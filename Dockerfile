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
RUN cd frontend && npm install react-router-dom

# Copy application code
COPY . .

# Create a healthcheck endpoint file
RUN echo "// Health check endpoint" > /app/health-check.js
RUN echo "app.get('/health', (req, res) => {" >> /app/health-check.js
RUN echo "  res.status(200).send('OK');" >> /app/health-check.js
RUN echo "});" >> /app/health-check.js

# Append the health check to server.js
RUN cat /app/health-check.js >> /app/backend/server.js

# Build the frontend
RUN cd frontend && npm run build

# Set up nginx for the frontend
RUN mkdir -p /var/www/html
RUN cp -r frontend/dist/* /var/www/html/

# Use our nginx.conf as the main nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create a proper supervisor configuration
RUN mkdir -p /etc/supervisor/conf.d/
COPY <<-EOF /etc/supervisor/supervisord.conf
[unix_http_server]
file=/var/run/supervisor.sock
chmod=0700

[supervisord]
nodaemon=true
logfile=/dev/null
logfile_maxbytes=0
pidfile=/var/run/supervisord.pid

[rpcinterface:supervisor]
supervisor.rpcinterface_factory=supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///var/run/supervisor.sock

[include]
files=/etc/supervisor/conf.d/*.conf
EOF

# Create program configs
COPY <<-EOF /etc/supervisor/conf.d/nginx.conf
[program:nginx]
command=nginx -g 'daemon off;'
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
EOF

COPY <<-EOF /etc/supervisor/conf.d/node.conf
[program:node]
command=node /app/backend/server.js
directory=/app/backend
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
EOF

# Expose ports
EXPOSE 80
EXPOSE 5001

# Command to run
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"] 