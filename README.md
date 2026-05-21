# 🎓 Pipeline ETL y Analítica de Deserción Estudiantil

> Pipeline de ingeniería de datos orientado al procesamiento, transformación y análisis de información sobre deserción estudiantil y tasas educativas en instituciones de educación superior de Colombia.

---

## 📋 Tabla de Contenidos

- [Objetivo](#-objetivo)
- [Problemática](#-problemática)
- [Arquitectura](#-arquitectura)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Datasets](#-datasets)
- [Tecnologías](#-tecnologías)
- [Pipeline ETL](#-pipeline-etl)
- [Análisis Estadístico — ANOVA](#-análisis-estadístico--anova)
- [Modelo Predictivo](#-modelo-predictivo)
- [Infraestructura](#-infraestructura--postgresql--docker--railway)
- [Dashboard Power BI](#-dashboard-power-bi)
- [Hallazgos](#-principales-hallazgos)
- [Resultados](#-resultados)

---

## 🚀 Objetivo

Diseñar e implementar un pipeline de datos capaz de:

- Extraer datasets desde fuentes oficiales
- Procesar y limpiar información mediante ETL con PySpark
- Estructurar y almacenar datos en PostgreSQL
- Construir dashboards analíticos en Power BI
- Aplicar análisis estadístico (ANOVA)
- Implementar modelos predictivos sobre tasas educativas

---

## 🧠 Problemática

La deserción estudiantil representa uno de los principales desafíos en la educación superior por su impacto académico, social, económico e institucional.

Este proyecto transforma datos crudos en información útil para la toma de decisiones, identificando patrones relacionados con:

| Dimensión | Variables |
|-----------|-----------|
| Académica | Facultades, programas académicos |
| Sociodemográfica | Estratos, género |
| Institucional | Tasas educativas, comportamiento institucional |

---

## 🏗️ Arquitectura

```
Fuentes Oficiales          datos.gov.co / MEN
        ↓
Extracción Python
        ↓
    Data Lake              RAW / PROCESSED
        ↓
  ETL PySpark
        ↓
Transformación de Datos
        ↓
    PostgreSQL             Docker / Railway
        ↓
  Conexión ODBC
        ↓
    Power BI
        ↓
Dashboard + Analítica
        ↓
ANOVA + Predicción
```

---

## 📂 Estructura del Proyecto

```
project/
│
├── data_lake/
│   ├── raw/
│   └── processed/
│
├── etl/
│   ├── etl_desercion.py
│   └── etl_tasas.py
│
├── sql/
├── dashboards/
├── notebooks/
├── docs/
└── README.md
```

---

## 📊 Datasets

### Dataset de Deserción Estudiantil

| Atributo | Detalle |
|----------|---------|
| **Fuente** | [datos.gov.co](https://datos.gov.co) |
| **Formato** | CSV |
| **Variables** | Programa académico, Facultad, Género, Estrato, Fecha de nacimiento, Estado del estudiante |

### Dataset de Tasas Educativas

| Atributo | Detalle |
|----------|---------|
| **Fuente** | Ministerio de Educación Nacional |
| **Formato** | Excel (.xlsx) |
| **Indicadores** | TDA, TAI, TDCA, TGA |
| **Variables** | Año, Tasa, Nivel de formación, Categoría institucional |

---

## ⚙️ Tecnologías

| Tecnología | Uso |
|------------|-----|
| Python | Desarrollo general |
| PySpark | ETL y procesamiento distribuido |
| Pandas | Manipulación de datos |
| PostgreSQL | Base de datos relacional |
| pgAdmin | Administración de BD |
| Docker | Contenedores |
| Railway | Hosting PostgreSQL |
| Power BI | Dashboards |
| ODBC | Conexión PostgreSQL ↔ Power BI |
| Requests | Extracción HTTP |

---

## 🔥 Pipeline ETL

El proceso ETL fue desarrollado con **PySpark** para procesamiento distribuido y eficiente.

### ✅ Extracción
- Descarga automática desde fuentes oficiales
- Ingesta en Data Lake (capa RAW)

### ✅ Transformación
- Limpieza de datos
- Normalización de texto
- Conversión de fechas y cálculo de edad
- Extracción de variables derivadas
- Reestructuración wide → long

### ✅ Validación
- Validación de tipos de datos
- Consistencia de edades
- Eliminación de duplicados
- Validación de categorías

### ✅ Carga
- Exportación CSV UTF-8
- Carga a PostgreSQL (capa PROCESSED)

---

## 🧪 Análisis Estadístico — ANOVA

Implementación de análisis **ANOVA** para evaluar diferencias estadísticas entre grupos académicos relacionados con la deserción y las tasas educativas.

### Hipótesis

| Hipótesis | Descripción |
|-----------|-------------|
| **H₀** | No existen diferencias significativas entre grupos |
| **H₁** | Sí existen diferencias significativas entre grupos |

### Variables Analizadas

- Facultad
- Programa académico
- Estrato
- Tasas educativas
- Tipo de deserción

### Criterio de Significancia

```python
if p_value < 0.05:
    # Rechazar H0 — existen diferencias significativas
```

---

## 🤖 Modelo Predictivo

Modelo orientado al análisis y predicción de tasas educativas.

### Variables de Entrada

- Año
- Tipo de tasa
- Categoría institucional
- Lag features
- Rolling mean

### Métricas de Evaluación

| Métrica | Descripción |
|---------|-------------|
| **MAE** | Error absoluto medio — mide precisión |
| **R²** | Coeficiente de determinación — evalúa capacidad predictiva |

---

## 🗄️ Infraestructura — PostgreSQL + Docker + Railway

La capa de almacenamiento fue desplegada con:

- **PostgreSQL** — base de datos relacional
- **Docker** — contenedores para el entorno local
- **Railway** — hosting en la nube

Esto habilitó:

- ✅ Persistencia de datos
- ✅ Acceso remoto
- ✅ Despliegue en la nube
- ✅ Integración directa con Power BI vía ODBC

---

## 📊 Dashboard Power BI

Dashboards analíticos interactivos orientados a:

- Deserción por facultad y por programa
- Comportamiento por género
- Análisis temporal
- Tasas educativas e indicadores institucionales

### KPIs Implementados

| KPI | Descripción |
|-----|-------------|
| Total estudiantes | Volumen general |
| Promedio tasas | Indicadores educativos |
| % Deserción | Tasa global de deserción |
| Distribución por facultad | Comparativa institucional |
| Evolución temporal | Tendencia histórica |

---

## 🔍 Principales Hallazgos

- Patrones de deserción diferenciados según facultad y programa académico
- Diferencias estadísticamente significativas entre grupos académicos (ANOVA)
- Tendencias identificables en el comportamiento de tasas educativas a lo largo del tiempo
- Variables relevantes para alimentar modelos predictivos

---

## 📈 Resultados

| Componente | Estado |
|------------|--------|
| Pipeline ETL completo | ✅ |
| Data Lake funcional | ✅ |
| Procesamiento distribuido con PySpark | ✅ |
| Base de datos PostgreSQL en la nube | ✅ |
| Integración con Power BI | ✅ |
| Análisis ANOVA | ✅ |
| Modelos predictivos | ✅ |
| Dashboards analíticos interactivos | ✅ |

---

## 📚 Documentación

Toda la documentación técnica — scripts ETL, arquitectura, análisis estadístico y dashboards — está disponible en este repositorio.

---

## 🧩 Áreas de Conocimiento

Este proyecto integra conceptos de **Ingeniería de Datos**, **Business Intelligence**, **Analítica Estadística** y **Machine Learning**, construyendo un flujo completo orientado a la toma de decisiones basada en datos.

---

*Proyecto desarrollado como solución analítica aplicada al análisis de deserción estudiantil y tasas educativas en Colombia.*
