import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent implements OnInit, OnDestroy {

  // Words to cycle through
  private words = ['Lumina', 'Success'];
  displayedWord = '';

  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private timer: any;

  scrollToFeatures(): void {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  ngOnInit(): void {
    this.type();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  private type(): void {
    const currentWord = this.words[this.wordIndex];

    if (!this.isDeleting) {
      // Typing forward
      this.displayedWord = currentWord.substring(0, this.charIndex + 1);
      this.charIndex++;

      if (this.charIndex === currentWord.length) {
        // Pause at full word then start deleting
        this.timer = setTimeout(() => {
          this.isDeleting = true;
          this.type();
        }, 1800);
        return;
      }
    } else {
      // Erasing
      this.displayedWord = currentWord.substring(0, this.charIndex - 1);
      this.charIndex--;

      if (this.charIndex === 0) {
        // Move to next word
        this.isDeleting = false;
        this.wordIndex = (this.wordIndex + 1) % this.words.length;
        this.timer = setTimeout(() => this.type(), 300);
        return;
      }
    }

    const speed = this.isDeleting ? 60 : 100;
    this.timer = setTimeout(() => this.type(), speed);
  }
}
