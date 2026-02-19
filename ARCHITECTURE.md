# OpsBoard - Enterprise Angular Architecture

## 📁 Estructura del Proyecto

```
src/app/
├── core/                           # Servicios singleton y funcionalidad core
│   ├── auth/
│   │   └── store/
│   │       └── auth.store.ts      # Signal Store para autenticación
│   ├── error/
│   │   └── global-error.handler.ts # Manejador global de errores
│   ├── guards/
│   │   ├── auth.guard.ts          # Guard de autenticación (functional)
│   │   ├── role.guard.ts          # Guard basado en roles
│   │   └── feature-flag.guard.ts  # Guard de feature flags
│   ├── interceptors/
│   │   ├── auth.interceptor.ts           # Agrega JWT a requests
│   │   ├── correlation-id.interceptor.ts # Tracking de requests
│   │   └── http-error.interceptor.ts     # Manejo de errores HTTP
│   ├── logging/
│   │   ├── logger.service.ts            # Logger con niveles
│   │   └── correlation-id.service.ts    # Generador de IDs
│   └── services/
│       ├── auth.service.ts        # Lógica de autenticación
│       └── config.service.ts      # Configuración de la app
│
├── features/                       # Features con lazy loading
│   └── incidents/
│       ├── components/
│       │   └── incidents-list.component.ts    # Smart Component
│       ├── mappers/
│       │   └── incident.mapper.ts             # DTO ↔ Domain Model
│       ├── models/
│       │   ├── incident.dto.ts                # DTOs de API
│       │   └── incident.model.ts              # Modelos de dominio
│       ├── services/
│       │   └── incidents-api.service.ts       # HTTP API Service
│       ├── store/
│       │   ├── incidents.facade.ts            # Facade Pattern
│       │   └── incidents.store.ts             # Signal Store
│       ├── incidents.component.ts             # Container Component
│       └── incidents.routes.ts                # Lazy Routes
│
├── layouts/                        # Componentes de layout
│   ├── shell/
│   ├── sidenav/
│   └── topbar/
│
└── shared/                         # Componentes compartidos
    └── ui/                         # Atomic Design
        ├── atoms/                  # Componentes básicos
        │   ├── atom1.component.ts  (ButtonComponent)
        │   └── atom2.component.ts  (BadgeComponent)
        ├── molecules/              # Combinación de atoms
        │   └── molecule1.component.ts (CardHeaderComponent)
        ├── organisms/              # Componentes complejos
        │   └── organism1.component.ts (DataTableComponent)
        └── templates/              # Layouts de páginas
            └── template1.component.ts (FeatureContainerComponent)
```

---

## 🏗️ Patrones Arquitectónicos

### 1. **Atomic Design** (shared/ui)

#### Atoms (Componentes básicos)
- **ButtonComponent**: Botón reutilizable con variants
- **BadgeComponent**: Badges/etiquetas con estados

#### Molecules (Combinación de atoms)
- **CardHeaderComponent**: Header de cards con título, badge y acciones

#### Organisms (Componentes complejos)
- **DataTableComponent**: Tabla de datos completa con acciones

#### Templates (Layouts)
- **FeatureContainerComponent**: Layout estándar para features

**Características:**
- ✅ Todos standalone
- ✅ Signals para inputs/outputs
- ✅ Stateless (Dumb Components)
- ✅ Altamente reutilizables

---

### 2. **Smart vs Dumb Components**

#### Smart Components (Container)
```typescript
// incidents.component.ts
// - Conectado al store/facade
// - Maneja lógica de negocio
// - Orquesta componentes dumb
```

#### Dumb Components (Presentation)
```typescript
// shared/ui/**
// - Solo @Input/@Output (signals)
// - Sin lógica de negocio
// - Reutilizables
```

---

### 3. **Feature-Based Architecture**

Cada feature es un módulo independiente con:

```
incidents/
  ├── components/      # Componentes específicos
  ├── mappers/        # DTOs ↔ Models
  ├── models/         # DTOs + Domain Models
  ├── services/       # API Services
  ├── store/          # State Management
  └── *.routes.ts     # Lazy Loading
```

**Beneficios:**
- 🚀 Lazy loading por feature
- 📦 Código organizado y escalable
- 🔒 Encapsulación clara

---

### 4. **Facade Pattern**

```typescript
@Injectable({ providedIn: 'root' })
export class IncidentsFacade {
  // Abstrae la complejidad del store
  readonly incidents$ = this.store.incidents;
  
  loadIncidents(): void {
    this.store.loadIncidents();
  }
}
```

**Ventajas:**
- 🎯 API simple para componentes
- 🔄 Desacopla componentes del store
- 🧪 Fácil de testear

---

### 5. **Signal Store (@ngrx/signals)**

