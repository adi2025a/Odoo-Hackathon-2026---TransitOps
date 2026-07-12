# 1. Use the official uv image for build stage speed, or copy uv binary
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uv

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy configuration files first (maximizes Docker layer caching)
COPY pyproject.toml uv.lock ./

# 4. Install project dependencies using uv
RUN /uv sync --frozen --no-install-project

# 5. Copy the rest of your application code into the container
COPY . .

# 6. Expose the port FastAPI runs on
EXPOSE 8000

# 7. Run the application using uvicorn (letting uv manage the environment path)
CMD ["/uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]