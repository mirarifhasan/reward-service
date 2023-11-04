FROM node as base
WORKDIR /app
COPY package.json .
RUN npm install

COPY . .
RUN npm run build

FROM node
COPY --from=base /app/node_modules/ ./node_modules/
COPY --from=base /app/package*.json ./
COPY --from=base /app/dist/ ./dist/

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
