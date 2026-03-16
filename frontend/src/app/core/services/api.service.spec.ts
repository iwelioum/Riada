import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { PagedResponse } from '../models/api-models';

/**
 * Unit Tests for ApiService
 * Tests for HTTP requests, response mapping, and error handling
 */
describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests remain
  });

  describe('Members API', () => {
    describe('getMembers', () => {
      it('should fetch members list successfully', () => {
        // Arrange
        const mockResponse: PagedResponse<any> = {
          items: [{ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }],
          totalCount: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        };

        // Act
        service.getMembers().subscribe((result) => {
          // Assert
          expect(result.items.length).toBe(1);
          expect(result.items[0].firstName).toBe('John');
        });

        const req = httpMock.expectOne((request) => request.url.includes('/Members'));
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });

      it('should fetch members with pagination parameters', () => {
        // Arrange
        const mockResponse: PagedResponse<any> = { items: [], totalCount: 0, page: 2, pageSize: 20, totalPages: 0, hasNext: false, hasPrevious: true };

        // Act
        service.getMembers({ page: 2, pageSize: 20 }).subscribe();

        // Assert
        const req = httpMock.expectOne((request) =>
          request.url.includes('/Members') && request.params.get('page') === '2'
        );
        expect(req.request.params.get('pageSize')).toBe('20');
        req.flush(mockResponse);
      });

      it('should fetch members with status filter', () => {
        // Arrange
        const mockResponse: PagedResponse<any> = { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasNext: false, hasPrevious: false };

        // Act
        service.getMembers({ status: 'Active' }).subscribe();

        // Assert
        const req = httpMock.expectOne((request) =>
          request.url.includes('/Members') && request.params.get('status') === 'Active'
        );
        req.flush(mockResponse);
      });

      it('should fetch members with search query', () => {
        // Arrange
        const mockResponse: PagedResponse<any> = { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasNext: false, hasPrevious: false };

        // Act
        service.getMembers({ search: 'John' }).subscribe();

        // Assert
        const req = httpMock.expectOne((request) =>
          request.url.includes('/Members') && request.params.get('search') === 'John'
        );
        req.flush(mockResponse);
      });
    });

    describe('getMemberDetail', () => {
      it('should fetch member details by ID', () => {
        // Arrange
        const memberId = 1;
        const mockResponse = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' };

        // Act
        service.getMemberDetail(memberId).subscribe((result) => {
          // Assert
          expect(result.id).toBe(1);
          expect(result.firstName).toBe('John');
        });

        const req = httpMock.expectOne(`https://localhost:7001/api/Members/${memberId}`);
        req.flush(mockResponse);
      });

      it('should handle member not found error', () => {
        // Arrange
        const memberId = 999;

        // Act
        service.getMemberDetail(memberId).subscribe(
          () => fail('should have failed'),
          (error) => {
            // Assert
            expect(error.status).toBe(404);
          }
        );

        const req = httpMock.expectOne(`https://localhost:7001/api/Members/${memberId}`);
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      });
    });

    describe('createMember', () => {
      it('should create member successfully', () => {
        // Arrange
        const payload = {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          gender: 'Female',
          dateOfBirth: '1990-01-01'
        };
        const mockResponse = { id: 2, ...payload };

        // Act
        service.createMember(payload).subscribe((result) => {
          // Assert
          expect(result.id).toBe(2);
          expect(result.firstName).toBe('Jane');
        });

        const req = httpMock.expectOne('https://localhost:7001/api/Members');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
      });
    });

    describe('updateMember', () => {
      it('should update member successfully', () => {
        // Arrange
        const memberId = 1;
        const payload = { firstName: 'UpdatedJohn' };
        const mockResponse = { id: 1, firstName: 'UpdatedJohn' };

        // Act
        service.updateMember(memberId, payload).subscribe((result) => {
          // Assert
          expect(result.firstName).toBe('UpdatedJohn');
        });

        const req = httpMock.expectOne(`https://localhost:7001/api/Members/${memberId}`);
        expect(req.request.method).toBe('PUT');
        req.flush(mockResponse);
      });
    });
  });

  describe('Guests API', () => {
    describe('listGuests', () => {
      it('should fetch guests list successfully', () => {
        // Arrange
        const mockResponse = [
          { id: 1, firstName: 'Guest1', lastName: 'Smith', status: 'Active' },
          { id: 2, firstName: 'Guest2', lastName: 'Johnson', status: 'Active' }
        ];

        // Act
        service.listGuests().subscribe((result) => {
          // Assert
          expect(result.length).toBe(2);
          expect(result[0].firstName).toBe('Guest1');
        });

        const req = httpMock.expectOne('https://localhost:7001/api/Guests');
        req.flush(mockResponse);
      });

      it('should handle empty guests list', () => {
        // Arrange
        const mockResponse: any[] = [];

        // Act
        service.listGuests().subscribe((result) => {
          // Assert
          expect(result.length).toBe(0);
        });

        const req = httpMock.expectOne('https://localhost:7001/api/Guests');
        req.flush(mockResponse);
      });
    });

    describe('registerGuest', () => {
      it('should register guest successfully', () => {
        // Arrange
        const payload = {
          sponsorMemberId: 1,
          firstName: 'NewGuest',
          lastName: 'Doe',
          dateOfBirth: '2000-01-01',
          email: 'guest@example.com'
        };
        const mockResponse = { id: 3, ...payload };

        // Act
        service.registerGuest(payload).subscribe((result) => {
          // Assert
          expect(result.id).toBe(3);
          expect(result.firstName).toBe('NewGuest');
        });

        const req = httpMock.expectOne('https://localhost:7001/api/Guests');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
      });
    });

    describe('banGuest', () => {
      it('should ban guest successfully', () => {
        // Arrange
        const guestId = 1;
        const mockResponse = { message: 'Guest banned successfully' };

        // Act
        service.banGuest(guestId).subscribe((result) => {
          // Assert
          expect(result.message).toContain('banned');
        });

        const req = httpMock.expectOne(`https://localhost:7001/api/Guests/${guestId}/ban`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
      });
    });
  });

  describe('Sessions API', () => {
    describe('getUpcomingSessions', () => {
      it('should fetch upcoming sessions', () => {
        // Arrange
        const clubId = 1;
        const mockResponse = [
          { id: 1, courseName: 'Yoga', instructorName: 'John', clubName: 'Club1', startsAt: '2024-03-20', durationMinutes: 60, enrolledCount: 5, maxCapacity: 20, occupancyPercent: 25 }
        ];

        // Act
        service.getUpcomingSessions(clubId).subscribe((result) => {
          // Assert
          expect(result.length).toBe(1);
          expect(result[0].courseName).toBe('Yoga');
        });

        const req = httpMock.expectOne((request) =>
          request.url.includes('/Courses/sessions') && request.params.get('clubId') === '1'
        );
        req.flush(mockResponse);
      });
    });

    describe('bookSession', () => {
      it('should book session successfully', () => {
        // Arrange
        const sessionId = 1;
        const memberId = 1;
        const mockResponse = { message: 'Booking confirmed' };

        // Act
        service.bookSession(sessionId, memberId).subscribe((result) => {
          // Assert
          expect(result.message).toContain('confirmed');
        });

        const req = httpMock.expectOne(`https://localhost:7001/api/Courses/sessions/${sessionId}/book`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
      });
    });

    describe('cancelBooking', () => {
      it('should cancel booking successfully', () => {
        // Arrange
        const memberId = 1;
        const sessionId = 1;
        const mockResponse = { message: 'Booking cancelled successfully' };

        // Act
        service.cancelBooking(memberId, sessionId).subscribe((result) => {
          // Assert
          expect(result.message).toContain('cancelled');
        });

        const req = httpMock.expectOne(`https://localhost:7001/api/Courses/bookings/${memberId}/${sessionId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(mockResponse);
      });
    });
  });

  describe('Billing API', () => {
    describe('generateMonthlyInvoice', () => {
      it('should generate invoice successfully', () => {
        // Arrange
        const payload = { periodMonth: 3, periodYear: 2024, clubId: 1 };
        const mockResponse = { message: 'Invoice generated' };

        // Act
        service.generateMonthlyInvoice(payload).subscribe((result) => {
          // Assert
          expect(result.message).toContain('generated');
        });

        const req = httpMock.expectOne('https://localhost:7001/api/Billing/generate');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
      });
    });

    describe('getInvoiceDetail', () => {
      it('should fetch invoice details', () => {
        // Arrange
        const invoiceId = 1;
        const mockResponse = {
          id: 1,
          invoiceNumber: 'INV-2024-03-001',
          amountExclTax: 1000,
          amountInclTax: 1200,
          status: 'Issued'
        };

        // Act
        service.getInvoiceDetail(invoiceId).subscribe((result) => {
          // Assert
          expect(result.invoiceNumber).toBe('INV-2024-03-001');
        });

        const req = httpMock.expectOne(`https://localhost:7001/api/Billing/invoices/${invoiceId}`);
        req.flush(mockResponse);
      });
    });

    describe('recordPayment', () => {
      it('should record payment successfully', () => {
        // Arrange
        const payload = { invoiceId: 1, amount: 500, paymentMethod: 'Credit Card' };
        const mockResponse = { message: 'Payment recorded' };

        // Act
        service.recordPayment(payload).subscribe((result) => {
          // Assert
          expect(result.message).toContain('Payment');
        });

        const req = httpMock.expectOne('https://localhost:7001/api/Billing/payments');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
      });
    });
  });

  describe('Health check', () => {
    it('should perform health check', () => {
      // Arrange
      const mockResponse = { status: 'ok', isHealthy: true };

      // Act
      service.health().subscribe((result) => {
        // Assert
        expect(result.status).toBe('ok');
      });

      const req = httpMock.expectOne('https://localhost:7001/health');
      req.flush(mockResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle HTTP errors gracefully', () => {
      // Arrange & Act
      service.getMembers().subscribe(
        () => fail('should have failed'),
        (error) => {
          // Assert
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne((request) => request.url.includes('/Members'));
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
    });

    it('should handle network errors', () => {
      // Arrange & Act
      service.getMembers().subscribe(
        () => fail('should have failed'),
        (error) => {
          // Assert
          expect(error.error.type).toBe('Network error');
        }
      );

      const req = httpMock.expectOne((request) => request.url.includes('/Members'));
      req.error(new ErrorEvent('Network error'));
    });
  });
});
