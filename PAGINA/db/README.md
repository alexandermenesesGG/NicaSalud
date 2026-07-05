# Base de datos NicaSalud

1. Importa `schema.sql` en MySQL.
2. Si no usas los valores por defecto, configura estas variables de entorno:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
3. El formulario de contacto envia los datos a `www/api/contacto.php`.
4. Los mensajes quedan guardados en la tabla `contactos`.
5. Para probar el formulario con PHP, ejecuta `start-php-server.ps1` desde la raiz del proyecto.
6. En Docker, el panel de administracion esta en `http://127.0.0.1:8080/admin/`.
7. Credenciales por defecto del panel en Docker:
   - Usuario: `admin`
   - Contrasena: `Admin123!`

Valores por defecto del conector:
- Host: `127.0.0.1`
- Puerto: `3306`
- Usuario: `root`
- Contrasena: vacia
- Base de datos: `nicasalud_contactos`

Si el script avisa que no encontro PHP, instala PHP 8+ o XAMPP y vuelve a ejecutarlo. El sitio quedara disponible en `http://127.0.0.1:8000/`.
