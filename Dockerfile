# Use Node.js LTS as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the project files
COPY . /app

# Install dependencies
RUN npm install

# Expose the app port (change 3000 if your app uses a different port)
EXPOSE 3000

# Command to start the app
CMD ["node", "server/server.js"]
