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
})
export class DashboardLayout {
  // -------------------------
  // حالة الـ sidebar (Angular signal)
  // -------------------------
  isSidebarOpen = signal(false);

  // -------------------------
  // نصوص الكلاسات الجاهزة للاستعمال في [ngClass]
  // لأننا نحتاج تغيير سلوك الـ sidebar بين open/closed و بين small/lg.
  // هذا يسهل القراءة والصيانة بدل تكوين سترينج في الـ template.
  // -------------------------
  // عندما يكون الـ sidebar مفتوح:
  // - على small: fixed overlay translate-x-0 (ظاهر)
  // - على lg: يكون جزء من الـ flow (static/relative) وبالتالي الـ main يجلس بجانبه مباشرة
  readonly openSidebarClasses =
    'translate-x-0 fixed right-0 top-0 h-full w-64 lg:relative lg:translate-x-0 lg:static';

  // عندما يكون الـ sidebar مغلق:
  // - على small: fixed ومترجم خارج الشاشة (translate-x-full) -> overlay يختفي
  // - على lg: نجعله absolute وننزله خارج الشاشة (translate-x-full) ليُزال من الـ flow
  readonly closedSidebarClasses =
    'translate-x-full fixed right-0 top-0 h-full w-64 lg:absolute lg:translate-x-full lg:right-0 lg:top-0';

  constructor() {
    // عند التهيئة، نحدد الحالة حسب حجم الشاشة (لو الشاشة كبيرة: نفتح sidebar تلقائياً)
    this.setSidebarState(window.innerWidth);
  }

  // تبديل حالة الـ sidebar عند الضغط على الزرار
  toggleSidebar() {
    this.isSidebarOpen.update((open) => !open);
  }

  // وضع الحالة حسب عرض الشاشة (نستخدم 1024px كـ breakpoint لـ lg)
  private setSidebarState(width: number) {
    const largeScreen = width >= 1024;
    this.isSidebarOpen.set(largeScreen);
  }

  // نراقب تغيّر الحجم ونحدث الحالة تلقائياً
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const target = event.target as Window;
    this.setSidebarState(target.innerWidth);
  }
}
