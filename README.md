# 📚 Diccionario Shipibo-Konibo - Español

Diccionario digital interactivo para la preservación y difusión de la lengua Shipibo-Konibo de Ucayali, Perú.

## 🌟 Características

- ✅ **4,817+ palabras** del idioma Shipibo-Konibo
- 🔍 **Búsqueda inteligente** en tiempo real (Shipibo y Español)
- 🎯 **Filtros avanzados** por categoría gramatical, letra, tipo
- 💬 **Ejemplos contextuales** con traducciones
- 📱 **Diseño responsive** - funciona en móviles, tablets y desktop
- ⚡ **Rápido y eficiente** - sin base de datos, 100% frontend
- 🎨 **Interfaz moderna** y profesional
- ♿ **Accesible** y fácil de usar

## 🚀 Instalación y Deployment

### Opción 1: GitHub Pages (RECOMENDADO - Gratis)

1. **Crear repositorio en GitHub:**
   ```bash
   # En tu terminal
   git init
   git add .
   git commit -m "Initial commit - Diccionario Shipibo-Konibo"
   ```

2. **Conectar con GitHub:**
   ```bash
   # Crea un repositorio en github.com primero, luego:
   git remote add origin https://github.com/TU-USUARIO/diccionario-shipibo.git
   git branch -M main
   git push -u origin main
   ```

3. **Activar GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Click en "Settings" → "Pages"
   - En "Source", selecciona "main" branch
   - Click "Save"
   - ¡Tu sitio estará en: `https://TU-USUARIO.github.io/diccionario-shipibo/`

### Opción 2: Netlify (Alternativa - También Gratis)

1. **Arrastra la carpeta completa** a [netlify.com/drop](https://app.netlify.com/drop)
2. **¡Listo!** - Tu sitio estará online en segundos
3. Puedes personalizar el dominio después

### Opción 3: Vercel (Alternativa - También Gratis)

1. Conecta tu repositorio de GitHub a [vercel.com](https://vercel.com)
2. Vercel detectará automáticamente la configuración
3. Deploy automático con cada push

## 📁 Estructura de Archivos

```
diccionario-shipibo/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── app.js             # Lógica JavaScript
├── diccionario.json   # Datos del diccionario (4817 entradas)
├── README.md          # Este archivo
└── .gitignore         # Archivos a ignorar
```

## 🔧 Personalización

### Cambiar colores del tema:

Edita las variables CSS en `styles.css`:

```css
:root {
    --primary: #2563eb;      /* Color principal */
    --secondary: #10b981;    /* Color secundario */
    /* ... más colores */
}
```

### Agregar más información:

Edita los enlaces del footer en `index.html` y `app.js`.

### Actualizar datos:

1. Edita el archivo Excel original
2. Ejecuta el script de conversión:
   ```bash
   python3 convertir_excel.py
   ```
3. Reemplaza `diccionario.json`
4. Haz commit y push

## 📊 Actualizar el Diccionario

### Método 1: Desde Excel (actual)

```python
# convertir_excel.py
import pandas as pd
import json

df = pd.read_excel('Diccionario_Shipibo-Konibo.xlsx')
# ... (código de conversión)
```

### Método 2: Migrar a Google Sheets (futuro)

Para permitir actualizaciones sin código:

1. Sube el Excel a Google Sheets
2. Haz la hoja pública: "Archivo" → "Compartir" → "Cualquiera con el enlace"
3. Obtén el ID de la hoja (en la URL)
4. Reemplaza en `app.js`:

```javascript
async function cargarDiccionario() {
    const SHEET_ID = 'TU_SHEET_ID_AQUI';
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    // ... procesar datos
}
```

## 🌐 Dominio Personalizado

### Para GitHub Pages:

1. Compra un dominio (ejemplo: diccionarioshipibo.com)
2. En GitHub Settings → Pages → Custom domain
3. Configura DNS de tu proveedor:
   ```
   CNAME record: www → TU-USUARIO.github.io
   A records: @ → 185.199.108.153
                  → 185.199.109.153
                  → 185.199.110.153
                  → 185.199.111.153
   ```

## 📈 Analytics (Opcional)

Para rastrear visitas, agrega antes de `</body>` en `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=TU-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'TU-ID');
</script>
```

## 🤝 Contribuir

¿Quieres mejorar el diccionario?

1. Fork el repositorio
2. Crea una rama: `git checkout -b mejora-busqueda`
3. Haz tus cambios y commit: `git commit -m "Mejora en la búsqueda"`
4. Push: `git push origin mejora-busqueda`
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo licencia MIT. Libre para usar, modificar y distribuir.

## 🙏 Créditos

- Datos del diccionario: Instituto Lingüístico de Verano (ILV)
- Diseño y desarrollo: [Tu nombre/organización]
- Comunidad Shipibo-Konibo de Ucayali, Perú

## 📞 Contacto

Para preguntas, sugerencias o colaboraciones:
- Email: [tu-email@example.com]
- GitHub Issues: [link-al-repositorio]

---

**Hecho con ❤️ para preservar la lengua Shipibo-Konibo**

🌿 _"La lengua es el alma de un pueblo"_
