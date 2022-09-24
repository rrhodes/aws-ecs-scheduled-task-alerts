FROM node:lts-slim

ENV HOME app

COPY $HOME $HOME

WORKDIR $HOME

CMD ["node", "index.js"]
