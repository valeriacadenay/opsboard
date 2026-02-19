# 🛠️ Guía Rápida de Comandos - OpsBoard

## 🚀 Inicio Rápido

### Instalar Dependencias
```bash
npm install
```

### Iniciar Desarrollo
```bash
npm start
# O
ng serve
```

### Build Producción
```bash
npm run build
# O
ng build --configuration production
```

---

## 🔧 Resolver Errores de TypeScript

### ⚠️ Error: "Cannot find module"

**Causa**: Caché de TypeScript desactualizado

**Solución 1**: Reiniciar TypeScript Server
1. Abrir Command Palette: `Ctrl+Shift+P` (Windows/Linux) o `Cmd+Shift+P` (Mac)
2. Buscar: `TypeScript: Restart TS Server`
3. Enter

**Solución 2**: Reiniciar VS Code
```bash
# Cerrar y volver a abrir VS Code
```

**Solución 3**: Limpiar y Rebuild
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar caché de Angular
rm -rf .angular
```

---

## 📦 Gestión de Dependencias

### Ver Dependencias Instaladas
```bash
npm list --depth=0
```

### Actualizar Angular
```bash
ng update @angular/core @angular/cli
```

### Actualizar NgRx
```bash
ng update @ngrx/signals @ngrx/store
```

### Instalar Dependencia
```bash
npm install nombre-paquete
```

---

## 🧪 Testing

### Ejecutar Tests
```bash
npm test
# O
ng test
```

### Tests con Coverage
```bash
ng test --code-coverage
```

### Tests de un Solo Archivo
```bash
ng test --include='**/incidents.store.spec.ts'
```

---

## 🏗️ Generación de Código

### Generar Nueva Feature
```bash
# Crear carpetas manualmente siguiendo estructura:
mkdir -p src/app/features/nueva-feature/{components,models,services,store,mappers}
```

### Generar Component
```bash
ng generate component features/nueva-feature/components/nuevo-componente --standalone
```

### Generar Service
```bash
ng generate service features/nueva-feature/services/nuevo-servicio
```

### Generar Guard
```bash
ng generate guard core/guards/nuevo-guard --functional
```

### Generar Interceptor
```bash
ng generate interceptor core/interceptors/nuevo-interceptor --functional
```

---

## 🔍 Debugging

### Ver Logs de la Aplicación
```typescript
// En Chrome DevTools Console:
// Los logs aparecerán automáticamente con el formato:
// [timestamp][correlationId] message
```

### Ver Errores HTTP
```bash
# Abrir Network tab en DevTools
# Los errores HTTP serán interceptados y logueados automáticamente
```

### Debug en VS Code
1. Agregar breakpoint en código
2. F5 para iniciar debug
3. Seleccionar "Chrome" o "Edge"

---

## 📊 Análisis de Código

### Lint
```bash
ng lint
```

### Format
```bash
npx prettier --write "src/**/*.ts"
```

### Bundle Analyzer
```bash
npm install -D webpack-bundle-analyzer
ng build --stats-json
npx webpack-bundle-analyzer dist/ops-board/browser/stats.json
```

---

## 🚢 Deployment

### Build Producción
```bash
ng build --configuration production
```

### Build con Source Maps
```bash
ng build --configuration production --source-map
```

### Verificar Build
```bash
ls -lh dist/ops-board/browser/
```

### Servir Build Localmente
```bash
npx http-server dist/ops-board/browser -p 8080
```

---

## 🔐 Configuración de Interceptors

### Agregar a app.config.ts

```typescript
import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { GlobalErrorHandler } from './core/error/global-error.handler';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { correlationIdInterceptor } from './core/interceptors/correlation-id.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        correlationIdInterceptor,
        httpErrorInterceptor
      ])
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
```

---

## 🛣️ Configuración de Lazy Loading

### Agregar a app.routes.ts

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'incidents',
    loadChildren: () => import('./features/incidents/incidents.routes')
      .then(m => m.INCIDENTS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes')
      .then(m => m.DASHBOARD_ROUTES),
    canActivate: [authGuard]
  },
  // Más rutas...
];
```

---

## 📝 Logging

### Usar Logger Service

```typescript
import { inject } from '@angular/core';
import { LoggerService } from './core/logging/logger.service';

export class MiComponente {
  private logger = inject(LoggerService);

  ngOnInit() {
    this.logger.debug('Componente inicializado');
    this.logger.info('Cargando datos');
    this.logger.warn('Advertencia');
    this.logger.error('Error', error);
    this.logger.fatal('Error crítico', error);
  }
}
```

