import requests
import os

# crear carpeta si no existe
os.makedirs("data_lake/raw", exist_ok=True)

url = "https://www.datos.gov.co/resource/3iew-7wpx.csv"

response = requests.get(url)

with open("data_lake/raw/dataset_original.csv", "wb") as f:
    f.write(response.content)

print("Dataset de deserción descargado correctamente")