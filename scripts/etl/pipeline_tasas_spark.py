# ==========================================
# PIPELINE ETL TASAS - FINAL WINDOWS PRO
# ==========================================

from pyspark.sql import SparkSession
import pandas as pd
import os

# =========================
# RUTAS
# =========================
INPUT_PATH = "data_lake/raw/articles-415244_recurso_6.xlsx"
OUTPUT_PATH = "data_lake/processed/dataset_tasas_clean.csv"


# =========================
# CREAR SPARK
# =========================
def create_spark():
    return SparkSession.builder \
        .appName("PipelineTasas") \
        .getOrCreate()


# =========================
# DETECTAR HEADER
# =========================
def encontrar_header(df_raw):
    for i in range(20):
        fila = df_raw.iloc[i].astype(str).str.upper()
        if fila.str.contains("CODIGO").any() and fila.str.contains("IES").any():
            return i
    return None


# =========================
# PROCESAR HOJA
# =========================
def procesar_hoja(file, sheet_name):

    df_raw = pd.read_excel(file, sheet_name=sheet_name, header=None)
    header_row = encontrar_header(df_raw)

    if header_row is None:
        print(f"Hoja ignorada: {sheet_name}")
        return None

    df = pd.read_excel(file, sheet_name=sheet_name, header=header_row)

    # limpieza
    df.columns = df.columns.astype(str).str.strip()
    df = df.dropna(axis=1, how='all')
    df = df.dropna(how='all')

    columnas_id = []

    for col in df.columns:
        col_upper = col.upper()

        if "CODIGO IES PADRE" in col_upper:
            columnas_id.append(col)
        elif col_upper == "CODIGO":
            columnas_id.append(col)
        elif col_upper == "IES":
            columnas_id.append(col)
        elif "NIVEL" in col_upper:
            columnas_id.append(col)

    columnas_valor = [col for col in df.columns if col not in columnas_id]

    # transformar
    df_long = df.melt(
        id_vars=columnas_id,
        value_vars=columnas_valor,
        var_name="Año",
        value_name="Tasa"
    )

    # tipos
    df_long["Año"] = pd.to_numeric(df_long["Año"], errors="coerce")
    df_long["Tasa"] = pd.to_numeric(df_long["Tasa"], errors="coerce")

    df_long = df_long.dropna(subset=["Año", "Tasa"])

    df_long["Año"] = df_long["Año"].astype(int)
    df_long["Tasa"] = (df_long["Tasa"] * 100).round(2)

    # contexto
    partes = sheet_name.split()
    tipo = partes[0]
    categoria = " ".join(partes[1:]).lower()

    if "padre total" in categoria:
        categoria = "IES Padre Total"
    elif "padre nivel" in categoria:
        categoria = "IES Padre Nivel Formación"
    elif "nivel" in categoria:
        categoria = "IES Nivel Formación"
    else:
        categoria = categoria.title()

    df_long["Tipo"] = tipo
    df_long["Categoria"] = categoria

    return df_long


# =========================
# MAIN
# =========================
def main():

    spark = create_spark()

    print("Leyendo Excel...")
    xls = pd.ExcelFile(INPUT_PATH)

    dfs = []

    for sheet in xls.sheet_names:
        print(f"Procesando: {sheet}")
        df_temp = procesar_hoja(INPUT_PATH, sheet)

        if df_temp is not None:
            dfs.append(df_temp)

    # unir
    df_final = pd.concat(dfs, ignore_index=True)
    df_final = df_final.drop_duplicates()

    print("Convirtiendo a Spark...")
    df_spark = spark.createDataFrame(df_final)

    print("Validación...")
    df_spark.groupBy("Tipo").count().show()
    df_spark.groupBy("Categoria").count().show()
    df_spark.describe(["Tasa"]).show()

    # =========================
    # GUARDADO FINAL (SIN NAN)
    # =========================
    print("Guardando...")

    os.makedirs("data_lake/processed", exist_ok=True)

    pdf = df_spark.toPandas()

    # 💥 SOLUCIÓN DEFINITIVA
    pdf = pdf.fillna("")   # ← elimina nan completamente

    pdf.to_csv(OUTPUT_PATH, index=False)

    print("ETL TASAS COMPLETADO")
    print("Archivo limpio en:", OUTPUT_PATH)

    spark.stop()


# =========================
# EJECUCIÓN
# =========================
if __name__ == "__main__":
    main()