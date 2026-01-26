FROM mcr.microsoft.com/playwright:v1.41.2-jammy


WORKDIR /app


# installa il package dal repo (build locale)
COPY . .
RUN npm install
RUN npm install -g .


# porta usata dal server MCP
EXPOSE 8080


# CLI CORRETTA
CMD ["mcp-server-playwright"]
