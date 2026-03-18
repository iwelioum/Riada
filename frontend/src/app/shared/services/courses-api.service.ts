import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CourseResponse {
  id: number;
  courseName: string;
  description: string | null;
  difficultyLevel: string;
  durationMinutes: number;
  maxCapacity: number;
  estimatedCalories: number;
  activityType: string;
}

export interface SessionResponse {
  id: number;
  courseId: number;
  courseName: string;
  activityType: string;
  instructorName: string;
  clubName: string;
  startsAt: string;
  durationMinutes: number;
  enrolledCount: number;
  maxCapacity: number;
  occupancyPercent: number;
}

export interface BookSessionRequest {
  memberId: number;
  sessionId: number;
}

@Injectable({ providedIn: 'root' })
export class CoursesApiService {
  private readonly http = inject(HttpClient);

  listCourses(): Observable<CourseResponse[]> {
    return this.http.get<CourseResponse[]>('/api/courses');
  }

  listSessions(clubId: number, days: number): Observable<SessionResponse[]> {
    const params = new HttpParams()
      .set('clubId', `${clubId}`)
      .set('days', `${days}`);

    return this.http.get<SessionResponse[]>('/api/courses/sessions', { params });
  }

  getSession(sessionId: number): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(`/api/courses/sessions/${sessionId}`);
  }

  bookSession(request: BookSessionRequest): Observable<void> {
    return this.http.post<void>(`/api/courses/sessions/${request.sessionId}/book`, request);
  }

  cancelBooking(memberId: number, sessionId: number): Observable<void> {
    return this.http.delete<void>(`/api/courses/bookings/${memberId}/${sessionId}`);
  }
}
