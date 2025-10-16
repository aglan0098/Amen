import { CommonModule } from '@angular/common';
import { UserService } from './../../../core/user.service';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private userService = inject(UserService);
  user: any = this.userService.getUserSnapshot();
}
