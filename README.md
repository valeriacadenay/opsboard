# OpsBoard

Plataforma de observabilidad y operaciones construida en Angular 21 con arquitectura enterprise, componentes standalone, state management con `@ngrx/signals` y un ecosistema de seguridad, logging y feature toggles listo para entornos regulados.

---

## Descripción del Proyecto
- Aplicación SPA modular con lazy loading por feature (incidents, dashboard, deployments, logs, audit, admin) y layouts compartidos.
- UI bajo Atomic Design (atoms → molecules → organisms → templates) con componentes standalone y signals para inputs/outputs.
- Core transversal con autenticación, guards funcionales, interceptores, manejador global de errores y logger con correlation IDs.
- State management moderno con signal stores, facades para desacoplar presentación de la capa de datos y mappers DTO ↔ dominio para mantener la pureza de modelos internos.

---

## Arquitectura Explicada
- **Feature-first**: cada feature es autónoma (componentes, services, store, routes) y se carga bajo demanda para optimizar bundle y boot time.
- **Smart vs Dumb**: contenedores orquestan negocio y delegan render a componentes presentacionales sin estado ni efectos secundarios.
- **Facade + Signal Store**: los stores encapsulan estado reactivo; las facades exponen una API mínima hacia la UI y reducen acoplamiento.
- **DTOs + Mappers**: separación estricta entre el contrato de API (snake_case) y el dominio (camelCase, tipos ricos) para permitir cambios de backend sin afectar la UI.
- **Cross-cutting en core**: interceptores de auth, correlation-id, normalización de errores y sanitización; guards de auth/roles/feature-flags; logger estructurado.
- **Layouts y shells**: contenedores de navegación (shell, sidenav, topbar) desacoplados de features para mantener consistencia visual.

---

## Árbol de Carpetas (clave)
```
src/
├── app/
│   ├── core/                  # Servicios singleton, guards, interceptores, logging, config
│   ├── features/              # Features con lazy loading (incidents completo, demás listos)
│   ├── layouts/               # Shell, topbar, sidenav
│   └── shared/ui/             # Atomic Design (atoms, molecules, organisms, templates)
├── environments/              # environment.ts | environment.prod.ts
└── main.ts | app.config.ts    # bootstrap + providers globales
```

---

## Cómo correr en desarrollo (Docker)
Usa un contenedor efímero sin necesidad de Dockerfile:

```bash
docker run --rm -it \
	-p 4200:4200 \
	-v "$PWD":/workspace \
	-w /workspace node:22-bookworm \
	sh -c "npm install && npm run start -- --host 0.0.0.0 --port 4200"
```

- El código se monta como volumen, por lo que los cambios en tu host recargan el contenedor.
- Accede en `http://localhost:4200`.
- Si prefieres fuera de Docker: `npm install && npm start`.

---

## Cómo correr en producción
1) Construir artefactos optimizados:
```bash
npm run build -- --configuration production
```

2) Servir el build estático con NGINX (sin crear imagen):
```bash
docker run --rm -p 8080:80 \
	-v "$PWD"/dist/ops-board/browser:/usr/share/nginx/html:ro \
	nginx:1.27-alpine
```

3) Health check local en `http://localhost:8080`.

Para empaquetar en una sola imagen, genera el build y copia `dist/ops-board/browser` dentro de una imagen NGINX o Caddy según tu pipeline.

---

## Decisiones de Seguridad
- **Auth por interceptor**: inyección de JWT en headers y refresh extensible en `core/interceptors/auth.interceptor.ts`.
- **Correlation IDs**: cada request lleva `X-Correlation-ID` para trazabilidad end-to-end.
- **Normalización de errores**: interceptor de errores + `GlobalErrorHandler` para evitar fugas de stack traces al usuario.
- **Guards funcionales**: `authGuard`, `roleGuard`, `featureFlagGuard` controlan acceso por autenticación, rol y flags de rollout.
- **Sanitización**: servicio dedicado en `core/security` para mitigar XSS en inputs renderizados.
- **Principio de mínimo privilegio**: facades y stores exponen solo lecturas necesarias; se evita acceso directo a estado interno.

---

## Decisiones de Arquitectura
- **Standalone + Signals**: sin NgModules, control flow moderno (@if/@for) y inputs/outputs con signals para minimizar boilerplate.
- **Feature-first + lazy**: rutas por feature (`*.routes.ts`) cargadas bajo demanda para mejorar TTI.
- **Facade Pattern**: componentes no conocen la implementación del store ni de servicios; intercambiables y testeables.
- **DTO/Domain Split**: mappers centralizados protegen la UI de cambios de contrato backend.
- **Observabilidad**: logger estructurado con niveles (DEBUG→FATAL) y soporte de correlation ID listo para enviarse a backends de logging.
- **Configuración tipada**: `ConfigService` unifica acceso a settings y endpoints; ambientes separados en `environments/`.

---

## Cómo integrar un backend real (futuro)
1) **Configurar endpoints**: define `apiBaseUrl` en `environment*.ts`; inyecta `ConfigService` en servicios HTTP.
2) **Servicios HTTP por feature**: expande `incidents-api.service.ts` y crea servicios equivalentes para dashboard/deployments/logs/audit/admin.
3) **Autenticación**: conecta `auth.service.ts` a tu IdP (OIDC/JWT). Ajusta el interceptor para refresh y manejo de 401/403.
4) **Errores y dominio**: mapea códigos/shape de error del backend en el interceptor de normalización y en los mappers DTO ↔ dominio.
5) **Feature flags**: alinear `featureFlagGuard` a un proveedor de flags (p.ej. LaunchDarkly) o un endpoint de configuración.
6) **Telemetría**: envía logs y correlation IDs a tu stack (ELK, OpenTelemetry, Datadog) desde el logger/handler central.

---

## Comandos útiles
- Desarrollo local: `npm start`
- Linting: `ng lint`
- Unit tests (Vitest): `npm test`
- Build producción: `npm run build -- --configuration production`

---

## Recursos adicionales
- Arquitectura detallada: ver `ARCHITECTURE.md`
- Resumen ejecutivo: ver `SUMMARY.md`
- Guía rápida de comandos: ver `QUICK-START.md`
