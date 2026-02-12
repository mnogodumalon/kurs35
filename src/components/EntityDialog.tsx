import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "textarea" | "checkbox" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface EntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: FieldConfig[];
  initialData?: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  saving?: boolean;
}

export function EntityDialog({
  open,
  onOpenChange,
  title,
  fields,
  initialData,
  onSave,
  saving = false
}: EntityDialogProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (open) {
      const defaults: Record<string, unknown> = {};
      fields.forEach(field => {
        if (initialData?.[field.key] !== undefined) {
          defaults[field.key] = initialData[field.key];
        } else if (field.type === "checkbox") {
          defaults[field.key] = false;
        } else if (field.type === "date") {
          defaults[field.key] = format(new Date(), "yyyy-MM-dd");
        } else {
          defaults[field.key] = "";
        }
      });
      setFormData(defaults);
    }
  }, [open, initialData, fields]);

  const handleChange = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.key} className="space-y-2">
              {field.type !== "checkbox" && (
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
              )}

              {field.type === "text" && (
                <Input
                  id={field.key}
                  value={formData[field.key] as string || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}

              {field.type === "email" && (
                <Input
                  id={field.key}
                  type="email"
                  value={formData[field.key] as string || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}

              {field.type === "number" && (
                <Input
                  id={field.key}
                  type="number"
                  value={formData[field.key] as number || ""}
                  onChange={(e) => handleChange(field.key, e.target.value ? Number(e.target.value) : "")}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}

              {field.type === "date" && (
                <Input
                  id={field.key}
                  type="date"
                  value={formData[field.key] as string || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  id={field.key}
                  value={formData[field.key] as string || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={3}
                />
              )}

              {field.type === "checkbox" && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={field.key}
                    checked={formData[field.key] as boolean || false}
                    onCheckedChange={(checked) => handleChange(field.key, checked)}
                  />
                  <Label htmlFor={field.key} className="cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              )}

              {field.type === "select" && (
                <Select
                  value={formData[field.key] as string || "none"}
                  onValueChange={(value) => handleChange(field.key, value === "none" ? "" : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={field.placeholder || "Auswählen..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {!field.required && (
                      <SelectItem value="none">Keine Auswahl</SelectItem>
                    )}
                    {field.options?.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
