# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/react-app
COPY react-app/package*.json ./
RUN npm install
COPY react-app/ ./
RUN npm run build

# Stage 2: Run the Express backend
FROM node:20-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./
# Copy the built React app from stage 1
COPY --from=frontend-build /app/react-app/dist ../react-app/dist

EXPOSE 4000
CMD ["sh", "-c", "node seedAll.js && node server.js"]
