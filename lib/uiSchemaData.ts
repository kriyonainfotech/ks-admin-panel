export interface UiField {
    key: string;
    label: string;
    type: "text" | "number" | "textarea" | "date" | "select" | "boolean";
    required?: boolean;
    placeholder?: string;
    order?: number;
    _id?: string;
}

export interface UiSchema {
    _id?: string;
    resource: string;
    variant: string;
    fields: UiField[];
    createdAt?: string;
    updatedAt?: string;
}
