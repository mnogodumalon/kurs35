import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EntityDialog, type FieldConfig } from "@/components/EntityDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LivingAppsService } from "@/services/livingAppsService";
import type { Dozenten } from "@/types/app";
import { Plus, Pencil, Trash2, Mail, Phone, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const fields: FieldConfig[] = [
  { key: "name", label: "Name", type: "text", required: true, placeholder: "Max Mustermann" },
  { key: "email", label: "E-Mail", type: "email", required: true, placeholder: "max@example.de" },
  { key: "phone", label: "Telefon", type: "text", placeholder: "+49 123 456789" },
  { key: "fachgebiet", label: "Fachgebiet", type: "text", placeholder: "Informatik" },
];

interface DozentenTabProps {
  onDataChange?: () => void;
}

export function DozentenTab({ onDataChange }: DozentenTabProps) {
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDozent, setSelectedDozent] = useState<Dozenten | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const data = await LivingAppsService.getDozenten();
      setDozenten(data);
    } catch (error) {
      console.error("Error loading dozenten:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (selectedDozent) {
        await LivingAppsService.updateDozentenEntry(selectedDozent.record_id, data);
      } else {
        await LivingAppsService.createDozentenEntry(data);
      }
      await loadData();
      onDataChange?.();
      setDialogOpen(false);
      setSelectedDozent(null);
    } catch (error) {
      console.error("Error saving dozent:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDozent) return;
    setSaving(true);
    try {
      await LivingAppsService.deleteDozentenEntry(selectedDozent.record_id);
      await loadData();
      onDataChange?.();
      setDeleteDialogOpen(false);
      setSelectedDozent(null);
    } catch (error) {
      console.error("Error deleting dozent:", error);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (dozent: Dozenten) => {
    setSelectedDozent(dozent);
    setDialogOpen(true);
  };

  const openDelete = (dozent: Dozenten) => {
    setSelectedDozent(dozent);
    setDeleteDialogOpen(true);
  };

  const openCreate = () => {
    setSelectedDozent(null);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Dozenten ({dozenten.length})</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Dozent
        </Button>
      </div>

      {dozenten.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Noch keine Dozenten vorhanden.</p>
          <p className="text-sm">Erstellen Sie einen neuen Dozenten, um zu beginnen.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Fachgebiet</TableHead>
                <TableHead className="w-24">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dozenten.map((dozent) => (
                <TableRow key={dozent.record_id}>
                  <TableCell className="font-medium">{dozent.fields.name || "-"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {dozent.fields.email || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {dozent.fields.phone && (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {dozent.fields.phone}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{dozent.fields.fachgebiet || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(dozent)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => openDelete(dozent)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selectedDozent ? "Dozent bearbeiten" : "Neuer Dozent"}
        fields={fields}
        initialData={selectedDozent?.fields}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Dozent löschen"
        description={`Möchten Sie den Dozenten "${selectedDozent?.fields.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
