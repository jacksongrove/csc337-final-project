# Use Node.js LTS as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the project files
COPY . /app

# Install dependencies
RUN npm install

# Use environment variable for the exposed port
ARG PORT
ENV PORT=${PORT}

# Dynamically expose the port specified in the environment (default 3000)
EXPOSE ${PORT}

# Command to start the app
CMD ["node", "server/server.js"]
