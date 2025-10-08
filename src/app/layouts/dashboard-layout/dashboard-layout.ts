import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, Navbar, Footer],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css'],
})
export class DashboardLayout {
  // حالة Sidebar
  isSidebarOpen = signal(false);

  constructor() {
    // تعيين الحالة حسب حجم الشاشة عند أول تحميل
    this.setSidebarState(window.innerWidth);
  }

  // تبديل حالة Sidebar عند الضغط على الزرار
  toggleSidebar() {
    this.isSidebarOpen.update((open) => !open);
  }

  // تحديد حالة Sidebar حسب حجم الشاشة
  private setSidebarState(width: number) {
    const largeScreen = width >= 1024;
    this.isSidebarOpen.set(largeScreen);
  }

  // متابعة تغير حجم الشاشة
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const target = event.target as Window;
    this.setSidebarState(target.innerWidth);
  }
}
