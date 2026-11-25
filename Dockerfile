FROM node:22-alpine

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy all source (including tests/.htpasswd)
COPY . .

# 🔑 Ensure .htpasswd is at a standard path the auth code can find
# - tests/.htpasswd  -> /app/tests/.htpasswd (already by COPY . .)
# - copy it also to /app/.htpasswd
RUN cp tests/.htpasswd .htpasswd

# Environment variables for production
ENV NODE_ENV=production
# 🔑 Explicitly tell the app where the htpasswd file is
ENV HTPASSWD_FILE=/app/.htpasswd

EXPOSE 8080

CMD ["node", "src/index.js"]
