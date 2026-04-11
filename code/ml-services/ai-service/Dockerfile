FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
RUN mkdir -p src/database && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8012

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8012/health')" || exit 1

CMD ["python", "-m", "gunicorn", "--bind", "0.0.0.0:8012", "--workers", "4", "--timeout", "120", "src.main:app"]
