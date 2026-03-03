import MySQLdb

try:
    # Test connection
    connection = MySQLdb.connect(
        host='localhost',
        user='root',
        passwd='root',  # Change to your password
        db='placement_db',
        charset='utf8mb4'
    )
    print("✅ MySQL connection successful!")
    
    with connection.cursor() as cursor:
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"✅ MySQL version: {version[0]}")
    
    connection.close()
    print("✅ Test completed successfully!")
    
except Exception as e:
    print(f"❌ Connection failed: {e}")