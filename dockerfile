# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the entire application directory to the working directory
COPY . .

EXPOSE 3000

# Start the NestJS application
CMD ["npm", "run", "start:prod"]