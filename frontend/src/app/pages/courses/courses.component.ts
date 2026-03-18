import { Component, OnInit, inject, signal } from '@angular/core';
import { LucideAngularModule, BookOpen, Flame, Clock, Users } from 'lucide-angular';
import { CourseResponse, CoursesApiService } from '../../shared/services/courses-api.service';

const DIFFICULTY_CLASSES: Record<string, string> = {
  Beginner:     'bg-[#E0F8EA] text-[#00B69B]',
  Intermediate: 'bg-[#FFF3D6] text-[#FF9066]',
  Advanced:     'bg-[#FFF0F0] text-[#FF4747]',
  AllLevels:    'bg-[#EBEBFF] text-[#4880FF]',
};

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
      <lucide-icon [img]="BookOpenIcon" [size]="24" class="text-[#4880FF]"></lucide-icon> Courses
    </h1>
    <p class="text-sm text-[#6B7280] mt-1">
      @if (loading()) {
        Loading courses…
      } @else {
        {{ courses().length }} courses in catalogue
      }
    </p>
  </div>

  <div class="flex-1 overflow-y-auto p-8">
    @if (error()) {
      <div class="mb-4 p-3 rounded-xl border border-[#FF4747]/30 bg-[#FFF0F0] text-[#FF4747] text-sm">
        {{ error() }}
      </div>
    }

    <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-[#E0E0E0] bg-[#F8FAFF]">
            @for (h of headers; track h) {
              <th class="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{{ h }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            <tr>
              <td colspan="6" class="px-5 py-10 text-center text-sm text-[#6B7280]">Loading courses…</td>
            </tr>
          }
          @if (!loading() && courses().length === 0) {
            <tr>
              <td colspan="6" class="px-5 py-10 text-center text-sm text-[#A6A6A6]">No courses found.</td>
            </tr>
          }
          @for (course of courses(); track course.id) {
            <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
              <td class="px-5 py-4">
                <p class="font-bold text-[#111827]">{{ course.courseName }}</p>
                @if (course.description) {
                  <p class="text-xs text-[#6B7280] mt-1">{{ course.description }}</p>
                }
              </td>
              <td class="px-5 py-4 text-sm text-[#6B7280]">{{ course.activityType }}</td>
              <td class="px-5 py-4">
                <span [class]="'text-xs font-bold px-2.5 py-1 rounded-full ' + difficultyClass(course.difficultyLevel)">
                  {{ course.difficultyLevel }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm text-[#111827]">
                <span class="flex items-center gap-1">
                  <lucide-icon [img]="ClockIcon" [size]="16" class="text-[#6B7280]"></lucide-icon>
                  {{ course.durationMinutes }} min
                </span>
              </td>
              <td class="px-5 py-4 text-sm text-[#111827]">
                <span class="flex items-center gap-1">
                  <lucide-icon [img]="UsersIcon" [size]="16" class="text-[#6B7280]"></lucide-icon>
                  {{ course.maxCapacity }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm text-[#111827]">
                <span class="flex items-center gap-1">
                  <lucide-icon [img]="FlameIcon" [size]="16" class="text-[#FF9066]"></lucide-icon>
                  ~{{ course.estimatedCalories }} kcal
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>
  `,
})
export class CoursesComponent implements OnInit {
  readonly BookOpenIcon = BookOpen;
  readonly FlameIcon = Flame;
  readonly ClockIcon = Clock;
  readonly UsersIcon = Users;
  readonly headers = ['Course', 'Activity type', 'Difficulty', 'Duration', 'Capacity', 'Est. calories'];

  private readonly coursesApi = inject(CoursesApiService);

  courses = signal<CourseResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCourses();
  }

  difficultyClass(level: string): string {
    return DIFFICULTY_CLASSES[level] ?? 'bg-[#F5F6FA] text-[#6B7280]';
  }

  private loadCourses(): void {
    this.loading.set(true);
    this.error.set(null);
    this.coursesApi.listCourses().subscribe({
      next: (courses) => this.courses.set(courses),
      error: () => this.error.set('Unable to load courses catalogue.'),
      complete: () => this.loading.set(false),
    });
  }
}
