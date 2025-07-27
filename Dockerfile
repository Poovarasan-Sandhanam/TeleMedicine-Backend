# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the project
COPY . .

# Build TypeScript (optional for runtime)
RUN npm run build

# Start the app using ts-node in dev, or node in production
CMD ["npm", "start"]

# Expose port
EXPOSE 3000
