import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, Search, Check } from "lucide-react";

const GARMENT_COLOURS = [
  "Maroon", "Navy Blue", "Teal", "Mustard", "Peach", "Coral", "Wine",
  "Bottle Green", "Rani Pink", "Rust", "Magenta", "Olive", "Beige",
  "Off White", "Black", "White", "Grey", "Red", "Royal Blue", "Sky Blue",
  "Lavender", "Mint Green", "Cream", "Dusty Pink", "Burgundy", "Emerald",
  "Plum", "Tan", "Chocolate", "Sea Green", "Orange", "Yellow", "Pink",
  "Turquoise", "Indigo", "Ivory", "Charcoal", "Aqua", "Rose", "Gold",
];

interface ColourPickerProps {
  selected: string[];
  onChange: (colours: string[]) => void;
  max: number;
}

export default function ColourPicker({ selected, onChange, max }: ColourPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const filtered = GARMENT_COLOURS.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (colour: string) => {
    if (selected.includes(colour)) {
      onChange(selected.filter((c) => c !== colour));
    } else if (selected.length < max) {
      onChange([...selected, colour]);
    }
  };

  const remove = (colour: string) => onChange(selected.filter((c) => c !== colour));

  const atLimit = selected.length >= max;
  const matched = selected.length === max;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium">
          Select {max} colour{max > 1 ? "s" : ""} in this set
        </label>
        <span className={`text-xs font-semibold ${matched ? "text-green-600" : "text-destructive"}`}>
          {selected.length} of {max} selected
        </span>
      </div>

      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((c) => (
            <Badge key={c} variant="secondary" className="gap-1 pr-1">
              {c}
              <button onClick={() => remove(c)} className="ml-0.5 rounded-full hover:bg-muted p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Popover trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between text-xs">
            {atLimit ? "All colours selected" : "Search & add colours..."}
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search colours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 border-0 p-0 text-xs shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">No colours found</p>
            ) : (
              filtered.map((colour) => {
                const isSelected = selected.includes(colour);
                const disabled = !isSelected && atLimit;
                return (
                  <button
                    key={colour}
                    onClick={() => !disabled && toggle(colour)}
                    disabled={disabled}
                    className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors
                      ${isSelected ? "bg-primary/10 text-primary font-medium" : ""}
                      ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-accent cursor-pointer"}
                    `}
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    {colour}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
