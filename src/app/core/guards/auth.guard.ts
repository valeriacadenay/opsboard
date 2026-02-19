@Injectable({ providedIn: 'root' })
export class AuthGuard {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
