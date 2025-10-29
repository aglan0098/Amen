import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  user: any = null;

  ngOnInit() {
    const userData = sessionStorage.getItem('APP_USER');

    if (userData) {
      this.user = JSON.parse(userData);
    } else {
      this.user = null;
    }
  }

  private router = inject(Router);
  private auth = inject(AuthService);

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
