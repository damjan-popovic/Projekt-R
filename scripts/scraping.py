import logging
import sys
import concurrent.futures
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from urllib.parse import urlparse, parse_qs
import re
import json
from selenium.webdriver.common.action_chains import ActionChains

logging.getLogger('selenium.webdriver').setLevel(logging.WARNING)

def extract_location_data(title):
    zupanija_match = re.search(r",\s([^,]+županija),\sHrvatska", title)
    grad_match = re.search(r"za najam -\s([^,]+)", title)

    zupanija = zupanija_match.group(1) if zupanija_match else "Nema županije"
    grad = grad_match.group(1) if grad_match else "Nema grada"

    return zupanija, grad

def scroll_until_element_found(driver, xpath, max_scrolls=10, scroll_pause=2):

    for scroll in range(max_scrolls):
        try:
            element = driver.find_element(By.XPATH, xpath)
            return element
        except NoSuchElementException:
            driver.execute_script("window.scrollBy(0, document.body.scrollHeight * 0.25);")
            time.sleep(scroll_pause)
    print("Nije pronađen element nakon scroll-a")
    return None

def getRoomID(url):
    match = re.search(r"rooms/(\d+)", url)
    if match:
        room_id = match.group(1)
    else:
        room_id = "Room ID not found."
    return room_id

def close_popups(driver, timeout=5):
    """
    Pokušava zatvoriti pop-up za 'Prijevodi su uključeni' (klik na X)
    i cookie banner (klik na 'U redu'), ako postoje.
    """
    # 1) Zatvaranje prijevodnog pop-upa (klik na X gumb)
    max_attempts = 3
    attempts = 0

    while attempts < max_attempts:
        try:
            translation_close_btn = WebDriverWait(driver, timeout).until(
                EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Zatvori']"))
            )
            translation_close_btn.click()
            break
        except Exception:
            attempts += 1
            print("Nije pronađen prijevodni pop-up.")
    
    attempts = 0

    while attempts < max_attempts:
        try:
            cookies_ok_btn = WebDriverWait(driver, timeout).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'U redu')]"))
            )
            cookies_ok_btn.click()
            break
        except Exception:
            attempts += 1
            print("Nije pronađen cookie pop-up")

