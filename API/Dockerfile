# Use a lightweight Node.js LTS image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker's caching mechanism
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of your application code (including your source and .env)
COPY . .

# Expose the port your Express app listens on (usually 3000 or 8080)
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
