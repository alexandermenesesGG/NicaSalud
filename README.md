# NicaSalud

## README tecnico

Descripcion general, tecnologias utilizadas, instalacion basica y ejecucion del sistema.

## Descripcion general

NicaSalud es un sitio web informativo de salud comunitaria para Nicaragua. Reune contenido educativo, busqueda interna, secciones de plantas y recetas, un mapa hospitalario, una mini encuesta de salud, un calculador de IMC, un formulario de contacto y un panel de administracion para revisar mensajes recibidos.

## Que incluye la pagina

- Pagina principal con presentacion del proyecto y formulario de contacto.
- Seccion de enfermedades frecuentes con informacion preventiva.
- Seccion de plantas medicinales con busqueda y panel de detalle.
- Seccion de recetas relacionadas con plantas.
- Mapa hospitalario interactivo.
- Mini encuesta de salud e IMC orientativo.
- Formulario de contacto con guardado en MySQL.
- Panel `/admin/` para revisar y eliminar mensajes recibidos.

## Tecnologias utilizadas

- HTML5 para la estructura de las paginas.
- CSS3 para el diseño visual y el modo oscuro.
- JavaScript vanilla para busquedas, filtros, calculos y el formulario de contacto.
- PHP 8.3 para la API de contacto y el panel de administracion.
- MySQL 8 para almacenar mensajes de contacto.
- Apache dentro de Docker para servir la aplicacion.
- Docker y Docker Compose para levantar el entorno completo.
- Leaflet para el mapa hospitalario.
- Google Maps tiles como capa de mapa base.
- Codex para apoyo en desarrollo, revision y automatizacion, con un uso aproximado del 30%.

## Estructura del proyecto

- `nicasalud.html`: pagina principal.
- `enfermedades.html`: guia de enfermedades.
- `plantas.html`: listado de plantas medicinales.
- `recetas.html`: recetas con plantas.
- `mapa.html`: mapa hospitalario.
- `frontend.js`: logica de busqueda, filtros, calculos y contacto.
- `diseno.css`: estilos globales del sitio.
- `api/contacto.php`: API que guarda mensajes en MySQL.
- `admin/index.php`: panel de administracion.
- `assets/`: imagenes, logo y favicon.
- `db/schema.sql`: esquema de base de datos.
- `db/conexion.php`: conector PHP a MySQL.

## Base de datos

La aplicacion usa la base de datos `nicasalud_contactos` con la tabla `contactos`.

Campos principales:

- `id`
- `nombre`
- `correo`
- `mensaje`
- `pagina_origen`
- `ip_origen`
- `user_agent`
- `created_at`

## Variables de entorno

Configura estas variables si no usas los valores por defecto:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `ADMIN_USER`
- `ADMIN_PASSWORD`

Valores por defecto en Docker:

- Base de datos: `nicasalud_contactos`
- Usuario MySQL: `nicasalud`
- Contrasena MySQL: `nicasalud123`
- Usuario admin: `admin`
- Contrasena admin: `Admin123!`

## Instalacion basica

1. Clona o abre el proyecto en tu equipo.
2. Verifica que tengas Docker y Docker Compose instalados.
3. Asegurate de que el puerto `8080` este libre.
4. Revisa que `db/schema.sql` y `db/conexion.php` esten presentes.
5. Si quieres usar PHP fuera de Docker, asegúrate de tener PHP 8.3 y MySQL 8 o equivalentes compatibles.

## Ejecucion del sistema

### Con Docker

Desde la raiz del proyecto:

```bash
docker compose up -d --build
```

Luego abre:

- Sitio web: `http://127.0.0.1:8080/`
- Admin: `http://127.0.0.1:8080/admin/`

### Sin Docker

Si quieres probar el sitio sin Docker, puedes usar el servidor local incluido:

```powershell
.\start-php-server.ps1 Mas recomendado hacerlo con docker
``` 

Tambien existe `local-server.js`, pero ese servidor solo sirve la parte estatica y no lo ejecuta el PHP.

## Como probar el formulario

El formulario de contacto envia los datos a `api/contacto.php` y guarda el mensaje en MySQL.

## Notas de uso

- El buscador de la pagina principal encuentra texto dentro de la web.
- La seccion de enfermedades y plantas usa filtros y sugerencias en tiempo real.
- El mapa hospitalario requiere Leaflet y carga una capa base externa.
- El panel de administracion permite revisar y borrar mensajes.

## Seguridad

- El panel admin usa sesiones y CSRF.
- El formulario de contacto valida email y recorta campos antes de guardar.
- Se recomienda cambiar las credenciales por defecto en un entorno real.

## Estado actual

El sitio ya esta preparado para correr en Docker y guardar mensajes de contacto en la base de datos, mas adelante pensando en agregarle un servicio plus, por si el usuario tiene alguna duda, con el plus contactarno de manera privada.
