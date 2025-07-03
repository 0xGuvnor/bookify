"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { deleteEvent, updateEvent } from "@/lib/actions/events";
import type { GetEventResult } from "@/lib/types";
import { eventFormSchema, type EventFormData } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  ToggleLeftIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  eventPromise: Promise<GetEventResult>;
  eventId: string;
}

function EditEventForm({ eventPromise, eventId }: Props) {
  const router = useRouter();
  const eventResult = use(eventPromise);
  const [participantsInput, setParticipantsInput] = useState("");
  const [isPending, startTransition] = useTransition();

  // Initialize form with default values - this hook must be called before any returns
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 30,
      location: "",
      meetingLink: "",
      isActive: true,
      participants: [],
    },
  });

  // Memoize the parsed participants - this hook must be called before any returns
  const { initialParticipants, initialParticipantsInput } = useMemo(() => {
    // Handle case where event doesn't exist or is invalid
    if (!eventResult.success || !eventResult.event) {
      return {
        initialParticipants: [],
        initialParticipantsInput: "",
      };
    }

    const participants = JSON.parse(eventResult.event.participants) as string[];
    const participantsInput = participants.join(", ");
    return {
      initialParticipants: participants,
      initialParticipantsInput: participantsInput,
    };
  }, [eventResult.success, eventResult.event?.participants]);

  // Update form with actual event data - this hook must be called before any returns
  useEffect(() => {
    // Only update form if we have a valid event
    if (eventResult.success && eventResult.event) {
      const event = eventResult.event;
      form.reset({
        title: event.title,
        description: event.description || "",
        duration: event.duration,
        location: event.location || "",
        meetingLink: event.meetingLink || "",
        isActive: event.isActive,
        participants: initialParticipants,
      });
      setParticipantsInput(initialParticipantsInput);
    }
  }, [
    eventResult.success,
    eventResult.event,
    initialParticipants,
    initialParticipantsInput,
    form,
  ]);

  // Handle case where event doesn't exist - now after all hooks are called
  if (!eventResult.success || !eventResult.event) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Event Not Found
          </CardTitle>
          <CardDescription>
            The event you&apos;re trying to edit doesn&apos;t exist or you
            don&apos;t have permission to view it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              This event may have been deleted or you may not have the right
              permissions.
            </p>
            <Button onClick={() => router.push("/events")}>
              Go Back to Events
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const event = eventResult.event;

  function handleSubmit(data: EventFormData) {
    // Clear any existing errors
    form.clearErrors();

    // Call the server action inside a transition
    startTransition(async () => {
      try {
        const result = await updateEvent(eventId, data);

        if (result.success) {
          // Show success toast
          toast.success("Event updated successfully!", {
            description: "Your changes have been saved.",
          });

          // Navigate to events page on success
          router.push("/events");
        } else {
          // Handle errors
          if (result.errors) {
            // Set field-specific errors if they exist
            Object.entries(result.errors).forEach(([field, messages]) => {
              form.setError(field as keyof EventFormData, {
                type: "server",
                message: messages[0],
              });
            });
          }

          // Show error toast with the message
          if (result.message) {
            toast.error("Failed to update event", {
              description: result.message,
            });
          }
        }
      } catch (error) {
        // Handle unexpected errors
        console.error("Unexpected error:", error);
        toast.error("Something went wrong", {
          description: "Please try again later.",
        });
      }
    });
  }

  function handleCancel() {
    router.push("/events");
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        const result = await deleteEvent(eventId);

        if (result.success) {
          toast.success("Event deleted successfully!", {
            description: "The event has been permanently removed.",
          });
          router.push("/events");
        } else {
          toast.error("Failed to delete event", {
            description: result.message || "Please try again.",
          });
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("Something went wrong", {
          description: "Please try again later.",
        });
      }
    });
  }

  function handleResetForm() {
    form.reset({
      title: event.title,
      description: event.description || "",
      duration: event.duration,
      location: event.location || "",
      meetingLink: event.meetingLink || "",
      isActive: event.isActive,
      participants: initialParticipants,
    });
    setParticipantsInput(initialParticipantsInput);
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Edit Event
        </CardTitle>
        <CardDescription>
          Update your event details, duration, and availability settings.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="30 Minute Meeting" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name people will see when booking with you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this meeting is about..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description to help people understand the purpose
                    of this meeting.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      Duration (minutes)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="15"
                        max="721"
                        step="15"
                        {...field}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      How long should each booking be?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="participants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MailIcon className="h-4 w-4" />
                    Participant Emails
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter email addresses separated by commas, e.g. john@example.com, jane@example.com"
                      value={participantsInput}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setParticipantsInput(e.target.value);
                        // Update form field with array of emails
                        const emails = e.target.value
                          .split(",")
                          .map((email) => email.trim())
                          .filter((email) => email.length > 0);
                        field.onChange(emails);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter email addresses of people who should receive meeting
                    invites. Separate multiple emails with commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    Location
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Conference Room A, or leave blank for online meeting"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Physical location for in-person meetings (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meetingLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Video call link for virtual meetings (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2 text-base">
                      <ToggleLeftIcon className="h-4 w-4" />
                      Event Status
                    </FormLabel>
                    <FormDescription>
                      Toggle whether this event is available for booking.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full sm:w-auto"
                    disabled={isPending}
                  >
                    <Trash2Icon className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this event? This action
                      cannot be undone and will permanently remove the event and
                      all its data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Event</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90 text-neutral-100"
                    >
                      Yes, Delete Event
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Event Editing?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel editing this event? Any
                      unsaved changes will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Stay</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleResetForm}
              >
                Reset Changes
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? "Updating Event..." : "Update Event"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default EditEventForm;
