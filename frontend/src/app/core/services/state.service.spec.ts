import { TestBed } from '@angular/core/testing';
import { StateService } from './state.service';

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateService);
    service.reset();
  });

  it('should initialize with expected defaults', () => {
    expect(service.selectedGuestId()).toBeNull();
    expect(service.sessionFilter()).toBe('upcoming');
    expect(service.sortBy()).toBe('date');
    expect(service.isLoading()).toBeFalse();
    expect(service.currentPage()).toBe(1);
    expect(service.pageSize()).toBe(10);
    expect(service.searchQuery()).toBe('');
    expect(service.selectedClubId()).toBeNull();
    expect(service.hasSearchQuery()).toBeFalse();
    expect(service.paginationOffset()).toBe(0);
  });

  it('should update selection and loading state', () => {
    service.setSelectedGuest(42);
    service.setSelectedClub(3);
    service.setIsLoading(true);

    expect(service.selectedGuestId()).toBe(42);
    expect(service.selectedClubId()).toBe(3);
    expect(service.isLoading()).toBeTrue();
    expect(service.isLoadingOrEmpty()).toBeTrue();
  });

  it('should reset pagination when filters change', () => {
    service.setCurrentPage(4);
    expect(service.currentPage()).toBe(4);

    service.setSessionFilter('past');
    expect(service.currentPage()).toBe(1);

    service.setCurrentPage(3);
    service.setSortBy('name');
    expect(service.currentPage()).toBe(1);

    service.setCurrentPage(2);
    service.setSearchQuery('john');
    expect(service.currentPage()).toBe(1);
    expect(service.hasSearchQuery()).toBeTrue();

    service.setCurrentPage(5);
    service.setPageSize(25);
    expect(service.currentPage()).toBe(1);
    expect(service.pageSize()).toBe(25);
  });

  it('should compute pagination offset from page and size', () => {
    service.setPageSize(20);
    service.setCurrentPage(3);

    expect(service.paginationOffset()).toBe(40);
  });

  it('should fully reset state', () => {
    service.setSelectedGuest(7);
    service.setSelectedClub(2);
    service.setSessionFilter('past');
    service.setSortBy('name');
    service.setIsLoading(true);
    service.setCurrentPage(6);
    service.setPageSize(50);
    service.setSearchQuery('query');

    service.reset();

    expect(service.selectedGuestId()).toBeNull();
    expect(service.selectedClubId()).toBeNull();
    expect(service.sessionFilter()).toBe('upcoming');
    expect(service.sortBy()).toBe('date');
    expect(service.isLoading()).toBeFalse();
    expect(service.currentPage()).toBe(1);
    expect(service.pageSize()).toBe(10);
    expect(service.searchQuery()).toBe('');
    expect(service.hasSearchQuery()).toBeFalse();
    expect(service.paginationOffset()).toBe(0);
  });
});
