from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Insurance Agent"
    environment: str = "development"
    admin_username: str = "admin"
    admin_password: str = "password"
    dev_access_token: str = ""
    openai_api_key: str = ""
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
