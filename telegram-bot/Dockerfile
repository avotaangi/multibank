FROM python:3.11-slim

# Рабочая директория внутри контейнера
WORKDIR /app

# Скопировать requirements.txt
COPY requirements.txt .

# Установить зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Скопировать исходники
COPY . .

# Запустить бота
CMD ["python", "src/main.py"]
