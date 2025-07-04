"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSchedule, updateSchedule } from "@/lib/actions";
import {
  COMMON_TIMEZONES,
  DAY_NAMES,
  formatTimezoneDisplay,
} from "@/lib/constants";
import { DaysOfWeek } from "@/lib/db/schema";
import type { GetScheduleResult } from "@/lib/types";
import { formatTimeDisplay, generateTimeSlots } from "@/lib/utils";
import {
  convertAvailabilitiesTimezone,
  detectOverlaps,
  getDefaultAvailabilityForDay,
  normalizeTimeFormat,
  scheduleFormSchema,
  type OverlapConflict,
  type ScheduleFormData,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Clock, Globe, Plus, Trash2 } from "lucide-react";
import { use, useCallback, useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

const TIME_SLOTS = generateTimeSlots();

interface Props {
  schedulePromise: Promise<GetScheduleResult>;
}

function ScheduleForm({ schedulePromise }: Props) {
  const scheduleResult = use(schedulePromise);
  const [isPending, startTransition] = useTransition();
  const [dayConflicts, setDayConflicts] = useState<
    Map<string, OverlapConflict>
  >(new Map());

  const existingSchedule = scheduleResult.success
    ? scheduleResult.data
    : undefined;

  const [previousTimezone, setPreviousTimezone] = useState<string>(
    existingSchedule?.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const isUpdate = !!existingSchedule;

  // Initialize form with existing data or defaults
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone:
        existingSchedule?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities:
        existingSchedule?.availabilities?.map((availability) => ({
          ...availability,
          startTime: normalizeTimeFormat(availability.startTime),
          endTime: normalizeTimeFormat(availability.endTime),
        })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "availabilities",
  });

  // Validate overlaps and update conflicts state
  const validateOverlaps = useCallback(() => {
    try {
      const availabilities = form.getValues("availabilities");
      if (availabilities.length === 0) {
        setDayConflicts(new Map());
        return true;
      }

      // Normalize time formats before validation
      const normalizedAvailabilities = availabilities.map((availability) => ({
        ...availability,
        startTime: normalizeTimeFormat(availability.startTime),
        endTime: normalizeTimeFormat(availability.endTime),
      }));

      const { hasConflicts, conflicts } = detectOverlaps(
        normalizedAvailabilities,
      );

      if (hasConflicts) {
        const conflictsMap = new Map<string, OverlapConflict>();
        conflicts.forEach((conflict) => {
          conflictsMap.set(conflict.day, conflict);
        });
        setDayConflicts(conflictsMap);
        return false;
      } else {
        setDayConflicts(new Map());
        return true;
      }
    } catch (error) {
      console.error("Error validating overlaps:", error);
      // If validation fails, assume no conflicts to prevent blocking the user
      setDayConflicts(new Map());
      return true;
    }
  }, [form]);

  // Watch for changes in availabilities and validate overlaps
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith("availabilities") && type === "change") {
        // Debounce validation to avoid excessive calls
        const timeoutId = setTimeout(() => {
          validateOverlaps();
        }, 300);
        return () => clearTimeout(timeoutId);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, validateOverlaps]);

  // Watch for timezone changes and convert existing time slots
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === "timezone" && type === "change") {
        const newTimezone = value.timezone;
        const currentAvailabilities = form.getValues("availabilities");

        if (
          newTimezone &&
          newTimezone !== previousTimezone &&
          currentAvailabilities.length > 0
        ) {
          try {
            // Convert existing time slots to the new timezone
            const convertedAvailabilities = convertAvailabilitiesTimezone(
              currentAvailabilities,
              previousTimezone,
              newTimezone,
            );

            // Update the form with converted times
            form.setValue("availabilities", convertedAvailabilities, {
              shouldValidate: true,
              shouldDirty: true,
            });

            // Update the previous timezone
            setPreviousTimezone(newTimezone);

            // Show a toast notification about the conversion
            toast.success("Time slots converted to new timezone", {
              description: `Your existing time slots have been converted from ${previousTimezone} to ${newTimezone}.`,
              duration: 4000,
            });
          } catch (error) {
            console.error("Error converting time slots:", error);
            toast.error("Failed to convert time slots", {
              description:
                "Please check your time slots after changing timezone.",
              duration: 4000,
            });
          }
        } else if (newTimezone && newTimezone !== previousTimezone) {
          // Update previous timezone even if no availabilities exist
          setPreviousTimezone(newTimezone);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, previousTimezone]);

  // Initial validation on mount if there are existing availabilities
  useEffect(() => {
    if (
      existingSchedule?.availabilities &&
      existingSchedule.availabilities.length > 0
    ) {
      validateOverlaps();
    }
  }, [existingSchedule, validateOverlaps]);

  const availabilitiesByDay = fields.reduce(
    (acc, field, index) => {
      const day = field.dayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push({ ...field, index });
      return acc;
    },
    {} as Record<string, Array<(typeof fields)[0] & { index: number }>>,
  );

  function addAvailabilitySlot(dayOfWeek: string) {
    const defaultSlot = getDefaultAvailabilityForDay(dayOfWeek);
    append({
      dayOfWeek: defaultSlot.dayOfWeek,
      startTime: normalizeTimeFormat(defaultSlot.startTime),
      endTime: normalizeTimeFormat(defaultSlot.endTime),
    });
  }

  function onSubmit(data: ScheduleFormData) {
    // Check for overlaps before submitting
    const isValid = validateOverlaps();

    if (!isValid) {
      // Show toast warning for conflicts
      toast.error("⚠️ Scheduling conflicts detected", {
        description:
          "Please resolve time slot overlaps before saving your schedule.",
        duration: 5000,
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = isUpdate
          ? await updateSchedule(data)
          : await createSchedule(data);

        if (result.success) {
          toast.success(result.message);
          setDayConflicts(new Map()); // Clear any remaining conflicts
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  // Show loading state if schedule data is not available yet
  if (!scheduleResult.success && scheduleResult.message) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Globe className="text-muted-foreground mx-auto mb-4 h-8 w-8" />
            <p className="text-muted-foreground">{scheduleResult.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Timezone Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Timezone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select your timezone</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="space-y-1">
                        <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                          Common Timezones
                        </div>
                        {COMMON_TIMEZONES.map((tz) => (
                          <SelectItem key={`common-${tz}`} value={tz}>
                            {formatTimezoneDisplay(tz)}
                          </SelectItem>
                        ))}
                        <div className="text-muted-foreground mt-2 border-t px-2 py-1.5 pt-2 text-xs font-medium">
                          All Timezones
                        </div>
                        {Intl.supportedValuesOf("timeZone")
                          .filter(
                            (tz) =>
                              !(COMMON_TIMEZONES as readonly string[]).includes(
                                tz,
                              ),
                          )
                          .map((tz) => (
                            <SelectItem key={`all-${tz}`} value={tz}>
                              {formatTimezoneDisplay(tz)}
                            </SelectItem>
                          ))}
                      </div>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Weekly Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Weekly Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.values(DaysOfWeek).map((day) => {
              const dayConflict = dayConflicts.get(day);
              const hasConflict = !!dayConflict;

              return (
                <div key={day} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">
                        {DAY_NAMES[day as keyof typeof DAY_NAMES]}
                      </h3>
                      {hasConflict && (
                        <div className="text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">Conflict</span>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAvailabilitySlot(day)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Time Slot
                    </Button>
                  </div>

                  {/* Show conflict error message for this day */}
                  {hasConflict && (
                    <div className="border-destructive/50 bg-destructive/10 rounded-md border p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="text-destructive mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div>
                          <p className="text-destructive text-sm font-medium">
                            Time Slot Conflict
                          </p>
                          <p className="text-destructive/80 mt-1 text-xs">
                            {dayConflict.message}
                          </p>
                          <div className="text-destructive/70 mt-2 text-xs">
                            <span className="font-medium">
                              Conflicting times:
                            </span>{" "}
                            {dayConflict.conflictingSlots
                              .map(
                                (slot) => `${slot.startTime}-${slot.endTime}`,
                              )
                              .join(", ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {availabilitiesByDay[day]?.length > 0 ? (
                    <div className="space-y-3">
                      {availabilitiesByDay[day].map(({ index, id }) => {
                        const isInConflict =
                          hasConflict &&
                          dayConflict.conflictingSlots.some(
                            (slot) => slot.index === index,
                          );

                        return (
                          <div
                            key={id}
                            className={`flex items-end gap-3 rounded-lg p-4 ${
                              isInConflict
                                ? "bg-destructive/10 border-destructive/30 border"
                                : "bg-muted/50"
                            }`}
                          >
                            <FormField
                              control={form.control}
                              name={`availabilities.${index}.startTime`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Start Time</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select start time" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {TIME_SLOTS.map((time) => (
                                        <SelectItem
                                          key={`start-${time}`}
                                          value={time}
                                        >
                                          {formatTimeDisplay(time)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`availabilities.${index}.endTime`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>End Time</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select end time" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {TIME_SLOTS.map((time) => (
                                        <SelectItem
                                          key={`end-${time}`}
                                          value={time}
                                        >
                                          {formatTimeDisplay(time)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => remove(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-8 text-center">
                      <Clock className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                      <p className="text-muted-foreground text-sm">
                        No availability set for{" "}
                        {DAY_NAMES[day as keyof typeof DAY_NAMES].toLowerCase()}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Click &quot;Add Time Slot&quot; to set your availability
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col items-end gap-2">
          {isUpdate && !form.formState.isDirty && !isPending && (
            <p className="text-muted-foreground text-sm">No changes to save</p>
          )}
          <Button
            type="submit"
            disabled={isPending || (isUpdate && !form.formState.isDirty)}
            size="lg"
          >
            {isPending
              ? isUpdate
                ? "Updating Schedule..."
                : "Creating Schedule..."
              : isUpdate
                ? "Update Schedule"
                : "Create Schedule"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ScheduleForm;
