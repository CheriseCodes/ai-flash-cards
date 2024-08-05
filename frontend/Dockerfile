# Use the official Node.js runtime as the base image
ARG NODE_VERSION=22

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-slim AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

ENV NODE_ENV=production

# Copy the entire application code to the container
COPY . .

# Build the React app for production
RUN npm run build

FROM build AS test

ENV NODE_ENV=test

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev
USER node
COPY . .
RUN npm run test

# Use Nginx AS the production server
FROM nginx:alpine AS final

# Set environment variables
ENV NODE_ENV=production

# Copy the built React app to Nginx's web server directory
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]