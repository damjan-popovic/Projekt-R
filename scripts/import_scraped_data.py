import json
import psycopg2
from config import DB_CONFIG

def connect_db():
    return psycopg2.connect(**DB_CONFIG)

def insert_data():
    with open("listingsDetails.json", "r", encoding="utf-8") as file:
        listings = json.load(file)

    conn = connect_db()
    cur = conn.cursor()

    for listing in listings:
        try:
            accommodation_id = listing["id"]
            host_id = listing["id"]
            location_id = listing["id"]

            cur.execute("""
                INSERT INTO host (hostid, hostname, hostsurname, hostrating)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (hostid) DO NOTHING;
            """, (host_id, listing["host_name"], '', listing["host_rating"]))

            cur.execute("""
                INSERT INTO accommodation (accommodationid, name, numofrooms, capacity, numofbeds, numofbathrooms, accrating, hostid)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (accommodationid) DO NOTHING;
            """, (accommodation_id, listing["name"], listing["broj_spavacih_soba"], listing["broj_gostiju"], listing["broj_kreveta"], listing["broj_kupaonica"], listing["rating"], host_id))

            cur.execute("""
                INSERT INTO location (locationid, geolength, geowidth, accommodationid)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (locationid) DO NOTHING;
            """, (location_id, listing["latitude"], listing["longitude"], accommodation_id))

        except Exception as e:
            print(f"Error inserting data for {listing['name']}: {e}")

    conn.commit()
    cur.close()
    conn.close()
    print("Data successfully inserted into PostgreSQL!")

if __name__ == "__main__":
    insert_data()
