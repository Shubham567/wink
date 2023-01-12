FROM node:19.4.0-bullseye

RUN apt-get update && \
    apt-get install -y build-essential \
    wget \
    python3 \
    make \
    gcc \
    libc6-dev


RUN npm i -g zx

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn

RUN npm rebuild @tensorflow/tfjs-node --build-addon-from-source


COPY . .

ENV START_ID=700000
ENV END_ID=1000000

#ENTRYPOINT sh
ENTRYPOINT ["zx", "server_download.mjs"]


