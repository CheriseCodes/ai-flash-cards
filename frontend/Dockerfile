# Use the official Node.js runtime as the base image
ARG NODE_VERSION=20.8.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as build

# Set the working directory in the container
WORKDIR /app

# Set stage the image is built for
ARG APP_ENV="kubernetes.production"

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code to the container
COPY . .

# Set backend url
RUN printf "VITE_APP_ENV="${APP_ENV}"" > .env

# Build the React app for production
RUN npm run build

# Use Nginx as the production server
FROM nginx:alpine

# Set environment variables
ENV NODE_ENV=production

# Copy the built React app to Nginx's web server directory
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]