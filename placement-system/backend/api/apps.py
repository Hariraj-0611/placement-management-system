from django.apps import AppConfig

# Use mysqlclient when available; fall back to PyMySQL only if needed
try:
    import MySQLdb
except Exception:
    try:
        import pymysql
        pymysql.install_as_MySQLdb()
    except Exception:
        pass

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'