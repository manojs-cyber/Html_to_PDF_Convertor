# Use the official Puppeteer image which includes Chromium and all required dependencies
FROM ghcr.io/puppeteer/puppeteer:latest

# We don't need to install Chromium because it's already in the image, 
# so we can skip the standard Puppeteer Chromium download during npm install.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set the working directory inside the container
WORKDIR /usr/src/app

# The original image runs as user 'pptruser'. We copy the config files and assign proper ownership.
COPY --chown=pptruser:pptruser package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy all the remaining source files into the container
COPY --chown=pptruser:pptruser . .

# Let Docker know our server listens on port 3000
EXPOSE 3000

# Specify the default command to start the API
CMD ["npm", "start"]
