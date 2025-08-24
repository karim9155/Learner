# Stage 1: Build the Angular application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2: Serve the application from a lightweight Nginx server
FROM nginx:alpine
# Copy the built app from the 'build' stage
COPY --from=build /app/dist/learn-project-front /usr/share/nginx/html
# Nginx will use its default configuration to serve files from the above directory.
# No need to copy a custom nginx.conf!
EXPOSE 80
