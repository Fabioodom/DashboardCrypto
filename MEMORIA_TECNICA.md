# Memoria Técnica - CryptoVision Dashboard

---

## 1. Introducción

El presente documento describe el desarrollo completo de **CryptoVision Dashboard**, una aplicación web SPA (Single Page Application) para el análisis y visualización de criptomonedas. El proyecto fue desarrollado utilizando exclusivamente HTML, CSS y JavaScript vanilla, siguiendo una metodología de desarrollo basada en agentes especializados dentro de la plataforma Opencode.

## 2. Objetivo del Proyecto

El objetivo principal fue construir una aplicación web funcional que permita:
- Consultar precios y datos de mercado de criptomonedas
- Analizar tendencias mediante filtros y ordenaciones
- Monitorizar activos favoritos
- Gestionar autenticación de usuarios (simulada)

## 3. Tecnologías Utilizadas

### Front-end
- **HTML5**: Semántico, con meta tags SEO y accesibilidad
- **CSS3**: Variables CSS, flexbox, grid, animaciones, responsive
- **JavaScript ES6+**: Módulos IIFE, async/await, patrones de diseño

### APIs y Servicios
- **CoinGecko API**: Datos de criptomonedas (público, sin key)
- **localStorage**: Persistencia de sesión, favoritos, métricas

### Herramientas
- Opencode (desarrollo con agentes)
- Git (control de versiones)
- Navegadores modernos (Chrome, Firefox, Safari, Edge)

## 4. Descripción de la Aplicación

### 4.1 Funcionalidades Principales

| Módulo | Funcionalidad |
|--------|---------------|
| **Login** | Autenticación simulada, validación, persistencia |
| **Dashboard** | Grid de criptomonedas, búsqueda, filtros, métricas |
| **Detalle** | Información ampliada, datos de mercado, enlaces |
| **Favoritos** | Gestión de favoritos con localStorage |
| **Métricas** | Registro de uso, errores, rendimiento |

### 4.2 Arquitectura de Componentes

```
/js
├── /api          → CryptoService, ApiConfig
├── /auth         → AuthService, AuthGuard
├── /components   → Header, CryptoCard, SearchBar, Toast
├── /pages        → LoginPage, DashboardPage, DetailPage, FavoritesPage
├── /state        → Store (gestión de estado global)
├── /utils        → DOM, Formatters, Validators, Storage, Metrics, etc.
└── main.js       → Punto de entrada
```

## 5. Justificación de la Temática

El mercado de criptomonedas representa un sector en constante evolución con alta demanda de herramientas de visualización. La elección de un dashboard de criptomonedas permite:
- Demostrar consumo de APIs externas
- Working con datos dinámicos y complejos
- Implementar patrones de diseño apropiados para dashboards financieros

## 6. Arquitectura del Proyecto

### 6.1 Estructura de Carpetas

```
/DashboardCrypto
├── /assets
│   └── /icons         → favicon.svg
├── /styles
│   ├── reset.css      → Reset de estilos
│   ├── variables.css  → Variables CSS
│   ├── base.css       → Estilos base
│   ├── layout.css     → Estructura
│   ├── components.css → Componentes UI
│   └── responsive.css → Diseño responsive
├── /js
│   ├── /api           → Servicios de API
│   ├── /auth          → Autenticación
│   ├── /components    → Componentes
│   ├── /pages         → Vistas
│   ├── /state         → Estado
│   └── /utils         → Utilidades
├── index.html         → HTML principal
├── .env.example       → Variables de entorno
├── README.md          → Documentación
├── MEMORY.md          → Trazabilidad
├── CHANGELOG.md       → Historial de cambios
└── QA_CHECKLIST.md   → Verificaciones
```

### 6.2 Patrones de Diseño

- **IIFE**: Para encapsulación de módulos
- **Module Pattern**: Cada archivo es un módulo independiente
- **Observer**: Para gestión de estado reactivo (Store)
- **Factory**: Para creación de componentes (CryptoCard.create)
- **Singleton**: Para servicios globales (Toast, Metrics)

## 7. Agentes Definidos

| Agente | Responsabilidad | Justificación |
|--------|----------------|---------------|
| **Arquitecto** | Diseño de estructura, módulos, patrones | Define el esqueleto del proyecto |
| **Investigador/API** | Evalúa y selecciona API de criptomonedas | Necesario para consumir datos externos |
| **UI/UX Designer** | Diseño visual, componentes, accesibilidad | Define la experiencia del usuario |
| **Implementador JS** | Desarrollo de módulos JavaScript | Construye la lógica de negocio |
| **Security/QA** | Revisa vulnerabilidades, testing | Garantiza calidad y seguridad |
| **Documentation** | Registra evolución y decisiones | Crea documentación académica |
| **Reviewer** | Verifica cumplimiento de requisitos | Asegura calidad final |

