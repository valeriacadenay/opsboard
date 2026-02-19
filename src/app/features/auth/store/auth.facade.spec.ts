import { TestBed } from '@angular/core/testing';
import { AuthFacade } from './auth.facade';
import { AuthStore } from './auth.store';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let store: AuthStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthFacade, AuthStore],
    });
    facade = TestBed.inject(AuthFacade);
    store = TestBed.inject(AuthStore);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should expose user$ observable', (done) => {
    facade.user$.subscribe((user) => {
      expect(user).toBeNull();
      done();
    });
  });

  it('should expose isAuthenticated$ observable', (done) => {
    facade.isAuthenticated$.subscribe((isAuth) => {
      expect(isAuth).toBeFalse();
      done();
    });
  });

  it('should call store.login with credentials', (done) => {
    spyOn(store, 'login');
    const credentials = { email: 'test@test.com', password: 'pass123' };
    facade.login(credentials);
    setTimeout(() => {
      expect(store.login).toHaveBeenCalledWith(credentials);
      done();
    }, 100);
  });

  it('should call store.logout', (done) => {
    spyOn(store, 'logout');
    facade.logout();
    setTimeout(() => {
      expect(store.logout).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should call store.verifyMFA with request', (done) => {
    spyOn(store, 'verifyMFA');
    facade.verifyMFA('test@test.com', '123456');
    setTimeout(() => {
      expect(store.verifyMFA).toHaveBeenCalledWith({
        email: 'test@test.com',
        code: '123456',
      });
      done();
    }, 100);
  });
});
