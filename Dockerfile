FROM node:16-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the React app for production
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]

# # Stage 2: Serve the React application using a lightweight server
# FROM nginx:alpine

# # Copy the built files from Stage 1
# COPY --from=build /app/build /usr/share/nginx/html

# # Expose port 80
# EXPOSE 80

# # Start the Nginx server
# CMD ["nginx", "-g", "daemon off;"]