### 7.1 Flujo de Comunicación

```
Arquitecto → Investigador/API → UI/UX → Implementador → Security/QA → Documentation → Reviewer
     ↑                    ↑            ↑           ↑              ↑            ↑
     └────────────────────┴────────────┴────────────┴──────────────┴────────────┘
                                          │
                                    Iteración
```

## 8. Skills y Modelos Utilizados

- **Opencode**: Plataforma de desarrollo multiagente
- **Modelo de lenguaje**: Para generación de código y documentación
- **Búsqueda web**: Para investigación de APIs alternativas
- **Glob/Grep**: Para navegación del codebase

## 9. Metodología de Trabajo

### Fases Implementadas

1. **Fase 1**: Definición de agentes, arquitectura, selección API
2. **Fase 2**: Estructura de carpetas y archivos base
3. **Fase 3**: Autenticación mock y navegación
4. **Fase 4**: Integración API CoinGecko y servicios
5. **Fase 5**: Desarrollo del dashboard principal
6. **Fase 6**: Búsqueda, filtros y favoritos
7. **Fase 7**: Vista detalle de criptomoneda
8. **Fase 8**: Métricas, errores y validaciones
9. **Fase 9**: QA, accesibilidad, responsive, SEO
10. **Fase 10**: Documentación final y revisión

## 10. Problemas Encontrados y Soluciones

| Problema | Solución |
|----------|----------|
| Rate limiting de API | Implementado RateLimiter con cola de espera |
| Datos no persistentes | Cache en memoria con TTL de 5 minutos |
| Validación dispersada | Módulo Validators centralizado |
| Sesiones inseguras | Expiración de 24h y almacenamiento limitado |
| Login visibility | Corregido hide/show de vistas en navegación SPA |
| AlertPanel events | Mejorado binding con múltiples handlers (onclick, onsubmit) |
| SearchBar init timing | Movido init() de DashboardPage.init() a DashboardPage.show() |
| Favorites toggle | Cambiado a classList nativo para mejor compatibilidad |
| Panel initialization | isInitialized flag para evitar duplicación |

## 10.1 Problemas v2.0 - Sistema Multiagente

| Problema | Solución |
|----------|----------|
| SignalsPanel no actualizaba | Inicialización correcta desde DashboardPage.show() |
| AlertPanel form no respondía | onsubmit handler con preventDefault + Enter key support |
| Missing Formatters methods | Añadidos formatCurrency y formatNumber |
| Missing DOM.toggle() | Añadido método toggle() a utils/dom.js |
| SearchBar init en página oculta | init() solo al mostrar vista, no al cargar página |

## 11. Decisiones Técnicas

1. **Vanilla JS vs Frameworks**: Para demostrar conocimiento de JS puro
2. **CoinGecko vs otras**: No requiere key, datos completos, rate limit aceptable
3. **CSS modular vs único**: Mantenibilidad y escalabilidad
4. **localStorage vs cookies**: Simplicidad y seguridad para demo

## 12. Seguridad y Buenas Prácticas

- ✅ Validación de formularios con feedback visual
- ✅ Sanitización de inputs de usuario
- ✅ Rate limiting integrado (10 calls/60s)
- ✅ Manejo de errores centralizado
- ✅ No exposición de datos sensibles
- ✅ Contraseña no almacenada en localStorage
- ✅ Sesiones con expiración

## 13. Accesibilidad, Responsive y UX

### Accesibilidad
- HTML semántico con landmark roles
- Labels en todos los campos de formulario
- ARIA labels en botones iconográficos
- Navegación por teclado completa
- Estados de focus visibles
- Contraste de colores AA

### Responsive
- Mobile-first con breakpoints: 480px, 768px, 1024px, 1400px
- Grid adaptativo (1-4 columnas)
- Menú hamburguesa en móvil
- Formularios adaptables

### UX
- Loading states con spinner
- Feedback visual en acciones (toast)
- Estados vacío y error claros
- Animaciones suaves (fade, slide)
- Diseño consistente con variables CSS

## 14. SEO y Rendimiento

### SEO
- Meta tags: description, keywords, author, theme-color
- Title descriptivo
- Estructura semántica (header, main, nav, section)
- Imágenes con alt
- Heading hierarchy coherente

### Rendimiento
- Imágenes lazy loaded
- Cache en memoria
- CSS minimizado y modular
- JS cargas incremental
- Tiempo de carga registrado en métricas

## 15. Gestión de API, Entorno y Rate Limit

### API CoinGecko
- Endpoint base: `https://api.coingecko.com/api/v3`
- Endpoints usados: `/coins/markets`, `/coins/{id}`, `/search`
- Sin API key necesaria para uso básico
- Rate limit: 10-30 calls/min

### Rate Limiter
- Configurable: 10 llamadas por ventana de 60s
- Cola de espera automática
- Estado visible en consola

