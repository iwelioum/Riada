import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Workout {
  name: string;
  time: string;
  calories: number;
}

@Component({
  selector: 'app-workout-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workout-tracker.component.html',
  styleUrl: './workout-tracker.component.scss'
})
export class WorkoutTrackerComponent {
  workouts: Workout[] = [
    { name: 'Morning Run', time: '30 min', calories: 280 },
    { name: 'HIIT Session', time: '20 min', calories: 240 },
    { name: 'Upper Body', time: '40 min', calories: 310 },
    { name: 'Stretching', time: '15 min', calories: 80 }
  ];
}
