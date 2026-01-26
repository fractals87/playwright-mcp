FROM mcr.microsoft.com/playwright:v1.41.2-jammy


WORKDIR /app


COPY . .


# installa deps e registra il bin
RUN npm install
RUN npm install -g .


EXPOSE 8080


CMD ["mcp-server-playwright"]
