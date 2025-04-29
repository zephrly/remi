import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function DateOfBirth() {
  const navigate = useNavigate();
  const [month, setMonth] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

  // Calculate valid year range (13-100 years old)
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 13;
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i,
  );

  // Months array
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Update days in month when month or year changes
  useEffect(() => {
    if (month && year) {
      const daysCount = new Date(parseInt(year), parseInt(month), 0).getDate();
      setDaysInMonth(Array.from({ length: daysCount }, (_, i) => i + 1));
    } else {
      setDaysInMonth([]);
    }
  }, [month, year]);

  // Create a date object from the selected values
  const getSelectedDate = (): Date | null => {
    if (!month || !day || !year) return null;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const selectedDate = getSelectedDate();
    if (!selectedDate) {
      setError("Please select your complete date of birth");
      setLoading(false);
      return;
    }

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update profile with date of birth
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ date_of_birth: format(selectedDate, "yyyy-MM-dd") })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      // Navigate to next step
      navigate("/onboarding/address");
    } catch (err: any) {
      setError(err.message || "Failed to save date of birth");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">When were you born?</h2>
        <p className="text-sm text-gray-500">
          Your date of birth helps us find friends from your generation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Label>Date of Birth</Label>
          <div className="grid grid-cols-3 gap-2">
            {/* Month dropdown */}
            <div>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Day dropdown */}
            <div>
              <Select
                value={day}
                onValueChange={setDay}
                disabled={daysInMonth.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {daysInMonth.map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year dropdown */}
            <div>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            You must be at least 13 years old to use this service.
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/home")}
          >
            Skip for now
          </Button>
          <Button
            type="submit"
            className="bg-brandAccent hover:bg-opacity-90 text-white"
            disabled={loading || !getSelectedDate()}
          >
            {loading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
}
