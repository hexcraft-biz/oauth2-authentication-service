FROM node:16-alpine3.15

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci --silent
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . /usr/src/app

ENTRYPOINT npm run serve

EXPOSE 6060
