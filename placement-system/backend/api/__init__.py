try:
	import MySQLdb  # prefer mysqlclient when available
except Exception:
	try:
		import importlib
		pymysql = importlib.import_module("pymysql")
		pymysql.install_as_MySQLdb()
	except Exception:
		# neither mysqlclient nor pymysql is available; let imports fail later
		pass