### Variables de Entorno
- `.env.example` documentado
- No hay secrets reales en el código
- Configuración centralizada en constants.js

## 16. Validaciones y Manejo de Errores

### Validaciones
- Required, minLength, email, username, password
- Validación de coin IDs
- Validación de formularios completa

### Manejo de Errores
- ErrorHandler centralizado
- Tipos de error: NETWORK, PARSE, RATE_LIMIT, NOT_FOUND, SERVER, AUTH
- Retry automático (3 intentos, backoff exponencial)
- Mensajes amigables al usuario

## 17. Métricas Implementadas

| Métrica | Descripción |
|---------|-------------|
| searches | Número de búsquedas realizadas |
| details_viewed | Visitas a detalles de moneda |
| favorites_added | Favoritos guardados |
| errors | Errores encontrados |
| api_calls | Llamadas a la API |
| pageLoadTime | Tiempo de carga inicial |

## 18. Resultado Final

✅ Aplicación web funcional y completa
✅ Diseño visual moderno y profesional
✅ Código limpio, modular y mantenible
✅ Documentación exhaustiva
✅ Metodología de desarrollo con agentes demostrada

## 19. Conclusiones

El proyecto ha permitido demostrar:
- Capacidad de desarrollo front-end con vanilla JS
- Arquitectura modular y escalable
- Integración con APIs externas
- Implementación de patrones de diseño
- Focus en seguridad, accesibilidad y rendimiento

## 20. Sistema Multiagente v2.1

### 20.1 Justificación y Evolución

El sistema multiagente se implementó para evolucionar el dashboard de una simple herramienta de visualización a una **aplicación inteligente** que:
- Automatiza el análisis de mercado
- Genera señales procesables sin intervención del usuario
- Proporciona alertas personalizadas
- Ofrece insights automáticos sobre el portfolio del usuario
- Responde a comandos de texto de forma conversacional

### 20.2 Definición de Agente (v2.1)

Un **agente** es un módulo autónomo especializado que:
1. Recibe contexto y datos del sistema
2. Observa el estado del mercado o aplicación
3. Aplica reglas o lógica propia
4. Toma decisiones dentro de su dominio
5. Ejecuta acciones concretas sin programación manual

### 20.3 Agentes Implementados

#### MarketAgent
- **Responsabilidad**: Analizar datos de mercado, detectar oportunidades, generar señales
- **Reglas**:
  - Bullish: cambio > 4% y volumen alto
  - Bearish: cambio < -5%
  - Volatile: cambio absoluto > 8%
  - High-interest: volumen alto + market cap alto + cambio positivo
- **Salidas**: Array de señales categorizadas, resumen de sentimiento del mercado

#### AlertAgent
- **Responsabilidad**: Gestionar alertas configurables por el usuario
- **Tipos de alerta**: Precio sobrevalor, precio bajo valor, % ganancia, % pérdida
- **Persistencia**: localStorage con clave `cv_alerts`
- **Salidas**: Alertas disparadas, notificaciones toast

#### PortfolioAgent
- **Responsabilidad**: Analizar favoritos, generar insights, resumir portfolio
- **Métricas**: Mejor/peor activo, cambio promedio, distribución positiva/negativa, volatilidad
- **Insights generados**: Oportunidades, warnings, tendencias, distribución
- **Persistencia**: localStorage con clave `cv_portfolio_history`

#### AssistantAgent
- **Responsabilidad**: Procesar comandos de texto, transformar en acciones
- **Parser**: Basado en keywords y sinónimos
- **Intents**: top_subidas, top_bajadas, mayor_volumen, resumen_mercado, etc.
- **No usa LLM**: Primera versión 100% basada en reglas deterministas

#### OrchestratorAgent
- **Responsabilidad**: Coordinar ejecución de agentes, distribuir datos, recoger resultados
- **Eventos**: Subscribe a cambios de Store, ejecutar agentes periódicamente
- **Tolerancia**: Manejo de errores en cada agente individual

### 20.4 Arquitectura Técnica

```
BaseAgent (clase abstracta)
    ├── observe()
    ├── analyze()
    ├── decide()
    ├── act()
    ├── run()
    ├── on/emit (eventos)
    └── _createResult()

MarketAgent → extend BaseAgent
AlertAgent → extend BaseAgent
PortfolioAgent → extend BaseAgent
AssistantAgent → extend BaseAgent
OrchestratorAgent → extend BaseAgent
```

### 20.5 Integración con Módulos Existentes

| Módulo | Integración |
|--------|-------------|
| Store | Subscribe a cambios, leer coins/favorites |
| CryptoService | Obtener datos de mercado |
| Storage | Persistencia de alertas y historial |
| Toast | Notificaciones de alertas disparadas |
| Metrics | Registrar ejecuciones y errores de agentes |
| Router | Navegación desde comandos del asistente |
| DashboardPage | Panel de señales |
| FavoritesPage | Panel de insights |

