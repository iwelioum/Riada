import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Exercise {
  name: string;
  difficulty: string;
  muscle: string;
  duration: string;
}

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.scss'
})
export class ExercisesComponent {
  exercises: Exercise[] = [
    { name: 'Jumping Jack', difficulty: 'Intermediate', muscle: 'Full Body', duration: '12 min' },
    { name: 'Bicycle Crunch', difficulty: 'Beginner', muscle: 'Core', duration: '10 min' },
    { name: 'Yoga Poses', difficulty: 'Beginner', muscle: 'Flexibility', duration: '20 min' },
    { name: 'Bench Press', difficulty: 'Advanced', muscle: 'Chest', duration: '15 min' },
    { name: 'Deadlift', difficulty: 'Advanced', muscle: 'Back/Legs', duration: '18 min' },
    { name: 'Rowing Sprint', difficulty: 'Intermediate', muscle: 'Cardio', duration: '8 min' }
  ];
}
