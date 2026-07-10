import { OptionItem } from "@/src/services/optionSetService";

export const OVERDUE_COLOR = "#ef4444";
export const TODAY_COLOR = "#fb923c";
export const FUTURE_PENDING_COLOR = "#eab308";

export const normalizeStatus = (value?: string) => (value || "").trim().toLowerCase();

export const getStatusOption = (status: string | undefined, options: OptionItem[] = []) => {
    const normalized = normalizeStatus(status);
    return options.find((opt) =>
        normalizeStatus(opt.value) === normalized ||
        normalizeStatus(opt.label) === normalized
    );
};

export const getStatusColor = (
    status: string | undefined,
    options: OptionItem[] = [],
    fallback = "#64748b"
) => getStatusOption(status, options)?.color || fallback;

export const getStatusIndex = (status: string | undefined, options: OptionItem[] = []) => {
    const normalized = normalizeStatus(status);
    return options.findIndex((opt) =>
        normalizeStatus(opt.value) === normalized ||
        normalizeStatus(opt.label) === normalized
    );
};

export const isAtOrAfterStatus = (
    currentStatus: string | undefined,
    targetStatus: string | undefined,
    options: OptionItem[] = []
) => {
    if (isStatus(currentStatus, targetStatus || "")) return true;

    const currentIndex = getStatusIndex(currentStatus, options);
    const targetIndex = getStatusIndex(targetStatus, options);

    return currentIndex !== -1 && targetIndex !== -1 && currentIndex >= targetIndex;
};

export const isStatus = (status: string | undefined, expected: string | string[]) => {
    const normalized = normalizeStatus(status);
    const values = Array.isArray(expected) ? expected : [expected];
    return values.some((value) => normalizeStatus(value) === normalized);
};

export const hexToRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace("#", "");
    const value = cleanHex.length === 3
        ? cleanHex.split("").map((char) => char + char).join("")
        : cleanHex;

    const red = parseInt(value.slice(0, 2), 16);
    const green = parseInt(value.slice(2, 4), 16);
    const blue = parseInt(value.slice(4, 6), 16);

    if ([red, green, blue].some(Number.isNaN)) {
        return `rgba(100, 116, 139, ${alpha})`;
    }

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const paletteStyle = (color: string, alpha = 0.1) => ({
    backgroundColor: hexToRgba(color, alpha),
    color,
    borderColor: hexToRgba(color, 0.35),
});
