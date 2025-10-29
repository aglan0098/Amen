import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../components/sidebar/sidebar';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, Navbar, Footer],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css'],
})
export class DashboardLayout {
  isSidebarOpen = signal(false);

  windowWidth = window.innerWidth;

  readonly sidebarWidthClass = 'w-64 no-scrollbar';

  readonly openSidebarClasses =
    'translate-x-0 fixed right-0 top-0 h-full overflow-y-auto bg-white z-50 transition-transform duration-300 ' +
    'lg:translate-x-0 lg:fixed lg:top-0 lg:right-0 lg:h-screen lg:overflow-y-auto' +
    this.sidebarWidthClass;

  readonly closedSidebarClasses =
    'translate-x-full fixed right-0 top-0 h-full overflow-y-auto bg-white z-50 transition-transform duration-300 ' +
    'lg:translate-x-full lg:fixed lg:top-0 lg:right-0 lg:h-screen lg:overflow-y-auto ' +
    this.sidebarWidthClass;

  constructor() {
    this.setSidebarState(this.windowWidth);
  }

  toggleSidebar() {
    this.isSidebarOpen.update((open) => !open);
  }

  private setSidebarState(width: number) {
    const largeScreen = width >= 1024;
    this.isSidebarOpen.set(largeScreen);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const target = event.target as Window;
    this.windowWidth = target.innerWidth;
    this.setSidebarState(target.innerWidth);
  }
}
