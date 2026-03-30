"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  disabled?: boolean;
  minDate?: Date;
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  minDate,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (value) {
      setDate(value);
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    const newDate = new Date(selectedDate);
    if (date) {
      newDate.setHours(date.getHours(), date.getMinutes());
    } else {
      newDate.setHours(12, 0, 0, 0);
    }
    setDate(newDate);
    onChange?.(newDate);
  };

  const handleTimeChange = (type: "hours" | "minutes", newValue: string) => {
    if (!date) return;
    const newDate = new Date(date);
    const numValue = parseInt(newValue, 10);

    if (type === "hours") {
      newDate.setHours(numValue);
    } else {
      newDate.setMinutes(numValue);
    }

    setDate(newDate);
    onChange?.(newDate);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP p") : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) =>
              minDate
                ? date < minDate
                : date < new Date(new Date().setHours(0, 0, 0, 0))
            }
            initialFocus
          />
          <div className="border-t sm:border-t-0 sm:border-l border-separate p-3">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Hour
                </label>
                <select
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                  value={date?.getHours() ?? 12}
                  onChange={(e) => handleTimeChange("hours", e.target.value)}
                >
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Minute
                </label>
                <select
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                  value={date?.getMinutes() ?? 0}
                  onChange={(e) => handleTimeChange("minutes", e.target.value)}
                >
                  {minutes.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full mt-3"
              onClick={() => setIsOpen(false)}
            >
              Confirm
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
