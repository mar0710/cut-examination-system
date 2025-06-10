import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly password = 'password'; // TODO: przenieś do env lub bezpiecznej pamięci
  private authenticated = false;

  login(pwd: string): boolean {
    if (pwd === this.password) {
      this.authenticated = true;
      return true;
    }
    return false;
  }

  logout(): void {
    this.authenticated = false;
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }
}