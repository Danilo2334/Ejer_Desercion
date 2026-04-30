import requests
import os

# crear carpeta si no existe
os.makedirs("data_lake/raw", exist_ok=True)

url = "https://www.mineducacion.gov.co/sistemasdeinformacion/1783/articles-415244_recurso_6.xlsx"

response = requests.get(url)

with open("data_lake/raw/articles-415244_recurso_6.xlsx", "wb") as f:
    f.write(response.content)

print("Dataset de tasas descargado correctamente")