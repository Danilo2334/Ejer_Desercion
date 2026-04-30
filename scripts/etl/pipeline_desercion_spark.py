# ==========================================
# PIPELINE ETL DESERCIÓN - FINAL DEFINITIVO
# ==========================================

import os
import pandas as pd

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, year, to_date, regexp_extract, when, upper, trim


# =========================
# CONFIGURACIÓN
# =========================
INPUT_PATH = "data_lake/raw/dataset_original.csv"
FINAL_OUTPUT = "data_lake/processed/dataset_desercion_clean.csv"


# =========================
# CREAR SPARK
# =========================
def create_spark():
    return SparkSession.builder \
        .appName("DesercionFinal") \
        .getOrCreate()


# =========================
# CARGAR DATOS
# =========================
def load_data(spark):
    return spark.read.csv(INPUT_PATH, header=True, inferSchema=True)


# =========================
# TRANSFORMACIONES
# =========================
def transform_data(df):

    # -------- LIMPIEZA ESTRATO --------
    df = df.withColumn("ESTRATO", upper(trim(col("ESTRATO"))))

    df = df.withColumn(
        "ESTRATO",
        when(col("ESTRATO").isin(
            "SIN INFORMACION",
            "SIN INFORMACIÓN",
            "NO APLICA",
            "",
            "NULL"
        ), None).otherwise(col("ESTRATO"))
    )

    # -------- TIPO DESERCIÓN --------
    df = df.withColumn(
        "tipo_desercion",
        regexp_extract(col("NOMBRE_ESTADO"), "LIT\\.?\\s*([A-Z])", 1)
    )

    # -------- FECHA Y EDAD --------
    df = df.withColumn(
        "FECHA_NACIMIENTO",
        to_date(col("FECHA_NACIMIENTO"), "dd/MM/yyyy")
    )

    df = df.withColumn(
        "edad",
        2024 - year(col("FECHA_NACIMIENTO"))
    )

    # -------- FILTRO --------
    df = df.filter((col("edad") >= 16) & (col("edad") <= 60))

    # -------- FINAL --------
    df_model = df.select(
        col("edad").cast("int"),
        col("GENERO"),
        col("ESTRATO"),
        col("NOMBRE_PROGRAMA"),
        col("NOMBRE_FACULTAD"),
        col("tipo_desercion")
    )

    return df_model


# =========================
# LIMPIEZA TEXTO (ANTI-BYTES)
# =========================
def clean_text(pdf):

    def clean_val(x):
        if x is None:
            return ""
        s = str(x)
        return s.encode("utf-8", "ignore").decode("utf-8")

    for c in pdf.columns:
        if pdf[c].dtype == "object":
            pdf[c] = pdf[c].map(clean_val)

    return pdf


# =========================
# GUARDAR DATA (FIX TOTAL)
# =========================
def save_data(df):

    print("Procesando guardado...")

    os.makedirs(os.path.dirname(FINAL_OUTPUT), exist_ok=True)

    pdf = df.toPandas()

    # eliminar NaN
    pdf = pdf.fillna("")

    # limpiar caracteres corruptos (0x81 y otros)
    pdf = clean_text(pdf)

    # 💥 CORREGIR ESTRATO
    if "ESTRATO" in pdf.columns:
        pdf["ESTRATO"] = pd.to_numeric(pdf["ESTRATO"], errors="coerce").astype("Int64")

    # 💥 GUARDAR EN UTF-8 BOM (CLAVE)
    pdf.to_csv(FINAL_OUTPUT, index=False, encoding="utf-8-sig")

    print("Archivo limpio guardado correctamente (UTF-8 BOM)")


# =========================
# MAIN
# =========================
def main():

    spark = create_spark()
    spark.sparkContext.setLogLevel("WARN")

    print("Cargando datos...")
    df = load_data(spark)

    print("Transformando...")
    df_clean = transform_data(df)

    print("Guardando...")
    save_data(df_clean)

    spark.stop()

    print("ETL COMPLETADO")
    print("Archivo en:", FINAL_OUTPUT)


# =========================
# EJECUCIÓN
# =========================
if __name__ == "__main__":
    main()