# ==========================================
# MODELO DE PREDICCIÓN DE TASA DE DESERCIÓN
# ==========================================

# =========================
# LIBRERÍAS
# =========================

# Manejo de datos tipo tabla
import pandas as pd
import numpy as np

# Visualización
import matplotlib.pyplot as plt

# Herramientas de machine learning
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score

# Modelo avanzado basado en árboles
from xgboost import XGBRegressor


# =========================
# CARGA DE DATOS
# =========================

# Se carga el dataset limpio
df = pd.read_csv("data_lake/processed/dataset_tasas_clean.csv")

# Se estandarizan nombres de columnas
df.columns = df.columns.str.strip().str.lower()

# Se eliminan registros con valores nulos
df = df.dropna()


# =========================
# ORDEN TEMPORAL
# =========================

# Se ordenan los datos por año (importante para series de tiempo)
df = df.sort_values("año")


# =========================
# CREACIÓN DE VARIABLES (FEATURE ENGINEERING)
# =========================

# Se agrupan datos por institución y características
grp = ["codigo ies padre", "tipo", "categoria", "nivel de formacion"]

# Variables históricas (lags)
# Estas representan valores pasados de la tasa
df["tasa_lag1"] = df.groupby(grp)["tasa"].shift(1)  # año anterior
df["tasa_lag2"] = df.groupby(grp)["tasa"].shift(2)  # hace 2 años
df["tasa_lag3"] = df.groupby(grp)["tasa"].shift(3)  # hace 3 años

# Promedio de los últimos 3 años (tendencia)
df["rolling_mean_3"] = df.groupby(grp)["tasa"].shift(1).rolling(3).mean()

# Desviación estándar (variabilidad)
df["rolling_std_3"] = df.groupby(grp)["tasa"].shift(1).rolling(3).std()

# Se eliminan filas sin historial suficiente
df = df.dropna()


# =========================
# VARIABLES DEL MODELO
# =========================

# Variables numéricas
num_cols = [
    "año",
    "tasa_lag1",
    "tasa_lag2",
    "tasa_lag3",
    "rolling_mean_3",
    "rolling_std_3"
]

# Variables categóricas
cat_cols = ["tipo", "categoria", "nivel de formacion"]

# X = variables de entrada
X = df[num_cols + cat_cols]

# y = variable objetivo (lo que queremos predecir)
y = df["tasa"]


# =========================
# PREPROCESAMIENTO
# =========================

# Se aplican transformaciones diferentes según tipo de dato
preprocess = ColumnTransformer([
    ("num", StandardScaler(), num_cols),  # escala numéricos
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols)  # convierte texto a números
])


# =========================
# MODELO
# =========================

# Modelo XGBoost (ensamble de árboles)
model = XGBRegressor(
    n_estimators=200,       # cantidad de árboles
    max_depth=4,            # profundidad de cada árbol
    learning_rate=0.05,     # velocidad de aprendizaje
    subsample=0.8,          # usa 80% de datos por árbol
    colsample_bytree=0.8,   # usa 80% de variables
    random_state=42
)

# Pipeline: une preprocesamiento + modelo
pipe = Pipeline([
    ("prep", preprocess),
    ("model", model)
])


# =========================
# VALIDACIÓN TEMPORAL
# =========================

# Divide datos respetando el tiempo
tscv = TimeSeriesSplit(n_splits=5)

# Validación cruzada
cv_mae = -cross_val_score(
    pipe, X, y,
    cv=tscv,
    scoring="neg_mean_absolute_error"
)

print("\nTimeSeries CV MAE:", cv_mae.mean())


# =========================
# TRAIN / TEST
# =========================

# Se separa el 80% para entrenamiento
cut_year = df["año"].quantile(0.8)

train = df[df["año"] <= cut_year]
test  = df[df["año"] > cut_year]

X_train = train[num_cols + cat_cols]
y_train = train["tasa"]

X_test = test[num_cols + cat_cols]
y_test = test["tasa"]


# =========================
# ENTRENAMIENTO
# =========================

pipe.fit(X_train, y_train)


# =========================
# PREDICCIONES
# =========================

preds = pipe.predict(X_test)


# =========================
# MÉTRICAS
# =========================

mae = mean_absolute_error(y_test, preds)
r2 = r2_score(y_test, preds)

print("\nMAE:", mae)
print("R2:", r2)


# =========================
# VISUALIZACIÓN
# =========================

# Gráfico 1: comparación real vs predicho
plt.figure()
plt.scatter(y_test, preds)
plt.xlabel("Real")
plt.ylabel("Predicho")
plt.title("Real vs Predicho")
plt.show()

# Gráfico 2: línea ideal
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
# EXPORTACIÓN
# =========================

# Se generan predicciones para todo el dataset
df["tasa_predicha"] = pipe.predict(X)

# Limpieza de nombres de columnas
df_export = df.copy()
df_export.columns = df_export.columns.str.replace(" ", "_")

# Redondeo para evitar problemas
float_cols = df_export.select_dtypes(include=["float64"]).columns
df_export[float_cols] = df_export[float_cols].round(4)

# Guardado final
df_export.to_csv("modelo_tasas.csv", index=False, encoding="utf-8")

print("\nCSV listo para PostgreSQL 🚀")