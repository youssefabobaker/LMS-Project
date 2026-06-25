import { Pipe, PipeTransform } from '@angular/core';
import { StudentAnswerDto } from '../../../models/quiz-attempts.model';

/**
 * Returns the count of correct answers from a StudentAnswerDto array.
 * Usage: {{ answers | correctCount }}
 */
@Pipe({
  name: 'correctCount',
  standalone: true
})
export class CorrectCountPipe implements PipeTransform {
  transform(answers: StudentAnswerDto[]): number {
    if (!answers) return 0;
    return answers.filter(a => a.isCorrect).length;
  }
}
