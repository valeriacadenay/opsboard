import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, concat, finalize, interval, of, pipe, switchMap, take, tap } from 'rxjs';

import { Deployment, DeploymentStatus } from '../../domain/models/deployment.model';
import { DeploymentMapper } from '../../domain/mappers/deployment.mapper';
import { DeploymentsApiService } from '../../infrastructure/api/deployments-api.service';
import { LoggerService } from '../../../../core/logging/logger.service';
import { AuditService } from '../../../audit/infrastructure/audit.service';

interface DeploymentsState {
  deployments: Deployment[];
  selectedDeployment: Deployment | null;
  loading: boolean;
  error: string | null;
}

const initialState: DeploymentsState = {
  deployments: [],
  selectedDeployment: null,
  loading: false,
  error: null
};

const currentUserRoles = ['admin'];

export const DeploymentsStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((state) => ({
    running: computed(() => state.deployments().filter(d => d.status === 'running')),
    pending: computed(() => state.deployments().filter(d => d.status === 'pending'))
  })),

  withMethods((store,
    api = inject(DeploymentsApiService),
    logger = inject(LoggerService),
    audit = inject(AuditService)
  ) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => api.list().pipe(
          tap(response => {
            const deployments = DeploymentMapper.toDomainList(response.deployments);
            patchState(store, { deployments, loading: false });
          }),
          catchError(error => {
            logger.error('Load deployments failed', error);
            patchState(store, { loading: false, error: 'Failed to load deployments' });
            return of(null);
          })
        ))
      )
    ),

    select(id: string | null) {
      const deployment = id ? store.deployments().find(d => d.id === id) || null : null;
      patchState(store, { selectedDeployment: deployment });
    },

    approve: rxMethod<{ id: string; actor: string }>(
      pipe(
        tap(({ actor }) => {
          if (!currentUserRoles.includes('admin')) {
            patchState(store, { error: 'Not authorized' });
            throw new Error('Not authorized');
          }
          logger.info('Approving deployment', { actor });
          patchState(store, { loading: true, error: null });
        }),
        switchMap(({ id, actor }) => api.approve(id, actor).pipe(
          tap(dto => {
            const deployment = DeploymentMapper.toDomain(dto);
            patchState(store, {
              deployments: store.deployments().map(d => d.id === id ? deployment : d),
              selectedDeployment: store.selectedDeployment()?.id === id ? deployment : store.selectedDeployment(),
              loading: false
            });
            audit.record({
              user: actor,
              action: 'approve_deployment',
              resource: 'deployment',
              metadata: { deploymentId: id }
            });
          }),
          catchError(error => {
            logger.error('Approve failed', error);
            patchState(store, { loading: false, error: 'Failed to approve deployment' });
            return of(null);
          })
        ))
      )
    ),

    start: rxMethod<{ id: string; actor: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, actor }) => api.start(id, actor).pipe(
          tap(dto => upsertDeployment(store, dto)),
          switchMap(() => concat(
            interval(600).pipe(
              take(4),
              switchMap(idx => {
                const progress = Math.min(100, (idx + 1) * 25 + 5);
                const stepIndex = Math.min(2, idx);
                return api.setProgress(id, progress, stepIndex, actor).pipe(
                  tap(dto => upsertDeployment(store, dto))
                );
              })
            ),
            api.finish(id, 'success', actor).pipe(tap(dto => upsertDeployment(store, dto)))
          )),
          finalize(() => patchState(store, { loading: false }))
        )),
        catchError(error => {
          logger.error('Start failed', error);
          patchState(store, { loading: false, error: 'Failed to start deployment' });
          return of(null);
        })
      )
    ),

    fail: rxMethod<{ id: string; actor: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, actor }) => api.finish(id, 'failed', actor).pipe(
          tap(dto => upsertDeployment(store, dto)),
          finalize(() => patchState(store, { loading: false }))
        )),
        catchError(error => {
          logger.error('Fail deployment action failed', error);
          patchState(store, { loading: false, error: 'Failed to mark deployment as failed' });
          return of(null);
        })
      )
    ),

    upsert(dto: any) {
      upsertDeployment(store, dto);
    }
  }))
);

function upsertDeployment(store: any, dto: any) {
  const deployment = DeploymentMapper.toDomain(dto);
  patchState(store, {
    deployments: store.deployments().some((d: Deployment) => d.id === deployment.id)
      ? store.deployments().map((d: Deployment) => d.id === deployment.id ? deployment : d)
      : [...store.deployments(), deployment],
    selectedDeployment: store.selectedDeployment()?.id === deployment.id ? deployment : store.selectedDeployment()
  });
}
