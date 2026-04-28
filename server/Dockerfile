FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies (only production dependencies can be installed using `npm ci --only=production` if tests aren't needed, but `npm install` is fine for now)
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
