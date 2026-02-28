from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://descobre:descobre@db:5432/descobre_saude"
    app_name: str = "Descobre Saude API"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
