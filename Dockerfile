# Use the official Puppeteer image which includes Chromium and all required dependencies
FROM ghcr.io/puppeteer/puppeteer:latest

# Use the default Puppeteer configuration for the official image

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
