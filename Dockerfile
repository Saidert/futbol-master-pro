FROM python:3.11-slim

WORKDIR /app

# Copiar archivos del proyecto
COPY . /app

# Inicializar base de datos SQLite con tablas y torneos de Colombia
RUN python -c "import db_manager; db_manager.init_db()"

ENV PORT=8080
EXPOSE 8080

CMD ["python", "server.py"]