```typescript
export const IncidentsStore = signalStore(
  { providedIn: 'root' },
  withState<IncidentsState>(initialState),
  withComputed((state) => ({
    criticalIncidents: computed(() => ...)
  })),
  withMethods((store, api) => ({
    loadIncidents: rxMethod<void>(...)
  }))
);
```

**Características:**
- ⚡ Signal-based (sin RxJS obligatorio)
- 🎯 Tipado fuerte
- 🔄 Reactividad nativa de Angular

---

### 6. **DTOs + Mappers**

#### DTOs (Data Transfer Objects)
```typescript
// incident.dto.ts
export interface IncidentDTO {
  id: string;
  created_at: string;  // API format (snake_case)
  affected_systems: string[];
}
```

#### Domain Models
```typescript
// incident.model.ts
export interface Incident {
  id: string;
  createdAt: Date;     // Domain format (camelCase)
  affectedSystems: string[];
}
```

#### Mappers
```typescript
// incident.mapper.ts
export class IncidentMapper {
  static toDomain(dto: IncidentDTO): Incident {
    return {
      id: dto.id,
      createdAt: new Date(dto.created_at),
      affectedSystems: dto.affected_systems
    };
  }
}
```

**Beneficios:**
- 🔒 Separación API ↔ Dominio
- 🛡️ Validación y transformación centralizada
- 🔄 Facilita cambios en API

---

## 🛡️ Core Services

### Logger Service
```typescript
logger.info('Message', { data }, correlationId);
logger.error('Error', error, correlationId);
```

**Niveles:** DEBUG, INFO, WARN, ERROR, FATAL

### Interceptors
1. **AuthInterceptor**: Agrega JWT token
2. **CorrelationIdInterceptor**: Tracking de requests
3. **HttpErrorInterceptor**: Manejo centralizado de errores

### Guards
1. **authGuard**: Protección por autenticación
2. **roleGuard**: Protección por roles
3. **featureFlagGuard**: Protección por feature flags

---

## 🚀 Uso de la Arquitectura

### Crear una nueva Feature

1. **Estructura base:**
```bash
features/
  └── nueva-feature/
      ├── components/
      ├── mappers/
      ├── models/
      ├── services/
      ├── store/
      └── nueva-feature.routes.ts
```

2. **Crear DTOs y Models:**
```typescript
// models/feature.dto.ts
export interface FeatureDTO { ... }

// models/feature.model.ts
export interface Feature { ... }

// mappers/feature.mapper.ts
export class FeatureMapper { ... }
```

3. **Crear API Service:**
```typescript
@Injectable({ providedIn: 'root' })
export class FeatureApiService {
  private http = inject(HttpClient);
  
  getAll(): Observable<FeatureDTO[]> {
    return this.http.get<FeatureDTO[]>('/api/features');
  }
}
```

4. **Crear Store:**
```typescript
export const FeatureStore = signalStore(
  { providedIn: 'root' },
  withState<FeatureState>(...),
  withMethods(...)
);
```

5. **Crear Facade:**
```typescript
@Injectable({ providedIn: 'root' })
export class FeatureFacade {
  private store = inject(FeatureStore);
  
  readonly items$ = this.store.items;
  
  loadItems(): void {
    this.store.loadItems();
  }
}
```

6. **Lazy Loading:**
```typescript
// feature.routes.ts
export const FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature.component').then(m => m.FeatureComponent)
  }
];

// app.routes.ts
{
  path: 'feature',
  loadChildren: () => import('./features/feature/feature.routes').then(m => m.FEATURE_ROUTES),
  canActivate: [authGuard]
}
```

---

## 🧪 Testing

### Smart Components
- Mockear Facade
- Verificar interacciones

### Dumb Components
- Testing de inputs/outputs
- Visual testing

### Services
- Unit tests con mocks
- Integration tests

---

## 📝 Best Practices

### ✅ DO
- Usar standalone components
- Usar signals para reactivity
- Implementar DTOs + Mappers
- Facade pattern para stores
- Guards funcionales
- Lazy loading por feature

### ❌ DON'T
- NgModules (excepto legacy)
- Lógica de negocio en componentes dumb
- Acceso directo al store desde componentes
- Mezclar DTOs con Domain Models
- Requests HTTP en componentes

---

## 🎯 Próximos Pasos

1. ✅ Estructura base implementada
2. ⏳ Integrar más features (dashboard, deployments, logs)
3. ⏳ Tests unitarios y E2E
4. ⏳ Documentación de APIs
5. ⏳ CI/CD pipeline
6. ⏳ Performance optimization

---

## 📚 Referencias

- [Angular Docs](https://angular.dev)
- [@ngrx/signals](https://ngrx.io/guide/signals)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
