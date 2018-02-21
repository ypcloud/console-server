# take default image of node boron i.e  node 6.x
FROM node:boron
EXPOSE 3000

# create app directory in container
RUN mkdir -p /opt/app

# set /app directory as default working directory
WORKDIR /opt/app

# copy all file from current dir to workdir in container
COPY . /opt/app

# Set environment variable
ENV NODE_ENV dev

CMD ["npm", "run", "start:prod"]
