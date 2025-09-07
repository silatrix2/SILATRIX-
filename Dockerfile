FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
