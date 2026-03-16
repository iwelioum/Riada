import { Injectable } from '@angular/core';
import { signal, computed, effect } from '@angular/core';

/**
 * Application-wide state management using Angular Signals.
 * Provides reactive state for common dashboard, list, and filtering scenarios.
 */
@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Fundamental state signals
  selectedGuestId = signal<number | null>(null);
  sessionFilter = signal<string>('upcoming');
  sortBy = signal<'date' | 'name'>('date');
  isLoading = signal<boolean>(false);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  searchQuery = signal<string>('');
  selectedClubId = signal<number | null>(null);

  // Derived computed signals
  isLoadingOrEmpty = computed(() => this.isLoading() === true);
  hasSearchQuery = computed(() => this.searchQuery().trim().length > 0);
  paginationOffset = computed(() => (this.currentPage() - 1) * this.pageSize());

  constructor() {
    // Effect: Log state changes in development
    if (!this.isProduction()) {
      effect(() => {
        const state = {
          selectedGuestId: this.selectedGuestId(),
          sessionFilter: this.sessionFilter(),
          sortBy: this.sortBy(),
          isLoading: this.isLoading(),
          currentPage: this.currentPage(),
          searchQuery: this.searchQuery()
        };
        console.debug('[State]', state);
      });
    }
  }

  // Public methods for state updates
  setSelectedGuest(id: number | null): void {
    this.selectedGuestId.set(id);
  }

  setSessionFilter(filter: string): void {
    this.sessionFilter.set(filter);
    this.resetPagination();
  }

  setSortBy(sort: 'date' | 'name'): void {
    this.sortBy.set(sort);
    this.resetPagination();
  }

  setIsLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  setCurrentPage(page: number): void {
    this.currentPage.set(Math.max(1, page));
  }

  setPageSize(size: number): void {
    this.pageSize.set(Math.max(1, size));
    this.resetPagination();
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
    this.resetPagination();
  }

  setSelectedClub(clubId: number | null): void {
    this.selectedClubId.set(clubId);
  }

  // Reset pagination to page 1
  private resetPagination(): void {
    if (this.currentPage() !== 1) {
      this.currentPage.set(1);
    }
  }

  // Reset all state to defaults
  reset(): void {
    this.selectedGuestId.set(null);
    this.sessionFilter.set('upcoming');
    this.sortBy.set('date');
    this.isLoading.set(false);
    this.currentPage.set(1);
    this.pageSize.set(10);
    this.searchQuery.set('');
    this.selectedClubId.set(null);
  }

  private isProduction(): boolean {
    return typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  }
}
