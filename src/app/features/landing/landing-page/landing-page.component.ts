import { Component, AfterViewInit } from '@angular/core';
import { FeaturesListComponent } from '../features-list/features-list.component';
import { HeroComponent } from '../hero/hero.component';
import { AboutComponent } from '../about/about.component';
import { ContactComponent } from '../contact/contact.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    FeaturesListComponent,
    HeroComponent,
    AboutComponent,
    ContactComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    // Scroll-reveal: watch all .animate-on-scroll elements across the landing page
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target); // fire once only
          }
        });
      },
      { threshold: 0.12 }
    );

    // Observe after a brief tick so all child components have rendered
    setTimeout(() => {
      document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    }, 50);
  }
}
