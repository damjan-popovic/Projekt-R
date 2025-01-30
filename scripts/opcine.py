import requests
import re
import json

with open("listingsDetails.json", "r", encoding="utf-8") as file:
    info = json.load(file)

def get_municipality_or_town(lat, lon):
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
        "addressdetails": 1
    }
    headers = {
        "User-Agent": "Script/1.0 (juricacizic@gmail.com)"
    }

    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        data = response.json()

        address = data.get("address", {})
        municipality = address.get("municipality")
        town = address.get("town")

        if municipality:
            return municipality.replace("Općina ", "").replace("Grad ", "").strip()
        elif town:
            return town.replace("Grad ", "").strip()
        else:
            display_name = data.get("display_name", "")
            
            match = re.search(r'Općina\s+([^,]+)', display_name)
            if match:
                return match.group(1).strip()
            match = re.search(r'Grad\s+([^,]+)', display_name)
            if match:
                return match.group(1).strip()
            return 0
    except requests.RequestException as e:
        return f"Error: {e}"

    
def get_detailed_info(lat, lon):
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
        "addressdetails": 1
    }
    headers = {
        "User-Agent": "Script/1.0 (juricacizic@gmail.com)"
    }

    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        data = response.json()

        return data
    except requests.RequestException as e:
        return f"Error: {e}"

for listing in info:
    if "praviGrad" in listing:
        continue
    trenutniGrad = listing["grad"].strip()
    opcina = get_municipality_or_town(listing["latitude"], listing["longitude"])
    listing["praviGrad"] = trenutniGrad
    if opcina != 0:
        listing["grad"] = opcina
    else:
        listing["grad"] = "Nije pronađeno ime općine"
    print(listing, "\n\n")

with open("listingsDetails.json", "w", encoding="utf-8") as f:
    json.dump(info, f, ensure_ascii=False, indent=4)

print("Data saved to listingsDetails.json")
