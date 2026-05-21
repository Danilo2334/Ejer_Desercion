import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from scipy.stats import f_oneway
from statsmodels.stats.multicomp import pairwise_tukeyhsd

# ==========================================
# CARGAR DATASET
# ==========================================

df = pd.read_csv("data_lake/processed/dataset_tasas_clean.csv")

# ==========================================
# LIMPIAR COLUMNAS
# ==========================================

df.columns = df.columns.str.strip().str.lower()

# ==========================================
# ELIMINAR NULOS
# ==========================================

df = df.dropna(subset=["tasa", "nivel de formacion"])

# ==========================================
# MOSTRAR GRUPOS
# ==========================================

print("\n========== NIVELES ENCONTRADOS ==========")

print(df["nivel de formacion"].unique())

# ==========================================
# ESTADÍSTICA DESCRIPTIVA
# ==========================================

print("\n========== ESTADÍSTICA DESCRIPTIVA ==========")

estadisticas = df.groupby("nivel de formacion")["tasa"].agg(
    ["mean", "median", "std"]
)

print(estadisticas)

# ==========================================
# BOXPLOT
# ==========================================

plt.figure(figsize=(10,6))

sns.boxplot(
    data=df,
    x="nivel de formacion",
    y="tasa"
)

plt.title("Distribución de tasas por nivel de formación")

plt.xlabel("Nivel de formación")

plt.ylabel("Tasa")

plt.xticks(rotation=15)

plt.show()

# ==========================================
# CREAR GRUPOS PARA ANOVA
# ==========================================

groups = []

for nivel in df["nivel de formacion"].unique():

    grupo = df[df["nivel de formacion"] == nivel]["tasa"]

    groups.append(grupo)

# ==========================================
# ANOVA
# ==========================================

anova_result = f_oneway(*groups)

print("\n========== RESULTADO ANOVA ==========")

print("F-Statistic:", anova_result.statistic)

print("p-value:", anova_result.pvalue)

# ==========================================
# INTERPRETACIÓN
# ==========================================

if anova_result.pvalue < 0.05:

    print("\n✅ Se rechaza H0")

    print("Sí existen diferencias significativas entre niveles de formación")

else:

    print("\n❌ No se rechaza H0")

    print("No existen diferencias significativas")

# ==========================================
# POST HOC TEST (TUKEY)
# ==========================================

print("\n========== POST HOC TEST ==========")

tukey = pairwise_tukeyhsd(

    endog=df["tasa"],

    groups=df["nivel de formacion"],

    alpha=0.05
)

print(tukey)