### 20.6 UI de Agentes

- **SignalsPanel**: Muestra señales del mercado en dashboard
- **AlertPanel**: Gestión completa de alertas (crear/editar/eliminar)
- **PortfolioInsights**: Resumen inteligente en favoritos
- **AssistantPanel**: Chat flotante para comandos

### 20.7 Métricas de Agentes

```javascript
agent_marketagent_executions
agent_marketagent_errors
agent_alertagent_executions
agent_alertagent_errors
agent_portfolioagent_executions
agent_portfolioagent_errors
agent_assistantagent_executions
agent_assistantagent_errors
alerts_created
alerts_removed
alerts_triggered
assistant_queries
orchestrator_started
orchestrator_stopped
```

### 20.8 Integración y Debugging

Durante la integración del sistema multiagente se encontraron y corrigieron los siguientes problemas:

1. **Login Visibility Issue**: Las vistas no se ocultaban correctamente durante la navegación. Solución: Mejora en hide/show de vistas en Router.

2. **AlertPanel Event Binding**: Los eventos del formulario no se bindeaban porque el panel se creaba dinámicamente antes de estar visible. Solución: Múltiples handlers (onclick, onsubmit) y Enter key support.

3. **SearchBar Initialization**: SearchBar.init() se llamaba en DashboardPage.init() cuando los elementos DOM aún no estaban visibles. Solución: Mover init() a DashboardPage.show().

4. **Panel Initialization Timing**: Los paneles se inicializaban múltiples veces. Solución: Añadir flag isInitialized y verificar antes de init().

5. **SignalsPanel Not Updating**: Dipendía del Orchestrator que no proporcionaba datos correctamente. Solución: Llamar updateWithCoins() directamente desde DashboardPage.loadCoins().

6. **Missing Formatters Methods**: formatCurrency y formatNumber no existían. Solución: Añadir ambos métodos a formatters.js.

7. **DOM.toggle() Missing**: El método toggle() no existía en utils/dom.js. Solución: Implementar método con soporte para show/hide/toggle.

8. **CryptoCard Favorites**: Usaba DOM.addClass/removeClass que podían fallar. Solución: Cambiar a classList nativo.

### 20.9 Flujo de Integración Final

```
main.js
  ├─ DashboardPage.init() → cacheElements()
  ├─ Router.init() → setupRoutes()
  └─ Agents.init() → OrchestratorAgent.start()

Router.navigate(dashboard)
  └─ DashboardPage.show()
      ├─ SearchBar.init() [solo si no está inicializado]
      ├─ SignalsPanel.init() [crea DOM si no existe]
      ├─ AlertPanel.init() [crea DOM si no existe]
      └─ loadCoins()
          ├─ CryptoService.fetchCoins()
          ├─ renderCoins() → CryptoCard.create() × N
          ├─ SignalsPanel.updateWithCoins() [actualiza señales]
          └─ updateStats()
```

### 20.10 Persistencia de Datos de Agentes

| Clave localStorage | Contenido | Formato |
|-------------------|-----------|---------|
| `cv_alerts` | Alertas configuradas | JSON Array |
| `cv_market_signals_history` | Historial de señales | JSON Array |
| `cv_portfolio_history` | Historial de análisis | JSON Array |
| `cv_assistant_history` | Conversación asistente | JSON Array |

## 21. Mejoras Futuras

1. **Gráficos de precios**: Integración con Chart.js
2. **Historial de búsquedas**: Persistencia de búsquedas recientes
3. **Modo oscuro**: Theme switching
4. **Backend**: Autenticación real con JWT
5. **PWA**: Service workers para offline
6. **Testing**: Jest para unit tests
7. **Build**: Webpack o Vite para producción
8. **LLM Assistant**: Integración opcional con API de OpenAI para respuestas más naturales
9. **Notificaciones push**: Web Push API para alertas fuera de la app
10. **Backtesting**: Simulación histórica de estrategias basadas en señales

---

## Anexo: Prompts Destacados

### Definición de agentes (v1)
```
Define 8 agentes especializados para un proyecto de dashboard de criptomonedas...
```

### Investigación API
```
Investiga las mejores APIs públicas de criptomonedas, compara CoinGecko, CoinCap y CryptoCompare...
```

### Arquitectura
```
Diseña una arquitectura modular para una SPA de criptomonedas con HTML, CSS y JS vanilla...
```

### Sistema Multiagente (v2)
```
Quiero que actúes como un equipo de ingeniería de software multiagente...
```

---

**Proyecto desarrollado con Opencode y metodología multiagente**
**Fecha: Marzo 2026**
**Versión: 2.1.0 - Sistema Multiagente Estabilizado**