# Dockerfile

# 1) Use Node.js 18 as the base image (Debian-based for compatibility)
FROM --platform=linux/amd64 node:18-bullseye

# 2) Install Python 3.9 & Poetry
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    python3.9 python3.9-dev python3.9-venv curl g++ libgl1 \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://install.python-poetry.org | python3.9 -
ENV PATH="/root/.local/bin:${PATH}"

# 3) Set working directory
WORKDIR /app

# 4) Copy package files to install root dependencies
COPY package.json package-lock.json /app/

# Install root dependencies
RUN npm install

# 5) Copy backend and frontend directories
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

# 6) Install dependencies for backend and frontend
RUN npm run install-all

# 7) Copy Python code (Magneto directory)
COPY Magneto/oracleFromBehavior /app/magneto/

# 8) Install Python dependencies with Poetry
WORKDIR /app/magneto
ENV POETRY_HTTP_TIMEOUT=300
RUN poetry install --no-root

# 9) Build the frontend
WORKDIR /app/frontend
RUN npm run build

# 10) Move back to /app/backend and set up the server
WORKDIR /app/backend

# 11) Expose the backend port
EXPOSE 5000

# 12) Start both frontend and backend together
CMD ["npm", "start"]
