import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-[120px] justify-start text-left font-normal px-2"
                >
                    {/* Color Preview Box */}
                    <div
                        className="w-4 h-4 rounded-full mr-2 border border-gray-200"
                        style={{ backgroundColor: color }}
                    />
                    <span className="truncate">{color}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
                {/* The Actual Picker */}
                <HexColorPicker color={color} onChange={onChange} />

                {/* Manual Hex Input */}
                <div className="mt-3">
                    <Input
                        value={color}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#000000"
                        className="h-8"
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}