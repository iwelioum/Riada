import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-meal-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meal-details.component.html',
  styleUrl: './meal-details.component.scss'
})
export class MealDetailsComponent {
  macros = [
    { label: 'Calories', value: 1750, target: 2500 },
    { label: 'Protein', value: 25, target: 50 },
    { label: 'Carbs', value: 80, target: 150 },
    { label: 'Fats', value: 42, target: 70 }
  ];
}
