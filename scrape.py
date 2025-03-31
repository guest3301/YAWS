import requests
from bs4 import BeautifulSoup


def clean_main_content(html):
    soup = BeautifulSoup(html, 'html.parser')
    main = soup.find("main")
    if main:
        for tag in main.find_all():  # Iterate through all tags
            tag.attrs = {k: v for k, v in tag.attrs.items() if k == "href"}  # Keep only href
        return main.prettify()
    return ""

def scrape_and_save(urls, output_file):
    with open(output_file, "w", encoding="utf-8") as f:
        for url in urls:
            try:
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                cleaned_content = clean_main_content(response.text)
                f.write(cleaned_content + "\n")
                print(f"Scraped: {url}")
            except requests.RequestException as e:
                print(f"Failed to fetch {url}: {e}")

urls = [
    "https://saketcollege.edu.in/admission/",
    "https://saketcollege.edu.in/departments/",
    "https://saketcollege.edu.in/programme-course-outcome/",
    "https://saketcollege.edu.in/syballus/",
    "https://saketcollege.edu.in/arts/",
    "https://saketcollege.edu.in/science/",
    "https://saketcollege.edu.in/bi-focal/",
    "https://saketcollege.edu.in/commerce/",
    "https://saketcollege.edu.in/certificate-courses/"
]

scrape_and_save(urls, "scraped_main_content.html")
