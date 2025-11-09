FROM node:18-alpine

# Рабочая директория внутри контейнера
WORKDIR /app

# Скопировать package.json и package-lock.json
COPY package*.json ./

# Установить зависимости
RUN npm install --production

# Скопировать исходники
COPY . .

# Запустить бота
CMD ["npm", "start"]
