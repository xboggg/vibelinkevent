import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrderFormData, eventTypes } from "@/data/orderFormData";
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { eventDetailsSchema } from "@/lib/validationSchemas";

interface EventDetailsStepProps {
  formData: OrderFormData;
  updateFormData: (updates: Partial<OrderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Events where the family-side split matters for seating, MoMo tracking,
// and downstream RSVP splitting. Wedding + engagement need bride/groom/both;
// naming has a different frame ("baby's family" as the host unit).
const SIDE_REQUIRED_EVENTS = new Set(["wedding", "engagement", "naming"]);
const SIDE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  wedding:    [{ value: "bride", label: "Bride's side" }, { value: "groom", label: "Groom's side" }, { value: "both", label: "Both sides together" }],
  engagement: [{ value: "bride", label: "Bride's side" }, { value: "groom", label: "Groom's side" }, { value: "both", label: "Both sides together" }],
  naming:     [{ value: "mother", label: "Mother's side" }, { value: "father", label: "Father's side" }, { value: "both", label: "Both sides together" }],
};

export const EventDetailsStep = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: EventDetailsStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selectedEvent = eventTypes.find((e) => e.id === formData.eventType);
  const sideRequired = SIDE_REQUIRED_EVENTS.has(formData.eventType);
  const sideOptions = SIDE_OPTIONS[formData.eventType] || [];

  const isValid =
    formData.eventTitle &&
    formData.eventDate &&
    formData.eventVenue &&
    (!sideRequired || !!formData.hostSide);

  const validateAndProceed = () => {
    const result = eventDetailsSchema.safeParse({
      eventTitle: formData.eventTitle,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime,
      eventVenue: formData.eventVenue,
      eventAddress: formData.eventAddress,
      celebrantNames: formData.celebrantNames,
      additionalInfo: formData.additionalInfo,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  const clearError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Tell us about your {selectedEvent?.name.toLowerCase() || "event"}
        </h2>
        <p className="text-muted-foreground">
          These details will appear on your invitation.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Event Title */}
        <div className="space-y-2">
          <Label htmlFor="eventTitle" className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Event Title / Headline *
          </Label>
          <Input
            id="eventTitle"
            placeholder="e.g., John & Sarah's Wedding, Celebrating Kofi's Life"
            value={formData.eventTitle}
            onChange={(e) => {
              updateFormData({ eventTitle: e.target.value });
              clearError("eventTitle");
            }}
            className={`h-12 ${errors.eventTitle ? "border-destructive" : ""}`}
            maxLength={100}
          />
          {errors.eventTitle && (
            <p className="text-sm text-destructive">{errors.eventTitle}</p>
          )}
        </div>

        {/* Celebrant Names */}
        <div className="space-y-2">
          <Label htmlFor="celebrantNames">Names of Celebrants/Honorees</Label>
          <Input
            id="celebrantNames"
            placeholder="e.g., John Mensah & Sarah Addo"
            value={formData.celebrantNames}
            onChange={(e) => updateFormData({ celebrantNames: e.target.value })}
            className="h-12"
            maxLength={200}
          />
        </div>

        {/* Whose side? Only shown for wedding / engagement / naming events
            where the family split matters for downstream seating and MoMo
            tracking. Required when shown (audit finding H10). */}
        {sideRequired && (
          <div className="space-y-2">
            <Label htmlFor="hostSide" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Whose side is placing this order? *
            </Label>
            <select
              id="hostSide"
              value={formData.hostSide}
              onChange={(e) => {
                updateFormData({ hostSide: e.target.value });
                clearError("hostSide");
              }}
              className={cn(
                "flex h-12 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                errors.hostSide ? "border-destructive" : "border-input"
              )}
            >
              <option value="" disabled>Choose one…</option>
              {sideOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.hostSide && (
              <p className="text-sm text-destructive">{errors.hostSide}</p>
            )}
            <p className="text-xs text-muted-foreground">
              We use this for guest-side splitting on your RSVP dashboard and to route MoMo contributions correctly.
            </p>
          </div>
        )}

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Event Date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal",
                    !formData.eventDate && "text-muted-foreground",
                    errors.eventDate && "border-destructive"
                  )}
                >
                  {formData.eventDate ? (
                    format(formData.eventDate, "PPP")
                  ) : (
                    "Select date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.eventDate || undefined}
                  onSelect={(date) => {
                    updateFormData({ eventDate: date || null });
                    clearError("eventDate");
                  }}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            {errors.eventDate && (
              <p className="text-sm text-destructive">{errors.eventDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Event Time
            </Label>
            <Input
              id="eventTime"
              type="time"
              value={formData.eventTime}
              onChange={(e) => updateFormData({ eventTime: e.target.value })}
              className="h-12"
            />
          </div>
        </div>

        {/* Venue */}
        <div className="space-y-2">
          <Label htmlFor="eventVenue" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Venue Name *
          </Label>
          <Input
            id="eventVenue"
            placeholder="e.g., La Palm Royal Beach Hotel"
            value={formData.eventVenue}
            onChange={(e) => {
              updateFormData({ eventVenue: e.target.value });
              clearError("eventVenue");
            }}
            className={`h-12 ${errors.eventVenue ? "border-destructive" : ""}`}
            maxLength={200}
          />
          {errors.eventVenue && (
            <p className="text-sm text-destructive">{errors.eventVenue}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="eventAddress">Full Address (for Google Maps)</Label>
          <Input
            id="eventAddress"
            placeholder="e.g., 2 La Bypass Road, La, Accra, Ghana"
            value={formData.eventAddress}
            onChange={(e) => updateFormData({ eventAddress: e.target.value })}
            className="h-12"
            maxLength={300}
          />
        </div>

        {/* Additional Info */}
        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Additional Information (optional)</Label>
          <Textarea
            id="additionalInfo"
            placeholder="Any other details you'd like on the invitation? Dress code, special instructions, etc."
            value={formData.additionalInfo}
            onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
            rows={3}
            maxLength={1000}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={validateAndProceed} disabled={!isValid} size="lg" className="gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
