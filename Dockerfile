FROM node:20-alpine

WORKDIR /app

ENTRYPOINT ["scripts/web-docker-entrypoint.sh"]
