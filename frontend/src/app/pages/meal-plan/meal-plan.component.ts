import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface MealDay {
  day: string;
  calories: number;
  meals: string[];
}

@Component({
  selector: 'app-meal-plan',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './meal-plan.component.html',
  styleUrl: './meal-plan.component.scss'
})
export class MealPlanComponent {
  plan: MealDay[] = [
    { day: 'Monday', calories: 1800, meals: ['Oat + fruits', 'Grilled chicken', 'Salmon & rice'] },
    { day: 'Tuesday', calories: 1750, meals: ['Smoothie bowl', 'Quinoa salad', 'Turkey tacos'] },
    { day: 'Wednesday', calories: 1900, meals: ['Egg muffins', 'Pasta pesto', 'Tofu stir fry'] },
    { day: 'Thursday', calories: 1700, meals: ['Greek yogurt', 'Chicken wrap', 'Veggie curry'] }
  ];
}
