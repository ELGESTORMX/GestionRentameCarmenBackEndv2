Instrucciones para importación de inventario y registros de equipos

Formato CSV esperado:
- id, nombre, categoria, subcategoria, descripcion, precio, estado, fecha_adquisicion, vida_util_meses, ubicacion, imagen

Pasos:
1. Validar encabezados en CSV.
2. Conversión de fechas a ISO.
3. Determinar vida útil si no está: usar valor por defecto según categoría.
4. Subir imágenes a carpeta `uploads/` y guardar la URL relativa en el campo `imagen`.
5. Generar registro de auditoría indicando usuario importador y fecha.

Endpoints sugeridos iniciales:
- POST /api/import/csv -> procesa CSV y crea registros de equipos
- GET /api/equipos -> lista equipos
- POST /api/equipos -> crear equipo
- PUT /api/equipos/:id -> actualizar equipo
- DELETE /api/equipos/:id -> borrar equipo (marcar como inactivo)
