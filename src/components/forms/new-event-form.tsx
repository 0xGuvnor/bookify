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
import { Textarea } from "@/components/ui/textarea";
import { createEvent } from "@/lib/actions/events";
import { eventFormSchema, type EventFormData } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ClockIcon, MailIcon, MapPinIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const initialState = {
  success: false,
  message: "",
  errors: {},
};

function NewEventForm() {
  const router = useRouter();
  const [participantsInput, setParticipantsInput] = useState("");
  const [state, formAction, isPending] = useActionState(
    createEvent,
    initialState,
  );

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

  function handleSubmit(data: EventFormData) {
    // Clear any existing errors
    form.clearErrors();

    // Call the server action inside a transition
    startTransition(() => {
      formAction(data);
    });
  }

  function handleCancel() {
    router.push("/events");
  }

  // Handle successful form submission
  useEffect(() => {
    if (state.success) {
      // Show success toast
      toast.success("Event created successfully!", {
        description: "Your event is now available for booking.",
      });

      // Navigate to events page on success
      router.push("/events");
    } else if (state.errors) {
      // Set field-specific errors if they exist
      Object.entries(state.errors).forEach(([field, messages]) => {
        form.setError(field as keyof EventFormData, {
          type: "server",
          message: messages[0],
        });
      });
    }
  }, [state, router, form]);

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Create New Event
        </CardTitle>
        <CardDescription>
          Set up a new event that people can book time with you. Configure the
          details, duration, and availability.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            {!state.success && state.message && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {state.message}
              </div>
            )}

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
                      placeholder="Enter email addresses separated by commas&#10;e.g., john@example.com, jane@example.com"
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
          </CardContent>

          <CardFooter className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Event Creation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel creating this event? Any
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
                onClick={() => {
                  form.reset();
                  setParticipantsInput("");
                }}
              >
                Reset Form
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? "Creating Event..." : "Create Event"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default NewEventForm;
