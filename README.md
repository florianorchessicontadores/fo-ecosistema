# FO Ecosistema Digital
**Florian Orchessi & Asociados** · *Conocimiento, tecnología y gestión empresarial.*

Plataforma de conocimiento, capacitación y herramientas profesionales. Sitio estático (HTML, CSS y JavaScript, con contenidos en archivos JSON). Sin backend, sin base de datos y sin instalaciones.

**Versión actual: Etapa 1** (estructura, diseño institucional, menú, panel de inicio y las áreas Contable, Tributaria y Laboral). Las etapas 2 a 5 tienen su estructura preparada.

---

## 1. Cómo abrirla en Visual Studio Code

> Importante: **no abra `index.html` con doble clic.** Chrome y Edge bloquean la lectura de los archivos JSON en ese modo y la plataforma mostrará un aviso. Use un servidor local (1 minuto):

1. Instale [Visual Studio Code](https://code.visualstudio.com/).
2. Descomprima el ZIP y abra la carpeta con **Archivo → Abrir carpeta…** (elija `FO-ECOSISTEMA`).
3. Abra la pestaña de extensiones (`Ctrl + Shift + X`), busque **Live Server** (autor: Ritwick Dey) e instálela.
4. Haga clic derecho sobre `index.html` → **Open with Live Server**.
5. Se abrirá el navegador en `http://127.0.0.1:5500`. Cada vez que guarde un cambio, la página se actualiza sola.

## 2. Cómo publicarla en GitHub Pages

1. Cree una cuenta en [github.com](https://github.com) si no tiene una.
2. Pulse **New repository**. Póngale un nombre (por ejemplo `fo-ecosistema`).
   - **Atención:** en GitHub Pages gratuito el repositorio debe ser **público**, y todo lo que suba será visible para cualquiera. Por eso la plataforma solo debe contener material **no confidencial**.
3. En el repositorio vacío elija **uploading an existing file** y arrastre **el contenido** de la carpeta `FO-ECOSISTEMA` (no la carpeta en sí: `index.html` debe quedar en la raíz del repositorio). Incluya también el archivo oculto `.nojekyll` si su sistema lo muestra. Pulse **Commit changes**.
4. Vaya a **Settings → Pages**. En *Build and deployment* → *Source*, elija **Deploy from a branch**. En *Branch* elija **main** y la carpeta **/ (root)**. Pulse **Save**.
5. Espere 1 o 2 minutos. GitHub mostrará la dirección, con la forma `https://SU-USUARIO.github.io/fo-ecosistema/`.
6. Para actualizar contenidos: edite los archivos y suba los cambios (arrastrando archivos de nuevo, o con **Source Control** de VS Code).

Si luego quiere una dirección propia (por ejemplo `capacitacion.sudominio.com`), se configura en *Settings → Pages → Custom domain*.

---

## 3. Estructura del proyecto

```
FO-ECOSISTEMA/
├── index.html                 Página única de la plataforma
├── .nojekyll                  Evita procesamiento de GitHub Pages
├── assets/
│   ├── css/main.css           Estilos (colores en las variables de la sección 1)
│   ├── js/
│   │   ├── main.js            Arranque y definición de rutas
│   │   ├── data.js            Carga de los archivos JSON
│   │   ├── router.js          Navegación (#/ruta)
│   │   ├── shell.js           Menú lateral, barra superior, pie
│   │   ├── search.js          Buscador general
│   │   ├── progress.js        Progreso de capacitación (solo local)
│   │   ├── components.js      Piezas reutilizables (tablas de normas, avisos…)
│   │   ├── icons.js           Iconos SVG
│   │   ├── utils.js           Funciones de apoyo
│   │   └── views/             Una vista por pantalla (home, area, item, academy, …)
│   ├── images/                Logotipo y gráficos
│   ├── icons/                 Reservado para iconos propios
│   └── docs/                  Biblioteca Profesional (una carpeta por categoría)
├── data/                      TODO el contenido, en JSON
│   ├── site.json              Menú, áreas, textos institucionales, logotipo, hoja de ruta
│   ├── contable.json          Módulos del Área Contable
│   ├── tributaria.json        Temas del Área Tributaria
│   ├── laboral.json           Temas del Área Laboral
│   ├── academy.json           Ruta de aprendizaje y recomendaciones
│   ├── normativa.json         Catálogo de normas, fuentes y novedades
│   ├── tools.json             Diseño de las herramientas (FO Tools)
│   └── biblioteca.json        Categorías y documentos de la biblioteca
├── modules/                   Material propio por área (capturas) y código futuro de FO Tools
├── scripts/validar.mjs        Validador opcional (requiere Node.js)
└── README.md
```

Mejora respecto del esquema sugerido: se agregaron `site.json`, `tools.json` y `biblioteca.json` para que **ningún texto esté escrito dentro del código**; todo se edita en `data/`.

---

## 4. Cómo agregar y editar contenido (sin programar)

Todos los archivos de `data/` son texto. Edítelos con VS Code, que le avisará si falta una coma o comilla. Respete las comillas `"` y las comas entre elementos.

### 4.1 Desarrollar un tema pendiente
Abra el archivo del área (por ejemplo `data/laboral.json`), busque el tema por su `"titulo"` y reemplace su bloque. Un tema pendiente luce así:

```json
{ "id": "l10", "numero": 10, "titulo": "Gratificaciones", "estado": "pendiente",
  "resumen": "…", "nota": "…", "normas": ["ley-27735"] }
```

Para desarrollarlo, cambie `"estado"` a `"desarrollado"` y agregue los campos de la estructura de un módulo (copie como modelo el módulo `l09` Vacaciones o `c01`):

| Campo | Contenido |
|---|---|
| `objetivo` | Texto del objetivo de aprendizaje |
| `explicacion` | Lista de `{ "titulo", "texto" }` |
| `procedimiento` | Lista de pasos (texto) |
| `capturas` | Lista de `{ "archivo", "descripcion" }` (imágenes en `modules/<área>/img/`) |
| `ejemplos` | Lista de `{ "titulo", "descripcion" }` |
| `errores`, `recomendaciones` | Listas de texto |
| `ejercicios` | Lista de `{ "enunciado", "solucion" }` |
| `evaluacion` | Lista de `{ "pregunta", "opciones": [...], "correcta": 0, "explicacion" }` (`correcta` = posición de la opción correcta, empezando en 0) |
| `normas` | Lista de identificadores del catálogo, o `{ "id", "articulos" }` |
| `fecha_elaboracion`, `ultima_revision` | Fechas `"AAAA-MM-DD"` |

### 4.2 Registrar y verificar una norma
Todas las normas viven en `data/normativa.json`; los módulos solo las citan por su `id`. **Hoy todas figuran «por_verificar»**: el número de cada norma es una referencia de trabajo que debe contrastarse con la fuente oficial. Para verificar una norma:

1. Abra la fuente oficial (SUNAT, SUNAFIL, Ministerio de Trabajo, El Peruano, MEF o EsSalud).
2. Confirme número, fecha de publicación, fecha de vigencia y si fue modificada o derogada.
3. En `normativa.json` complete: `"estado"` (`vigente`, `modificada`, `derogada` o `por_verificar`), `"publicacion"`, `"vigencia"` y `"ultima_revision"`.
4. En el módulo que la cita, complete `"articulos"` y la `"ultima_revision"` del módulo.
5. Registre el cambio en `"novedades"`.

> La plataforma **no se actualiza automáticamente**. No existe conexión con la SUNAT ni con otras fuentes oficiales; toda actualización requiere revisión humana.

### 4.3 Incorporar el logotipo oficial
Copie el archivo a `assets/images/` y en `data/site.json` cambie `"logo": null` por `"logo": "assets/images/logo.png"`. Mientras tanto, el menú muestra un recuadro reservado «LOGO». No se creó ningún logotipo.

### 4.4 Agregar documentos a la Biblioteca
Copie el PDF a la carpeta de su categoría en `assets/docs/` y agregue un bloque en `"documentos"` dentro de `data/biblioteca.json` (la pantalla *Biblioteca Profesional* muestra un ejemplo).

### 4.5 Cambiar colores
En `assets/css/main.css`, sección 1 (`:root`): `--navy-*` (azul marino), `--gold-*` (dorado) y los grises.

### 4.6 Validar los archivos (opcional)
Con [Node.js](https://nodejs.org) instalado, desde la carpeta del proyecto:

```
node scripts/validar.mjs
```
Revisa JSON válido, normas citadas que no existan, preguntas mal configuradas, archivos faltantes y posibles datos sensibles (RUC, claves, tokens).

---

## 5. Qué contiene la Etapa 1

- **Estructura completa:** menú lateral desplegable (contraíble en PC; panel superpuesto en tablet), buscador general (atajo `/`), rutas, pie y diseño responsive.
- **Panel de inicio:** bienvenida, accesos a las tres áreas, últimos módulos, normativa y novedades, herramientas, ruta de aprendizaje e indicadores de progreso.
- **Área Contable (10 módulos), Tributaria (18 temas) y Laboral (18 temas).** Cada ficha tiene la estructura solicitada (objetivo, explicación, procedimiento, capturas, ejemplos, errores, recomendaciones, ejercicios, evaluación y referencias normativas).
- **Contenido inicial (9 temas)** de carácter conceptual: Contable 1, 5 y 6; Tributaria: IGV, Detracciones y Comprobantes de pago electrónicos; Laboral: Contratos de trabajo, Alta y baja en T-Registro y Vacaciones. **Los demás están marcados «Pendiente de desarrollo»** y no tienen contenido legal inventado.
- **FO Academy, FO Tools, Biblioteca y Normativa:** ya navegables. Academy funciona (ruta, evaluaciones, resultados); Tools muestra las fichas de diseño de las 8 herramientas; Biblioteca y Normativa tienen su estructura y catálogo.

### Reglas de contenido aplicadas
- No se incluyen tasas, porcentajes, plazos ni montos legales. Donde hacen falta, el texto indica que deben verificarse.
- Los ejemplos numéricos son ficticios y didácticos (no hay RUC, clientes ni comprobantes reales).
- Ningún módulo muestra fecha de «última revisión» hasta que una persona la registre; mientras tanto aparece **«Revisión normativa pendiente»**.
- **Antes de usar la plataforma para capacitar, el contador responsable debe revisar el contenido inicial y las referencias de norma.**

## 6. Limitaciones conocidas

- **Progreso de capacitación:** se guarda solo en el navegador de cada persona (almacenamiento local). **No es un sistema de usuarios, no es seguro y no es un registro oficial.** Si alguien borra los datos del navegador o cambia de equipo, se pierde. El seguimiento institucional real requiere un backend (etapas futuras).
- **Privacidad:** GitHub Pages es público. No suba datos de clientes, RUC, claves SOL, contraseñas, tokens, XML ni comprobantes reales, ni capturas que los muestren.
- **Compatibilidad:** desarrollada y probada en Google Chrome; usa estándares compatibles con Microsoft Edge (mismo motor).

## 7. Hoja de ruta

| Etapa | Alcance | Estado |
|---|---|---|
| 1 | Estructura, diseño, menú, inicio y las tres áreas | **Completada** |
| 2 | FO Academy: cursos completos y más evaluaciones | Estructura preparada |
| 3 | FO Tools: calculadoras (tras verificar parámetros legales) | Fichas de diseño listas |
| 4 | Biblioteca Profesional y Normativa y Actualizaciones | Estructura preparada |
| 5 | Integraciones con sistemas internos y API de SUNAT | Pendiente (requiere backend y manejo seguro de credenciales) |

---
*Plataforma de capacitación con contenido no confidencial. Verifique siempre la normativa en las fuentes oficiales.*
