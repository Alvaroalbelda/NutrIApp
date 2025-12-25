import psycopg2

url = "postgresql://postgres:ttOdU9n0uomoLtiu@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"
print("Intentando conectar a:", url)

conn = psycopg2.connect(url, connect_timeout=5)
print("✅ CONEXIÓN OK")
conn.close()
