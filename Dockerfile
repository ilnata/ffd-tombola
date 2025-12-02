# Fase 1: Costruzione dell'immagine
FROM node:12-alpine

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia il file package.json e package-lock.json (se disponibile)
COPY . .

# Installa Python 2
RUN apk update && apk add python2 make g++

# Verifica la versione di Python 2
RUN python2 --version

# Installa le dipendenze del progetto
RUN npm install

RUN ./node_modules/webpack-cli/bin/cli.js --config webpack.scss.config.js
# Copia i file sorgente del progetto nella directory di lavoro (esclusi quelli definiti in .dockerignore)

# Espone la porta 3000
EXPOSE 3000
EXPOSE 1223

# Comando per eseguire l'applicazione
CMD ["node", "bin/www"]
