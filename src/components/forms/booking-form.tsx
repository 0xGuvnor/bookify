"use client";

import { CalendarSkeleton } from "@/components/skeletons/calendar-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  createBooking,
  getAvailableDates,
  getAvailableTimeSlots,
} from "@/lib/actions/bookings";
import type { Event } from "@/lib/db/schema";
import { formatTimeDisplay } from "@/lib/utils";
import {
  bookingFormSchema,
  type BookingFormData,
} from "@/lib/validations/bookings";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  endOfMonth,
  format,
  isBefore,
  startOfDay,
  startOfMonth,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface BookingFormProps {
  event: Event;
  eventOwnerId: string;
  timezone: string;
}

function BookingForm({ event, eventOwnerId, timezone }: BookingFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSubmitting, startTransition] = useTransition();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      bookerName: "",
      bookerEmail: "",
      bookerNotes: "",
      selectedDate: "",
      selectedTime: "",
      timezone: timezone,
    },
  });

  // Watch for selectedTime changes to trigger re-renders
  const selectedTime = form.watch("selectedTime");

  // Fetch available dates for the current month
  const fetchAvailableDates = async (month: Date) => {
    setIsLoadingDates(true);
    try {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const result = await getAvailableDates(
        eventOwnerId,
        event.id,
        monthStart,
        monthEnd,
        timezone,
      );

      if (result.success && result.data) {
        setAvailableDates(result.data);
      } else {
        setAvailableDates([]);
        console.error("Failed to fetch available dates:", result.message);
      }
    } catch (error) {
      console.error("Error fetching available dates:", error);
      setAvailableDates([]);
    } finally {
      setIsLoadingDates(false);
    }
  };

  // Load available dates when component mounts or month changes
  useEffect(() => {
    fetchAvailableDates(currentMonth);
  }, [currentMonth, eventOwnerId, event.id, timezone]);

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      form.setValue("selectedDate", "");
      form.setValue("selectedTime", "");
      setAvailableSlots([]);
      return;
    }

    setSelectedDate(date);
    setIsLoadingSlots(true);

    // Update form with selected date
    form.setValue("selectedDate", format(date, "yyyy-MM-dd"));
    form.setValue("selectedTime", ""); // Reset time when date changes

    try {
      const result = await getAvailableTimeSlots(
        eventOwnerId,
        event.id,
        date,
        timezone,
      );

      if (result.success && result.data) {
        setAvailableSlots(result.data);
      } else {
        setAvailableSlots([]);
        toast.error(result.message || "Failed to load available time slots");
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
      toast.error("Failed to load available time slots");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleTimeSlotSelect = (time: string) => {
    form.setValue("selectedTime", time);
    // Trigger form validation and re-render
    form.trigger("selectedTime");
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  const onSubmit = async (data: BookingFormData) => {
    startTransition(async () => {
      try {
        const result = await createBooking(event.id, eventOwnerId, data);

        if (result.success && result.data) {
          toast.success(result.message || "Booking created successfully!");
          // Redirect to booking confirmation page
          router.push(`/book/${eventOwnerId}/${event.id}/${result.data.id}`);
        } else {
          toast.error(result.message || "Failed to create booking");

          // Handle validation errors
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, errors]) => {
              if (errors && errors.length > 0) {
                form.setError(field as keyof BookingFormData, {
                  type: "manual",
                  message: errors[0],
                });
              }
            });
          }
        }
      } catch (error) {
        console.error("Error creating booking:", error);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  // Don't allow booking dates in the past or without available timeslots
  const isDateDisabled = (date: Date) => {
    // Check if date is in the past
    if (isBefore(date, startOfDay(new Date()))) {
      return true;
    }

    // Check if date has available timeslots
    if (availableDates.length === 0) {
      // While dates are loading, don't disable any dates
      return false;
    }

    // Check if the date is in the available dates list
    return !availableDates.some(
      (availableDate) =>
        format(availableDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
    );
  };

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Book Your Time Slot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Date Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="flex h-6 w-6 items-center justify-center p-0"
                >
                  1
                </Badge>
                <h3 className="text-lg font-semibold">Select a Date</h3>
              </div>

              <FormField
                control={form.control}
                name="selectedDate"
                render={() => (
                  <FormItem>
                    <FormControl>
                      {isLoadingDates ? (
                        <CalendarSkeleton />
                      ) : (
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={isDateDisabled}
                          onMonthChange={handleMonthChange}
                          className="w-full rounded-md border [--cell-size:1.5rem]"
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Step 2: Time Selection */}
            {selectedDate && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="flex h-6 w-6 items-center justify-center p-0"
                  >
                    2
                  </Badge>
                  <h3 className="text-lg font-semibold">Select a Time</h3>
                </div>

                <FormField
                  control={form.control}
                  name="selectedTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Time Slots</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                          {isLoadingSlots ? (
                            // Loading skeletons
                            Array.from({ length: 8 }).map((_, i) => (
                              <Skeleton key={i} className="h-10 w-full" />
                            ))
                          ) : availableSlots.length > 0 ? (
                            availableSlots.map((time) => (
                              <Button
                                key={time}
                                type="button"
                                variant={
                                  field.value === time ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => handleTimeSlotSelect(time)}
                                className="justify-start"
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                {formatTimeDisplay(time)}
                              </Button>
                            ))
                          ) : (
                            <div className="col-span-full py-8 text-center">
                              <p className="mb-2 text-gray-500">
                                No available time slots for this date.
                              </p>
                              <p className="text-sm text-gray-400">
                                Please select a different date.
                              </p>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Contact Information */}
            {selectedDate && selectedTime && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="flex h-6 w-6 items-center justify-center p-0"
                  >
                    3
                  </Badge>
                  <h3 className="text-lg font-semibold">Your Information</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bookerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Enter your full name"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bookerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bookerNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                          <Textarea
                            placeholder="Any additional information or special requests..."
                            className="resize-none pl-10"
                            rows={3}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Let us know if you have any special requirements or
                        questions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Submit Button */}
            {selectedDate && selectedTime && (
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Confirming Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default BookingForm;
