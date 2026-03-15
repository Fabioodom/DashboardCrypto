# CryptoVision Dashboard

> Panel de visualización y análisis de criptomonedas en tiempo real

## Descripción

CryptoVision Dashboard es una aplicación web de tipo SPA (Single Page Application) que permite consultar, analizar y monitorizar el mercado de criptomonedas de forma visual, moderna, accesible y responsive.

## Características

- **Dashboard Principal**: Visualización de las principales criptomonedas con precios, cambios y métricas
- **Búsqueda y Filtros**: Búsqueda por nombre/símbolo, ordenación y límites personalizables
- **Vista Detallada**: Información ampliada de cada criptomoneda
- **Favoritos**: Guardado de criptomonedas favoritas con persistencia local
- **Autenticación**: Login simulado con credenciales demo
- **Métricas**: Registro de uso (búsquedas, visualizaciones, errores, tiempo de carga)
- **Diseño Responsive**: Adaptable a dispositivos móviles, tablets y desktop

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
  /js
    /api            # Servicios de API
    /auth           # Autenticación
    /components     # Componentes UI
    /pages          # Vistas
    /state          # Gestión de estado
    /utils          # Utilidades
    main.js         # Punto de entrada
  index.html        # HTML principal
  .env.example      # Variables de entorno
```

## Uso

1. Clonar el repositorio
2. Abrir `index.html` en un navegador
3. Credenciales de demo:
   - Usuario: `admin`
   - Contraseña: `demo123`

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

## Licencia

MIT License