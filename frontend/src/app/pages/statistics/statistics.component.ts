import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ClubFrequency, OptionPopularity, RiskScore, SystemHealth } from '../../core/models/api-models';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {
  riskScores: RiskScore[] = [];
  frequencies: ClubFrequency[] = [];
  options: OptionPopularity[] = [];
  health: SystemHealth | null = null;
  loading = false;
  errorMessage: string | null = null;
  partialErrors: string[] = [];
  filterError: string | null = null;
  dateFrom = '';
  dateTo = '';
  lastUpdated: Date | null = null;
  hasLoadedOnce = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  applyFilters(): void {
    this.filterError = this.validateDateFilters();
    if (this.filterError) {
      return;
    }

    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.hasLoadedOnce = false;
    this.errorMessage = null;
    this.partialErrors = [];
    const issues: string[] = [];
    const dateFrom = this.dateFrom || undefined;
    const dateTo = this.dateTo || undefined;

    forkJoin({
      riskScores: this.api.getRiskScores(10).pipe(
        catchError((error) => {
          issues.push(`Risk scores: ${this.getErrorMessage(error, 'Unable to load risk scores.')}`);
          return of([] as RiskScore[]);
        })
      ),
      frequencies: this.api.getFrequency(dateFrom, dateTo).pipe(
        catchError((error) => {
          issues.push(`Club frequency: ${this.getErrorMessage(error, 'Unable to load frequency data.')}`);
          return of([] as ClubFrequency[]);
        })
      ),
      options: this.api.getOptionPopularity().pipe(
        catchError((error) => {
          issues.push(`Options: ${this.getErrorMessage(error, 'Unable to load option popularity.')}`);
          return of([] as OptionPopularity[]);
        })
      ),
      health: this.api.getSystemHealth().pipe(
        catchError((error) => {
          issues.push(`System health: ${this.getErrorMessage(error, 'Unable to load system health.')}`);
          return of(undefined as SystemHealth | undefined);
        })
      )
    }).subscribe({
      next: ({ riskScores, frequencies, options, health }) => {
        this.riskScores = riskScores;
        this.frequencies = frequencies;
        this.options = options;
        this.health = health ?? null;
        this.partialErrors = issues;
        this.lastUpdated = new Date();
        this.hasLoadedOnce = true;

        if (issues.length >= 4) {
          this.errorMessage = 'Statistics data is currently unavailable.';
        }
      },
      error: () => {
        this.errorMessage = 'Unexpected error while loading analytics.';
        this.hasLoadedOnce = true;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private validateDateFilters(): string | null {
    if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
      return 'Start date must be earlier than end date.';
    }

    return null;
  }

  get isEmptyAnalytics(): boolean {
    return this.hasLoadedOnce
      && !this.errorMessage
      && !this.partialErrors.length
      && !this.riskScores.length
      && !this.frequencies.length
      && !this.options.length
      && !this.health;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Session expired. Sign in again to access analytics.';
      }
      if (error.status === 403) {
        return 'Your role does not allow access to analytics endpoints.';
      }

      const apiMessage = error.error?.message ?? error.error?.Message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }
    }

    return fallback;
  }
}
