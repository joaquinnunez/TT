FROM node:10.15

# install and cache app dependencies
COPY ./package.json /app/package.json

WORKDIR /app
RUN yarn install