### Ver Logs en Memoria
```typescript
const logs = logger.getLogs(); // Todos
const errors = logger.getLogs(LogLevel.ERROR); // Solo errores
```

### Limpiar Logs
```typescript
logger.clearLogs();
```

---

## 🎨 Usar Componentes Atomic Design

### Importar desde shared/ui

```typescript
import { 
  ButtonComponent, 
  BadgeComponent,
  CardHeaderComponent,
  DataTableComponent,
  FeatureContainerComponent 
} from './shared/ui';

@Component({
  imports: [ButtonComponent, BadgeComponent, ...],
  // ...
})
```

### Ejemplo de Uso

```html
<!-- Button Atom -->
<app-button 
  label="Click me" 
  variant="primary"
  (clicked)="handleClick()" />

<!-- Badge Atom -->
<app-badge text="New" variant="success" />

<!-- Card Header Molecule -->
<app-card-header
  title="Incidents"
  badge="5"
  badgeVariant="error"
  [showRefresh]="true"
  [showAdd]="true"
  (refresh)="onRefresh()"
  (add)="onAdd()" />

<!-- Data Table Organism -->
<app-data-table
  title="Incidents"
  [items]="incidents"
  [loading]="isLoading"
  (refresh)="loadIncidents()"
  (add)="createIncident()"
  (itemClicked)="viewIncident($event)" />
```

---

## 🏪 Usar Store y Facade

### Inyectar Facade

```typescript
import { inject } from '@angular/core';
import { IncidentsFacade } from './features/incidents/store/incidents.facade';

export class IncidentsComponent {
  protected facade = inject(IncidentsFacade);

  ngOnInit() {
    // Cargar datos
    this.facade.loadIncidents();
  }

  protected createIncident(data: CreateIncidentPayload) {
    this.facade.createIncident(data);
  }
}
```

### Acceder a State en Template

```html
@if (facade.loading$()) {
  <div>Loading...</div>
}

@for (incident of facade.incidents$(); track incident.id) {
  <div>{{ incident.title }}</div>
}
```

---

## 🔒 Usar Guards

### En Routes

```typescript
{
  path: 'admin',
  loadChildren: () => import('./features/admin/admin.routes'),
  canActivate: [authGuard, roleGuard],
  data: { roles: ['admin', 'superadmin'] }
}

{
  path: 'beta-feature',
  loadComponent: () => import('./features/beta/beta.component'),
  canActivate: [featureFlagGuard],
  data: { feature: 'beta-feature' }
}
```

---

## 🐛 Troubleshooting

### Problema: App no inicia
```bash
# Verificar versión de Node
node --version  # Debe ser >= 18

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Problema: Errores de compilación
```bash
# Limpiar caché
rm -rf .angular dist
ng build
```

### Problema: Tests fallan
```bash
# Verificar configuración
cat angular.json | grep test
```

---

## 📚 Recursos

### Documentación del Proyecto
- `ARCHITECTURE.md` - Arquitectura completa
- `SUMMARY.md` - Resumen de implementación
- `IMPLEMENTATION.md` - Estado actual

### Documentación Externa
- [Angular Docs](https://angular.dev)
- [@ngrx/signals](https://ngrx.io/guide/signals)
- [RxJS](https://rxjs.dev)
- [TypeScript](https://www.typescriptlang.org/docs)

---

## 🎯 Tips Útiles

### Auto-format on Save (VS Code)
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Snippets Útiles
```typescript
// Constructor injection
private service = inject(ServiceName);

// Signal
readonly data = signal<Type>(initialValue);

// Computed
readonly computed = computed(() => this.data() * 2);

// Effect
constructor() {
  effect(() => {
    console.log(this.data());
  });
}
```

---

## 🚀 Workflow Recomendado

1. **Iniciar servidor de desarrollo**
   ```bash
   npm start
   ```

2. **Hacer cambios en código**

3. **Verificar en navegador**
   - Hot reload automático

4. **Ejecutar tests**
   ```bash
   npm test
   ```

5. **Commit cambios**
   ```bash
   git add .
   git commit -m "feat: descripción del cambio"
   ```

6. **Build para producción**
   ```bash
   npm run build
   ```

---

*¡Feliz desarrollo! 🎉*
