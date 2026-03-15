# QA Checklist - CryptoVision Dashboard

## Funcionalidad

- [ ] Login funciona con credenciales demo (admin/demo123)
- [ ] Error mostrado con credenciales incorrectas
- [ ] Sesión persiste tras recargar página
- [ ] Logout cierra sesión correctamente
- [ ] Dashboard carga lista de criptomonedas
- [ ] Búsqueda filtra resultados correctamente
- [ ] Filtros de ordenación funcionan (market cap, precio, cambio)
- [ ] Selector de límite funciona (10, 25, 50, 100)
- [ ] Click en tarjeta navega a vista detalle
- [ ] Botón favorito añade/quita correctamente
- [ ] Favoritos persisten tras recargar
- [ ] Vista favoritos muestra todas las guardadas
- [ ] Botón volver funciona en vista detalle
- [ ] Rate limit implementado y funcional

## UI/UX

- [ ] Estilos cargados correctamente
- [ ] Colores aplicados según diseño
- [ ] Tipografía legible
- [ ] Espaciado consistente
- [ ] Tarjetas tienen hover states
- [ ] Botones tienen estados active/hover
- [ ] Loading spinner visible durante cargas
- [ ] Mensajes de error visibles
- [ ] Toast notifications aparecen correctamente

## Responsive

- [ ] Mobile: Menú hamburguesa funcional
- [ ] Mobile: Grid de tarjetas en 1 columna
- [ ] Tablet: Grid de 2 columnas
- [ ] Desktop: Grid de 4 columnas
- [ ] Formularios adaptan bien a diferentes anchos

## Accesibilidad

- [ ] Navegación por teclado funciona
- [ ] Focus states visibles
- [ ] Labels en todos los formularios
- [ ] ARIA labels en botones iconos
- [ ] Semántica HTML correcta (headings, sections)
- [ ] Alternativas textuales en imágenes

## Seguridad

- [ ] Validación de formularios activa
- [ ] Inputs sanitizados
- [ ] No exponen API keys
- [ ] Errores no revelan información sensible

## Errores

- [ ] Fallo de red muestra mensaje adecuado
- [ ] Rate limit muestra mensaje de espera
- [ ] Sin resultados muestra estado vacío
- [ ] Error de servidor muestra feedback

## Rendimiento

- [ ] Tiempo de carga aceptable
- [ ] Imágenes lazy loaded
- [ ] Cache funciona correctamente

## Documentación

- [ ] README.md completo
- [ ] MEMORY.md actualizado
- [ ] CHANGELOG.md creado
- [ ] .env.example presente
- [ ] Código comentarios donde aporta valor