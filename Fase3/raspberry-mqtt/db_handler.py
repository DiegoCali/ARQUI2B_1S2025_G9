import pymysql

class DBHandler:
    def __init__(self, db_config):
        self.db_config = db_config
        self.connection = None

    def connect(self):
        if self.connection is None:
            self.connection = pymysql.connect(
                host=self.db_config["host"],
                user=self.db_config["user"],
                password=self.db_config["password"],
                database=self.db_config["database"],
                port=self.db_config["port"]
            )

    def close(self):
        if self.connection:
            self.connection.close()
            self.connection = None

    def insert_data(self, data):
        self.connect()
        try:
            with self.connection.cursor() as cursor:
                query = """
                    INSERT INTO sensor_data (distance, co2, temperature, humidity, light, current, date_time)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(query, (
                    data["distance"],
                    data["co2"],
                    data["temperature"],
                    data["humidity"],
                    data["light"],
                    data["current"],
                    data["date-time"]
                ))
            self.connection.commit()
        except Exception as e:
            print(f"Error inserting data: {e}")        
