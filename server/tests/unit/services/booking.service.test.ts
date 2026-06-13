import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../../src/lib/prisma';
import { BookingService } from '../../../src/services/booking.service';
import { AppError } from '../../../src/utils/app-error';
import { BOOKING_STATUS } from '../../../src/config/constants';
import { eventBus, EVENTS } from '../../../src/lib/event-bus';

vi.mock('../../../src/lib/event-bus', () => ({
  eventBus: {
    emit: vi.fn(),
  },
  EVENTS: {
    BOOKING_CREATED: 'BOOKING_CREATED',
  },
}));

describe('BookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBooking', () => {
    const mockInput = {
      event_type_id: 'event-1',
      guest_name: 'John Doe',
      guest_email: 'john@example.com',
      guest_notes: '',
      start_time: '2026-06-15T10:00:00Z',
      end_time: '2026-06-15T10:30:00Z',
      timezone: 'America/New_York',
    };

    it('should create a booking successfully if no overlap', async () => {
      // Mock event type exists
      vi.mocked(prisma.eventType.findUnique).mockResolvedValue({
        id: 'event-1',
        title: '30 Min Call',
        user_id: 'user-1',
        is_active: true,
        deleted_at: null,
      } as any);

      // Mock transaction resolving successfully
      const mockCreatedBooking = {
        id: 'booking-1',
        status: BOOKING_STATUS.CONFIRMED,
        ...mockInput,
      };

      // We simulate the transaction behavior
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        // Mock the overlap check query returning empty (no overlap)
        vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
        // Mock the booking creation
        vi.mocked(prisma.booking.create).mockResolvedValue(mockCreatedBooking as any);

        return callback(prisma);
      });

      // Mock Event Bus instead
      vi.mocked(eventBus.emit).mockReturnValue(true);

      const result = await BookingService.createBooking(mockInput as any);

      expect(prisma.eventType.findUnique).toHaveBeenCalled();
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedBooking);

      // Async triggers should be fired via Event Bus
      expect(eventBus.emit).toHaveBeenCalledWith(EVENTS.BOOKING_CREATED, {
        booking: mockCreatedBooking,
        timezone: mockInput.timezone,
      });
    });

    it('should throw AppError if double-booking detected', async () => {
      vi.mocked(prisma.eventType.findUnique).mockResolvedValue({
        id: 'event-1',
        title: '30 Min Call',
        user_id: 'user-1',
        is_active: true,
        deleted_at: null,
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        // Mock overlap check returning an existing booking ID
        vi.mocked(prisma.$queryRaw).mockResolvedValue([{ id: 'existing-booking' }]);

        return callback(prisma);
      });

      await expect(BookingService.createBooking(mockInput as any)).rejects.toThrow(AppError);
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue({
        id: 'booking-1',
        host_id: 'user-1',
        status: BOOKING_STATUS.PENDING,
      } as any);
      vi.mocked(prisma.booking.findUniqueOrThrow).mockResolvedValue({
        id: 'booking-1',
        host_id: 'user-1',
        status: BOOKING_STATUS.PENDING,
      } as any);

      vi.mocked(prisma.booking.update).mockResolvedValue({
        id: 'booking-1',
        status: BOOKING_STATUS.CANCELLED,
      } as any);

      const result = (await BookingService.updateBookingStatus(
        'user-1',
        'booking-1',
        { status: BOOKING_STATUS.CANCELLED },
        'America/New_York',
      )) as any;

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: BOOKING_STATUS.CANCELLED, cancellation_reason: undefined },
      });
      expect(result.status).toBe(BOOKING_STATUS.CANCELLED);
    });
  });
});
