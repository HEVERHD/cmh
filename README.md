# Club Mercancías Web

Sistema web para la gestión integral de Club de Mercancías, diseñado para administrar clubes de clientes, beneficios exclusivos, productos y seguimiento de pagos.

## Características principales

- **Gestión de Clubes**: Crear y administrar clubes con diferentes tipos y denominaciones
- **Administración de Clientes**: Búsqueda y gestión de clientes asociados a clubes
- **Gestión de Beneficios**: Configuración de beneficios y ventajas para miembros
- **Catálogo de Productos**: Administración de productos y precios especiales
- **Formas de Pago**: Gestión de métodos de pago por club
- **Reportes**: Generación de reportes y análisis de clubes
- **Gestión de Usuarios**: Administración de usuarios del sistema
- **Configuración**: Panel de configuración general del sistema

## Stack tecnológico

- **Frontend**: Next.js 16 (App Router) + React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **Componentes UI**: Radix UI + shadcn/ui
- **Formularios**: React Hook Form + Zod
- **Estado**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Calendario**: React Big Calendar
- **Notificaciones**: Sonner
- **Autenticación**: JWT + js-cookie

## Requisitos

- Node.js 20+
- npm o pnpm

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` en la raíz del proyecto con las variables necesarias:

```env
# Ejemplo de variables de entorno
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=Club Mercancías
```

## Desarrollo

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

El proyecto se ejecutará en [http://localhost:3000](http://localhost:3000)

## Build

Para crear una versión de producción:

```bash
npm run build
npm start
```

## Estructura del proyecto

```
src/
├── app/              # App Router (Next.js 16)
│   ├── (dashboard)/  # Rutas del dashboard
│   │   ├── beneficios/
│   │   ├── clubes/
│   │   ├── configuracion/
│   │   ├── precios-especiales/
│   │   ├── productos/
│   │   ├── reportes/
│   │   └── usuarios/
│   └── login/        # Autenticación
├── components/       # Componentes React
│   ├── clubes/       # Componentes de clubes
│   ├── clientes/     # Componentes de clientes
│   ├── shared/       # Componentes compartidos
│   └── ui/           # Componentes UI (shadcn)
├── services/         # Servicios y API calls
├── stores/           # Estado global (Zustand)
├── types/            # Tipos TypeScript
├── lib/              # Utilidades y hooks
└── constants/        # Constantes de la aplicación
```

## Características técnicas

- ✅ TypeScript estricto para type safety
- ✅ Validación de formularios con Zod
- ✅ Gestión de estado eficiente con Zustand
- ✅ Cache y sincronización con React Query
- ✅ UI moderna y accesible con Radix UI
- ✅ Diseño responsive con Tailwind CSS
- ✅ Optimización de compilación con React Compiler

## Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Crea el build de producción
- `npm start` - Inicia el servidor de producción

## Contribuir

Para contribuir al proyecto, sigue estos pasos:

1. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
2. Realiza tus cambios y commits (`git commit -m 'Agregar nueva funcionalidad'`)
3. Push a la rama (`git push origin feature/nueva-funcionalidad`)
4. Crea un Pull Request

## Desarrolladores

- **Nohelia Rivera** - Desarrollador principal
- **Hevert Gelis** - Desarrollador de apoyo

## Licencia

Este proyecto es privado y de uso interno.
