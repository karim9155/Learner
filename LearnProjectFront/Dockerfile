# Stage 1: Build the Angular application
FROM node:18-alpine as build
WORKDIR /app

# Copy package configuration and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application for production
RUN npm run build -- --configuration production

# Stage 2: Serve the application from Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Remove the default Nginx content
RUN rm -rf ./*

# Correctly copy the application files from the 'browser' subdirectory
COPY --from=build /app/dist/learn-project-front/browser/ .

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
