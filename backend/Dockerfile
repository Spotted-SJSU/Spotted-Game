FROM python:3.10-slim

# Install necessary dependencies 
RUN apt-get update && apt-get install -y \
    curl \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install OpenCV
RUN pip install --no-cache-dir opencv-python numpy

# Install Node.js 
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install npm dependencies 
RUN npm install

# Copy application code
COPY . .


EXPOSE 5000

CMD ["node", "server.js"]