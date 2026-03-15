# CHANGELOG.md

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-03-15

### Added
- **Estructura completa del proyecto** - HTML, CSS modular, JavaScript separado
- **Sistema de diseño CSS** - Variables, reset, base, layout, componentes, responsive
- **API CoinGecko** - Integración completa con caché y rate limiting
- **Autenticación simulada** - Login, logout, sesión persistida, guard de rutas
- **Dashboard principal** - Grid de criptomonedas con búsqueda y filtros
- **Vista detalle** - Información ampliada de cada criptomoneda
- **Favoritos** - Añadir/quitar con persistencia localStorage
- **Métricas** - Registros de uso, tiempo de carga, errores
- **Manejo de errores** - Centralizado con retry y mensajes amigables
- **Toast notifications** - Sistema de notificaciones
- **Documentación completa** - README, MEMORY, CHANGELOG, .env.example
- **Accesibilidad** - ARIA labels, navegación por teclado, semántica HTML
- **SEO básico** - Meta tags, estructura semántica

### Technical
- Arquitectura SPA vanilla JS
- CSS modular con variables CSS
- Patrón módulo IIFE
- Rate limiter configurable (10 calls/60s)
- Cache en memoria con TTL 5 min

### Security
- Validación de formularios
- Sanitización de inputs
- No exposición de datos sensibles
- Rate limiting integrado

---

## Versiones Futuras (Propuestas)

### [1.1.0] - Planned
- Gráficos de precios (Chart.js)
- Historial de búsquedas
- Modo oscuro/claro

### [2.0.0] - Planned
- Backend con autenticación real
- Base de datos de usuarios
- API REST propia
- Tests automatizados
- PWA

---

## Formato de Changelog

Este CHANGELOG sigue el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

- **Added**: Nuevas funcionalidades
- **Changed**: Cambios en funcionalidades existentes
- **Deprecated**: Funcionalidades que se eliminarán en futuras versiones
- **Removed**: Funcionalidades eliminadas
- **Fixed**: Corrección de errores
- **Security**: Correcciones de seguridad