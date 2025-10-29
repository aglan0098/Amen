import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {
  cards = [
    { id: 1, name: 'المستخدمين', number: 20, link: '/users', icon: 'groups' },
    { id: 2, name: 'الزائرين', number: 15, link: '/visitors', icon: 'emoji_people' },
    { id: 3, name: 'العقود', number: 13, link: '/contracts', icon: 'document_scanners' },
    { id: 4, name: 'المراجعين', number: 3, link: '/reviewers', icon: 'how_to_reg' },
    { id: 5, name: 'المنسوبين من الخارج', number: 5, link: '/externals', icon: 'assignment_ind' },
    { id: 6, name: 'حركة الدخول والخروج', number: 4, link: '/all', icon: 'compare_arrows' },
    { id: 7, name: 'الصلاحيات', number: 18, link: '/roles', icon: 'compare_arrows' },
    { id: 8, name: 'التقارير', number: 7, link: '/reports', icon: 'compare_arrows' },
  ];
}
