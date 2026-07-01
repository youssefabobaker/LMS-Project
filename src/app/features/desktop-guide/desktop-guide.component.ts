import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-desktop-guide',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './desktop-guide.component.html',
  styleUrl: './desktop-guide.component.css'
})
export class DesktopGuideComponent {

}
