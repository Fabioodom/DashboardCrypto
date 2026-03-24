# CHANGELOG.md

All notable changes to this project will be documented in this file.

## [2.1.0] - 2026-03-24

### Fixed
- **Login visibility**: Corregido problema de visibilidad de vistas durante navegación
- **AlertPanel events**: Corregido binding de eventos del formulario de alertas (submit, Enter key)
- **Filters/SearchBar**: Corregida inicialización tardía que causaba que los filtros no funcionaran
- **Favorites**: Corregido toggle de favoritos con classList nativo
- **Panel initialization**: Corregido timing de inicialización de paneles (solo al mostrar vista)
- **Formatters**: Añadidos métodos `formatCurrency` y `formatNumber`
- **DOM utilities**: Añadido método `toggle()` a la utilidad DOM

### Changed
- `SearchBar.init()` movido de `DashboardPage.init()` a `DashboardPage.show()` para asegurar DOM disponible
- `DashboardPage.show()` ahora inicializa SearchBar, SignalsPanel y AlertPanel en orden correcto
- `AlertPanel.bindEvents()` mejorado con múltiples handlers (onclick, onsubmit, keydown)
- `CryptoCard.toggleFavorite()` usa classList nativo para mejor compatibilidad

### Technical
- Añadido flag `isInitialized` a SearchBar con check en init()
- Mejorado manejo de nulos en event handlers de AlertPanel
- Refactorizado flujo de navegación de vistas

---

## [2.0.0] - 2026-03-24

### Added
- **Sistema Multiagente** - Nueva arquitectura de agentes funcionales integrados en el front-end
  - `MarketAgent`: Análisis de mercado y generación de señales (alcistas, bajistas, volátiles)
  - `AlertAgent`: Gestión de alertas configurables por usuario con persistencia
  - `PortfolioAgent`: Análisis inteligente de favoritos con insights automáticos
  - `AssistantAgent`: Asistente conversacional basado en reglas con parser de intents
  - `OrchestratorAgent`: Coordinador central de todos los agentes
- **Panel de Señales** - UI para visualizar señales del mercado generadas por MarketAgent
- **Panel de Alertas** - Gestión completa de alertas (crear, editar, eliminar, activar/desactivar)
- **Panel de Portfolio** - Resumen inteligente con métricas e insights de favoritos
- **Asistente Virtual** - Chat flotante para comandos de texto
- **Métricas de Agentes** - Registro de ejecuciones, errores y eventos de cada agente
- **Persistencia de Agentes** - Historial de señales, alertas, portfolio y conversación del asistente

### Technical
- Nueva carpeta `/js/agents/` con arquitectura modular de agentes
- Clase `BaseAgent` como clase base con patrón observe-analyze-decide-act
- Sistema de eventos para comunicación entre agentes
- Integración con Store, Storage, Metrics y Toast existentes
- CSS específico para componentes de agentes (`styles/agents.css`)

### Changed
- `main.js`: Inicialización del sistema multiagente
- `dashboardPage.js`: Integración de SignalsPanel y AlertPanel
- `favoritesPage.js`: Integración de PortfolioInsights
- `constants.js`: Nuevas claves de storage para agentes
- `metrics.js`: Nuevas métricas para agentes

---

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

### [2.2.0] - Planned
- Gráficos de precios (Chart.js)
- Historial de búsquedas
- Modo oscuro/claro
- Notificaciones push

### [3.0.0] - Planned
- Backend con autenticación real
- Base de datos de usuarios
- API REST propia
- Tests automatizados
- PWA
- Integración con LLM para asistente

---

## Formato de Changelog

Este CHANGELOG sigue el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

- **Added**: Nuevas funcionalidades
- **Changed**: Cambios en funcionalidades existentes
- **Deprecated**: Funcionalidades que se eliminarán en futuras versiones
- **Removed**: Funcionalidades eliminadas
- **Fixed**: Corrección de errores
- **Security**: Correcciones de seguridad