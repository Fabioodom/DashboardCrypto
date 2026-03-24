# CryptoVision Dashboard

> Panel de visualización y análisis de criptomonedas en tiempo real con sistema multiagente

![Versión](https://img.shields.io/badge/version-2.1.0-blue)
![Estado](https://img.shields.io/badge/status-production%20ready-green)

## Descripción

CryptoVision Dashboard es una aplicación web de tipo SPA (Single Page Application) que permite consultar, analizar y monitorizar el mercado de criptomonedas de forma visual, moderna, accesible y responsive. Integra un **sistema multiagente** que proporciona análisis inteligente, alertas personalizadas y asistencia conversacional.

## Quick Start

```bash
# Clonar repositorio
git clone <repo-url>
cd DashboardCrypto

# Abrir en navegador
# Solo necesitas abrir index.html directamente
```

**Credenciales demo:**
- Usuario: `admin`
- Contraseña: `demo123`

## Características

### Funcionalidades Core
- **Dashboard Principal**: Visualización de las principales criptomonedas con precios, cambios y métricas
- **Búsqueda y Filtros**: Búsqueda por nombre/símbolo, ordenación y límites personalizables
- **Vista Detallada**: Información ampliada de cada criptomoneda
- **Favoritos**: Guardado de criptomonedas favoritas con persistencia local
- **Autenticación**: Login simulado con credenciales demo
- **Métricas**: Registro de uso (búsquedas, visualizaciones, errores, tiempo de carga)
- **Diseño Responsive**: Adaptable a dispositivos móviles, tablets y desktop

### Sistema Multiagente (v2.1)
- **MarketAgent**: Analiza datos de mercado y genera señales alcistas, bajistas y de volatilidad
- **AlertAgent**: Gestión de alertas configurables sobre precio y variación porcentual
- **PortfolioAgent**: Análisis inteligente de favoritos con insights automáticos
- **AssistantAgent**: Asistente conversacional basado en comandos de texto
- **OrchestratorAgent**: Coordina la ejecución de todos los agentes

### Paneles de Agentes
- **SignalsPanel**: Panel de señales de mercado (alcistas/bajistas/volátiles)
- **AlertPanel**: Gestión completa de alertas (crear, editar, eliminar, activar/desactivar)
- **PortfolioInsights**: Insights automáticos sobre favoritos
- **AssistantPanel**: Chat flotante para comandos de texto

## Tecnologías

- HTML5 semántico
- CSS3 con variables CSS y diseño mobile-first
- JavaScript ES6+ (sin frameworks)
- API CoinGecko (datos de criptomonedas)

## Estructura del Proyecto

```
/project
  /assets
    /icons          # Iconos y favicon
    /images         # Imágenes estáticas
  /styles          # CSS modular
    reset.css       # Reset de estilos
    variables.css   # Variables CSS
    base.css        # Estilos base
    layout.css      # Estructura
    components.css  # Componentes UI
    responsive.css  # Responsive design
    agents.css      # Estilos de paneles de agentes
  /js
    /api            # Servicios de API
    /auth           # Autenticación
    /agents         # Sistema Multiagente
      agentConfig.js    # Configuración de agentes
      baseAgent.js     # Clase base de agente
      marketAgent.js   # Análisis de mercado
      alertAgent.js    # Gestión de alertas
      portfolioAgent.js # Análisis de favoritos
      assistantAgent.js # Asistente conversacional
      orchestratorAgent.js # Orquestador
      index.js          # Punto de entrada de agentes
    /components     # Componentes UI
      assistantPanel.js # Panel del asistente
      alertPanel.js    # Panel de alertas
      signalsPanel.js  # Panel de señales
      portfolioInsights.js # Insights de portfolio
    /pages          # Vistas
    /state          # Gestión de estado
    /utils          # Utilidades
    main.js         # Punto de entrada
  index.html        # HTML principal
  .env.example      # Variables de entorno
```

## Sistema Multiagente

### Arquitectura

El sistema multiagente sigue un patrón **observe-analyze-decide-act** donde cada agente:

1. **Observa** el contexto y datos disponibles
2. **Analiza** la información según sus reglas
3. **Decide** qué acciones tomar
4. **Actúa** ejecutando las acciones y emitiendo resultados

### Agentes

| Agente | Responsabilidad | Frecuencia |
|--------|----------------|------------|
| MarketAgent | Análisis de mercado, señales | 60s |
| AlertAgent | Evaluación de alertas | 30s |
| PortfolioAgent | Análisis de favoritos | 120s |
| AssistantAgent | Procesamiento de comandos | Bajo demanda |
| OrchestratorAgent | Coordinación central | 30s |

### Comandos del Asistente

El AssistantAgent reconoce los siguientes comandos:

- `"top 5 que suben"` - Ver mejores ganancias
- `"top 5 que bajan"` - Ver peores pérdidas
- `"mayor volumen"` - Ver más traded
- `"resumen mercado"` - Estado general
- `"resumen favoritos"` - Tu portfolio
- `"mejor favorita"` - La que mejor va
- `"peor favorita"` - La que peor va
- `"buscar btc"` - Buscar criptomoneda
- `"ayuda"` - Mostrar comandos

### Persistencia

Los agentes persisten los siguientes datos en localStorage:

| Clave | Contenido |
|-------|-----------|
| `cv_alerts` | Alertas configuradas por el usuario |
| `cv_market_signals_history` | Historial de señales de mercado |
| `cv_portfolio_history` | Historial de análisis de portfolio |
| `cv_assistant_history` | Historial de conversación del asistente |

## Uso

1. Clonar el repositorio
2. Abrir `index.html` en un navegador
3. Credenciales de demo:
   - Usuario: `admin`
   - Contraseña: `demo123`

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Filtros no funcionan | Recargar página e intentar de nuevo |
| Alertas no se guardan | Verificar localStorage disponible |
| Favoritos no persisten | Verificar que el navegador permite localStorage |
| API rate limit | Esperar 1 minuto e intentar de nuevo |

## Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para historial completo de cambios.

## Licencia

MIT License

## API

La aplicación utiliza la API pública de CoinGecko:
- Endpoint: `https://api.coingecko.com/api/v3`
- Rate limit: 10-30 llamadas/minuto
- No requiere API key para uso básico

## Seguridad

- Validación de formularios
- Sanitización de inputs
- Rate limiting integrado
- Manejo de errores robusto
- No expone datos sensibles

## Accesibilidad

- Semántica HTML correcta
-ARIA labels donde corresponde
- Navegación por teclado
- Contraste de colores adecuado
- Focus states visibles

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)