# ==========================================
# MODELO TASAS FINAL + VALIDACIÓN VISUAL + EXPORT POSTGRES
# ==========================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score

from xgboost import XGBRegressor

# =========================
# CARGA
# =========================
df = pd.read_csv("data_lake/processed/dataset_tasas_clean.csv")

df.columns = df.columns.str.strip().str.lower()
df = df.dropna()

# =========================
# ORDEN TEMPORAL
# =========================
df = df.sort_values("año")

# =========================
# FEATURES (SOLO PASADO)
# =========================
grp = ["codigo ies padre", "tipo", "categoria", "nivel de formacion"]

df["tasa_lag1"] = df.groupby(grp)["tasa"].shift(1)
df["tasa_lag2"] = df.groupby(grp)["tasa"].shift(2)
df["tasa_lag3"] = df.groupby(grp)["tasa"].shift(3)

df["rolling_mean_3"] = df.groupby(grp)["tasa"].shift(1).rolling(3).mean()
df["rolling_std_3"] = df.groupby(grp)["tasa"].shift(1).rolling(3).std()

df = df.dropna()

# =========================
# VARIABLES
# =========================
num_cols = [
    "año",
    "tasa_lag1",
    "tasa_lag2",
    "tasa_lag3",
    "rolling_mean_3",
    "rolling_std_3"
]

cat_cols = ["tipo", "categoria", "nivel de formacion"]

X = df[num_cols + cat_cols]
y = df["tasa"]

# =========================
# PIPELINE
# =========================
preprocess = ColumnTransformer([
    ("num", StandardScaler(), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols)
])

model = XGBRegressor(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

pipe = Pipeline([
    ("prep", preprocess),
    ("model", model)
])

# =========================
# VALIDACIÓN TEMPORAL
# =========================
tscv = TimeSeriesSplit(n_splits=5)

cv_mae = -cross_val_score(
    pipe, X, y,
    cv=tscv,
    scoring="neg_mean_absolute_error"
)

print("\nTimeSeries CV MAE:", cv_mae.mean())

# =========================
# TRAIN / TEST TEMPORAL
# =========================
cut_year = df["año"].quantile(0.8)

train = df[df["año"] <= cut_year]
test  = df[df["año"] > cut_year]

X_train = train[num_cols + cat_cols]
y_train = train["tasa"]

X_test = test[num_cols + cat_cols]
y_test = test["tasa"]

# =========================
# ENTRENAR
# =========================
pipe.fit(X_train, y_train)

# =========================
# PREDICCIONES
# =========================
preds = pipe.predict(X_test)

mae = mean_absolute_error(y_test, preds)
r2 = r2_score(y_test, preds)

print("\nMAE:", mae)
print("R2:", r2)

# =========================
# VALIDACIÓN VISUAL
# =========================

# Scatter
plt.figure()
plt.scatter(y_test, preds)
plt.xlabel("Real")
plt.ylabel("Predicho")
plt.title("Real vs Predicho")
plt.show()

# Línea ideal
plt.figure()
plt.scatter(y_test, preds)
plt.plot(
    [y_test.min(), y_test.max()],
    [y_test.min(), y_test.max()]
)
plt.xlabel("Real")
plt.ylabel("Predicho")
plt.title("Comparación con Línea Ideal")
plt.show()

# =========================
# GENERAR PREDICCIONES COMPLETAS
# =========================
df["tasa_predicha"] = pipe.predict(X)

# =========================
# EXPORTACIÓN LIMPIA PARA POSTGRES 🔥
# =========================

df_export = df.copy()

# limpiar nombres columnas
df_export.columns = (
    df_export.columns
    .str.strip()
    .str.lower()
    .str.replace(" ", "_")
    .str.replace("ñ", "n")
    .str.replace("á", "a")
    .str.replace("é", "e")
    .str.replace("í", "i")
    .str.replace("ó", "o")
    .str.replace("ú", "u")
)

# redondear floats (evita problemas)
float_cols = df_export.select_dtypes(include=["float64"]).columns
df_export[float_cols] = df_export[float_cols].round(4)

# guardar CSV listo para postgres
df_export.to_csv(
    "data_lake/processed/modelo_tasas.csv",
    index=False,
    encoding="utf-8"
)

print("\nCSV listo para PostgreSQL 🚀")