def scrape_jedan_oglas(url, ponavljanja=1):
    """
    Pokušava scrapati jedan oglas, do 'ponavljanja' puta.
    Kreira driver unutar petlje, i odmah ga gasi prije sljedećeg pokušaja
    (ako dođe do greške).
    """
    listingsDetails = []
    pokusaj = 0

    while pokusaj < ponavljanja:
        driver = None
        refresh_attempts = 0
        max_refresh_attempts = 2
        try:
            # 1) Kreiraj driver za *svaki* pokušaj
            options = Options()
            options.add_argument("--headless")
            options.add_argument("--disable-gpu")
            options.add_argument("--no-sandbox")
            options.add_argument("start-maximized")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-images")
            options.add_argument("--lang=hr")

            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)

            # 2) Otvori stranicu
            while refresh_attempts < max_refresh_attempts:
                driver.get(url)
                close_popups(driver)
                try:
                    # Pričekaj da se pojavi element koji želimo parsat
                    WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.CLASS_NAME, "lgx66tx"))
                    )
                    break  # Ako je element pronađen, izađi iz refresh petlje

                except (TimeoutException, NoSuchElementException):
                    refresh_attempts += 1
                    print(f"Element nije pronađen. Pokušaj osvježavanja: {refresh_attempts}/{max_refresh_attempts}")
                    if refresh_attempts >= max_refresh_attempts:
                        raise Exception("Element nije pronađen nakon višestrukih osvježavanja stranice.")

            # Nastavi sa scrapingom nakon uspješnog pronalaska elementa
            html_content = driver.page_source
            soup = BeautifulSoup(html_content, "lxml")

            title_element = soup.find("title")
            title = title_element.text.strip() if title_element else "Nema naslova"

            zupanija, grad = extract_location_data(title)
            if zupanija == 'Nema županije':
                zupanija = 'Istarska županija'

            cijena_element = soup.find(class_="_11jcbg2")
            cijena = "".join(cijena_element.text.split()).strip() if cijena_element else "Nema cijene"

            # Izvlačenje Google Maps linka
            # Scroll dolje da se učita kod Google Maps-a

            retries = 3
            for attempt in range(retries):
                try:
                    mapsElement = scroll_until_element_found(
                        driver, "//a[contains(@title, 'Otvori ovo područje na Google kartama') or contains(@title, 'Open this area in Google Maps')]", max_scrolls=10, scroll_pause=2
                    )
                    if mapsElement:
                        locationURL = mapsElement.get_attribute("href")
                        break
                    else:
                        raise Exception("Element nije pronađen nakon scrollanja.")
                except Exception:
                    if attempt < retries - 1:
                        print(f"Pokušaj {attempt + 1} nije uspio; ponovni pokušaj...")
                        time.sleep(2)
                    else:
                        print("Google Maps element nije pronađen nakon više pokušaja.")
                        locationURL = "Nema Google Maps lokacije"

            # Izvlačenje lat long iz URL-a

            try:
                parsed_url = urlparse(locationURL)
                query_params = parse_qs(parsed_url.query)
                if 'll' in query_params:
                    latitude, longitude = query_params['ll'][0].split(',')
                else:
                    print("URL u neodgovarajućem obliku")
                    latitude = "nedostupno"
                    longitude = "nedostupno"
            except Exception as e:
                print(f"Greška pri parsiranju koordinata: {e}")
                latitude = "nedostupno"
                longitude = "nedostupno"

            # -------------------------------
            # PARSIRANJE DETALJA SMJEŠTAJA
            # -------------------------------

            # Dohvati ime oglasa
            name_element = soup.find(class_="_1czgyoo")
            name = name_element.text.strip() if name_element else "Nema naziva"
            
            parent_div = soup.find("div", class_="a8jhwcl atm_c8_vvn7el atm_g3_k2d186 atm_fr_1vi102y atm_9s_1txwivl atm_ar_1bp4okc atm_h_1h6ojuz atm_cx_t94yts atm_le_14y27yu atm_c8_sz6sci__14195v1 atm_g3_17zsb9a__14195v1 atm_fr_kzfbxz__14195v1 atm_cx_1l7b3ar__14195v1 atm_le_1l7b3ar__14195v1 dir dir-ltr")

            if parent_div:
                rating_div = parent_div.find("div", {"aria-hidden": "true"})
                if rating_div:
                    rating = rating_div.text.strip()
                else:
                    print("Nema rating_div elementa")
                    rating = "Nema"
            else:
                print("Nema rating parent elementa")
                rating = "Nema"  
           
            # Dohvati listu detalja
            main_list = soup.find("ol", class_="lgx66tx atm_gi_idpfg4 atm_l8_idpfg4 dir dir-ltr")
            extracted_data = {
                "broj_gostiju": 0,
                "broj_spavacih_soba": 0,
                "broj_kreveta": 0,
                "broj_kupaonica": 0,
                "rating":0,
                "host_id":0,
                "host_name":0,
                "host_rating":0
            }

            extracted_data['rating'] = rating

            if main_list:
                items = main_list.find_all("li")
                for item in items:
                    text = item.text.strip()
                    number = int(re.search(r'\d+', text).group()) if re.search(r'\d+', text) else 0

                    # Pridruživanje numeričke vrijednosti odgovarajućem ključu
                    if "gostiju" in text or "gosta" in text:
                        extracted_data["broj_gostiju"] = number
                    elif "spavaće sobe" in text or "spavaćih soba" in text:
                        extracted_data["broj_spavacih_soba"] = number
                    elif "kreveta" in text or "krevet" in text:
                        extracted_data["broj_kreveta"] = number
                    elif "kupaonica" in text or "kupaonice" in text:
                        extracted_data["broj_kupaonica"] = number
            
            
            link = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((
                    By.XPATH, 
                    "//a[@aria-label='Otvori cijeli profil domaćina']"
                ))
            ) 
            
            # Klikni na link
            refresh_attempts = 0
            max_refresh_attempts = 2

            while refresh_attempts < max_refresh_attempts:
                try:
                    # Klikni na link za cijeli profil domaćina
                    ActionChains(driver).move_to_element(link).click(link).perform()

                    # Pričekaj da se prikaže element s imenom domaćina
                    host_name_element = WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "span.t1gpcl1t.atm_w4_16rzvi6.atm_9s_1o8liyq.atm_gi_idpfg4.dir.dir-ltr"))
                    )

                    WebDriverWait(driver, 10).until(
                        lambda d: re.search(r'/users/show/\d+', d.current_url)
                    )

                    autorURL = driver.current_url
                    sastav = re.search(r'/users/show/(\d+)', autorURL)

                    if sastav:
                        autorID = sastav.group(1)
                    else:
                        autorID = 'Greška'

                    extracted_data['host_id'] = autorID

                    # Dohvati HTML sadržaj nakon učitavanja
                    html_content1 = driver.page_source
                    soup = BeautifulSoup(html_content1, "lxml")

                    # Dohvati tekst elementa za ime domaćina
                    host_name = host_name_element.text.strip()

                    # Pronađi <div> koji sadrži ocjenu
                    rating_element = soup.find("div", class_="ruujrrq atm_9s_1txwivl atm_ar_vrvcex atm_h_1h6ojuz atm_cx_yh40bf dir dir-ltr")
                    rating = rating_element.text.strip() if rating_element else "Nema ocjene"

                    # Ako su oba elementa pronađena, prekidamo petlju
                    extracted_data['host_name'] = host_name
                    extracted_data['host_rating'] = rating
                    break

                except (TimeoutException, NoSuchElementException) as e:
                    refresh_attempts += 1
                    print(f"Problem s elementima host_name ili rating. Osvježavanje stranice: {refresh_attempts}/{max_refresh_attempts}")
                    driver.refresh()  # Osvježi stranicu
                    time.sleep(2)  # Pauza nakon osvježavanja

            if refresh_attempts >= max_refresh_attempts:
                print("Nisu pronađeni potrebni elementi nakon višestrukih pokušaja.")
                extracted_data['host_name'] = "Nema imena domaćina"
                extracted_data['host_rating'] = "Nema ocjene"

            # Izvlačenje ID-a listinga, za provjeru imamo li ga već u bazi u ponovnim pokretanjima skripte

            room_id = getRoomID(url)

            listingsDetails.append({"id": room_id, "name": name, "cijena": cijena, **extracted_data, "županija": zupanija, "grad": grad, "latitude": latitude, "longitude": longitude})
            # ----------------------------------------
            # KLIK NA KALENDAR I ČITANJE BLOKIRANIH DANA
            # ----------------------------------------
            
            # close_popups(driver)
            
            # # Pričekaj da se kalendar prikaže
            # WebDriverWait(driver, 10).until(
            #     EC.presence_of_element_located((By.CLASS_NAME, "_cvkwaj"))
            # )
            
            # next_button = WebDriverWait(driver, 10).until(
            #     EC.element_to_be_clickable((
            #         By.XPATH, 
            #         "//button[@class='l1ovpqvx atm_1he2i46_1k8pnbi_10saat9 atm_yxpdqi_1pv6nv4_10saat9 atm_1a0hdzc_w1h1e8_10saat9 atm_2bu6ew_929bqk_10saat9 atm_12oyo1u_73u7pn_10saat9 atm_fiaz40_1etamxe_10saat9 b85v83j atm_9j_tlke0l atm_9s_1o8liyq atm_gi_idpfg4 atm_mk_h2mmj6 atm_r3_1h6ojuz atm_70_5j5alw atm_vy_1wugsn5 atm_tl_1gw4zv3 atm_9j_13gfvf7_1o5j5ji c1xklw0o atm_bx_48h72j atm_cs_10d11i2 atm_5j_t09oo2 atm_kd_glywfm atm_uc_1lizyuv atm_r2_1j28jx2 atm_c8_km0zk7 atm_g3_18khvle atm_fr_1m9t47k atm_jb_1yg2gu8 atm_3f_glywfm atm_26_1j28jx2 atm_7l_jt7fhx atm_rd_8stvzk atm_9xn0br_1wugsn5 atm_9tnf0v_1wugsn5 atm_7o60g0_1wugsn5 atm_gz_1bs0ed2 atm_h0_1bs0ed2 atm_l8_ftgil2 atm_uc_glywfm__1rrf6b5 atm_kd_glywfm_1w3cfyq atm_uc_aaiy6o_1w3cfyq atm_3f_glywfm_e4a3ld atm_l8_idpfg4_e4a3ld atm_gi_idpfg4_e4a3ld atm_3f_glywfm_1r4qscq atm_kd_glywfm_6y7yyg atm_uc_glywfm_1w3cfyq_1rrf6b5 atm_kd_glywfm_pfnrn2_1oszvuo atm_uc_aaiy6o_pfnrn2_1oszvuo atm_3f_glywfm_1icshfk_1oszvuo atm_l8_idpfg4_1icshfk_1oszvuo atm_gi_idpfg4_1icshfk_1oszvuo atm_3f_glywfm_b5gff8_1oszvuo atm_kd_glywfm_2by9w9_1oszvuo atm_uc_glywfm_pfnrn2_1o31aam atm_tr_18md41p_csw3t1 atm_k4_kb7nvz_1o5j5ji atm_3f_glywfm_1w3cfyq atm_26_zbnr2t_1w3cfyq atm_7l_jt7fhx_1w3cfyq atm_70_18bflhl_1w3cfyq atm_3f_glywfm_pfnrn2_1oszvuo atm_26_zbnr2t_pfnrn2_1oszvuo atm_7l_jt7fhx_pfnrn2_1oszvuo atm_70_18bflhl_pfnrn2_1oszvuo atm_rd_8stvzk_pfnrn2 atm_3f_glywfm_1nos8r_uv4tnr atm_26_zbnr2t_1nos8r_uv4tnr atm_7l_177r58q_1nos8r_uv4tnr atm_rd_8stvzk_1nos8r_uv4tnr atm_3f_glywfm_4fughm_uv4tnr atm_26_1j28jx2_4fughm_uv4tnr atm_7l_9vytuy_4fughm_uv4tnr atm_3f_glywfm_csw3t1 atm_26_zbnr2t_csw3t1 atm_7l_177r58q_csw3t1 atm_3f_glywfm_1o5j5ji atm_26_1j28jx2_1o5j5ji atm_7l_9vytuy_1o5j5ji dir dir-ltr']"
            #     ))
            # ) 
            
            # next_button.click()
            # time.sleep(2)



            # WebDriverWait(driver, 10).until(
            #     EC.element_to_be_clickable((By.CLASS_NAME, "_19y8o0j"))
            # )

            # div_to_click = driver.find_element(By.CLASS_NAME, "_19y8o0j")

            # # Ponekad pomaže skrolati do elementa
            # driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", div_to_click)
            # driver.execute_script("window.scrollBy(0, -200);")
            # time.sleep(2)

            # div_to_click.click()

            # # Pričekaj da se kalendar prikaže
            # WebDriverWait(driver, 10).until(
            #     EC.presence_of_element_located((By.CLASS_NAME, "_cvkwaj"))
            # )

            # # --- PAGINACIJA PO MJESECIMA ---
            # # Prvi mjesec + do 11 sljedećih (ukupno 12)
            # max_mjeseci = 12

            # all_blocked_dates = []
            # all_available_dates = []

            # for i in range(max_mjeseci):
            #     # 1) Dohvati sve tablice trenutnog (ili prvog) prikazanog mjeseca
            #     calendar_tables = driver.find_elements(By.CLASS_NAME, "_cvkwaj")

            #     # Prođi kroz sve tablice i pokupi raspoložive/blokirane datume
            #     for table in calendar_tables:
            #         date_elements = table.find_elements(By.XPATH, ".//td[@role='button']")
            #         for date_element in date_elements:
            #             date_div = date_element.find_element(By.TAG_NAME, "div")
            #             is_blocked = (date_div.get_attribute("data-is-day-blocked") == "true")
            #             date_text = date_div.get_attribute("data-testid")
                        
            #             if date_text:
            #                 if is_blocked:
            #                     all_blocked_dates.append(date_text)
            #                 else:
            #                     all_available_dates.append(date_text)

            #     # 2) Pokušaj kliknuti "sljedeći mjesec"
            #     try:
            #         next_button = WebDriverWait(driver, 5).until(-+*+
            #             EC.element_to_be_clickable((
            #                 By.XPATH, 
            #                 "//button[@aria-label='Korak naprijed za prelazak na sljedeći mjesec.']"
            #             ))
            #         ) 
            #         next_button.click()
            #         time.sleep(2)  # kratak sleep da se kalendar osvježi
            #     except Exception as e:
            #         print(f"Prekidam paginaciju (nema gumba za sljedeći mjesec ili je onemogućen). Razlog: {e}")
            #         break

            # # Na kraju spremite sve prikupljene datume
            # listingsDetails.append({
            #     "blocked_dates": all_blocked_dates,
            #     "available_dates": all_available_dates
            # })

            break  # ako je sve prošlo OK, izlazimo iz while petlje

        except Exception as e:
            pokusaj += 1
            print(f"Greška pri scrapeanju {url}: {e}. Pokušaj {pokusaj} od {ponavljanja}.")
            if pokusaj >= ponavljanja:
                print(f"Neuspješno scrapeanje {url} nakon {ponavljanja} pokušaja.")
                listingsDetails.append({"error": str(e)})

        finally:
            # Bez obzira na uspjeh ili grešku, gasi driver na kraju ovog pokušaja
            if driver:
                driver.quit()

    return listingsDetails

