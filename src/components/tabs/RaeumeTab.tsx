import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EntityDialog, type FieldConfig } from "@/components/EntityDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LivingAppsService } from "@/services/livingAppsService";
import type { Raeume } from "@/types/app";
import { Plus, Pencil, Trash2, Building, DoorOpen, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const fields: FieldConfig[] = [
  { key: "raumname", label: "Raumname", type: "text", required: true, placeholder: "Seminarraum 1" },
  { key: "gebaeude", label: "Gebäude", type: "text", placeholder: "Hauptgebäude" },
  { key: "kapazitaet", label: "Kapazität", type: "number", required: true, placeholder: "20" },
];

interface RaeumeTabProps {
  onDataChange?: () => void;
}

export function RaeumeTab({ onDataChange }: RaeumeTabProps) {
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRaum, setSelectedRaum] = useState<Raeume | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const data = await LivingAppsService.getRaeume();
      setRaeume(data);
    } catch (error) {
      console.error("Error loading raeume:", error);
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
      if (selectedRaum) {
        await LivingAppsService.updateRaeumeEntry(selectedRaum.record_id, data);
      } else {
        await LivingAppsService.createRaeumeEntry(data);
      }
      await loadData();
      onDataChange?.();
      setDialogOpen(false);
      setSelectedRaum(null);
    } catch (error) {
      console.error("Error saving raum:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRaum) return;
    setSaving(true);
    try {
      await LivingAppsService.deleteRaeumeEntry(selectedRaum.record_id);
      await loadData();
      onDataChange?.();
      setDeleteDialogOpen(false);
      setSelectedRaum(null);
    } catch (error) {
      console.error("Error deleting raum:", error);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (raum: Raeume) => {
    setSelectedRaum(raum);
    setDialogOpen(true);
  };

  const openDelete = (raum: Raeume) => {
    setSelectedRaum(raum);
    setDeleteDialogOpen(true);
  };

  const openCreate = () => {
    setSelectedRaum(null);
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
        <h2 className="text-lg font-semibold">Räume ({raeume.length})</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Raum
        </Button>
      </div>

      {raeume.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <DoorOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Noch keine Räume vorhanden.</p>
          <p className="text-sm">Erstellen Sie einen neuen Raum, um zu beginnen.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Raumname</TableHead>
                <TableHead>Gebäude</TableHead>
                <TableHead>Kapazität</TableHead>
                <TableHead className="w-24">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {raeume.map((raum) => (
                <TableRow key={raum.record_id}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <DoorOpen className="h-4 w-4 text-primary" />
                      {raum.fields.raumname || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {raum.fields.gebaeude && (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Building className="h-3.5 w-3.5" />
                        {raum.fields.gebaeude}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      <Users className="h-3 w-3 mr-1" />
                      {raum.fields.kapazitaet || 0} Plätze
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(raum)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => openDelete(raum)}>
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
        title={selectedRaum ? "Raum bearbeiten" : "Neuer Raum"}
        fields={fields}
        initialData={selectedRaum?.fields}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Raum löschen"
        description={`Möchten Sie den Raum "${selectedRaum?.fields.raumname}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