def load_existing_listings(file_path="listingsDetails.json"):
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            return {listing["id"] for listing in data}, data
    except (FileNotFoundError, json.JSONDecodeError):
        return set(), []


def scrape_vise_oglasa(urls, radne=3):
    """
    Skuplja rezultate za više oglasa paralelno.
    Vraća samo nove listinge (ne sprema u JSON)
    """
    all_listings = []
    existing_ids, _ = load_existing_listings()

    with concurrent.futures.ThreadPoolExecutor(max_workers=radne) as executor:
        futures = {executor.submit(scrape_jedan_oglas, url): url for url in urls}

        for future in concurrent.futures.as_completed(futures):
            try:
                result = future.result()
                if result:
                    new_listings = [listing for listing in result if listing["id"] not in existing_ids]
                    all_listings.extend(new_listings)
            except Exception as e:
                print(f"Greška: {e}")

    return all_listings

def extract_listings_links(driver, pocetni_link):
    driver.get(pocetni_link)
    listings_links = set()
    scroll_pause = 2
    max_refresh_attempts = 2
    refresh_attempts = 0

    while True:
        try:
            soup = BeautifulSoup(driver.page_source, "lxml")
            links = soup.find_all("a", href=True)
            for link in links:
                href = link["href"]
                if "/rooms/" in href:
                    full_url = "https://www.airbnb.com" + href
                    listings_links.add(full_url)

            # Za testiranje (limitiramo koliko linkova želimo skupiti)
            if len(listings_links) > 36:
                break

            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(scroll_pause)

            # Provjera postoji li gumb i refresh ako ne
            try:
                next_button = WebDriverWait(driver, 3).until(
                    EC.element_to_be_clickable((By.XPATH, "//a[@aria-label='Sljedeće' or @aria-label='Next']"))
                )
                close_popups(driver)
                next_button.click()
                time.sleep(3)
                refresh_attempts = 0
            except TimeoutException:
                if refresh_attempts < max_refresh_attempts:
                    print(f"Gumb za sljedeću stranicu nije pronađen. Pokušaj: {refresh_attempts + 1}/{max_refresh_attempts})...")
                    driver.refresh()
                    time.sleep(1)
                    refresh_attempts += 1
                else:
                    print("Maksimalni pokušaj refresh-anja dosegnut")
                    break
        except Exception as e:
            print(f"Greška pri izvlačenju linkova {e}")
            break

    return list(listings_links)

def main():
    pocetni_link = 'https://www.airbnb.com/s/Croatia/homes?refinement_paths%5B%5D=%2Fhomes&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=2025-02-01&monthly_length=3&monthly_end_date=2025-05-01&price_filter_input_type=0&channel=EXPLORE&query=Croatia&date_picker_type=calendar&source=structured_search_input_header&search_type=autocomplete_click&adults=1&price_filter_num_nights=5&place_id=ChIJ7ZXdCghBNBMRfxtm4STA86A&location_bb=Qjo4V0GblDpCKVqiQVXWoQ%3D%3D'

    options = Options()
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    try:
        existing_ids, existing_listings = load_existing_listings()
        
        urls = extract_listings_links(driver, pocetni_link)
        new_listings = scrape_vise_oglasa(urls)

        combined_listings = existing_listings + new_listings
        
        with open("listingsDetails.json", "w", encoding="utf-8") as file:
            json.dump(combined_listings, file, ensure_ascii=False, indent=4)

        print(f"Scraping completed. New listings added: {len(new_listings)}")
        print(f"Total listings in file: {len(combined_listings)}")

    finally:
        driver.quit()

main()
