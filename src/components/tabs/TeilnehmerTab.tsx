import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EntityDialog, type FieldConfig } from "@/components/EntityDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LivingAppsService } from "@/services/livingAppsService";
import type { Teilnehmer } from "@/types/app";
import { Plus, Pencil, Trash2, Mail, Phone, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

const fields: FieldConfig[] = [
  { key: "name", label: "Name", type: "text", required: true, placeholder: "Max Mustermann" },
  { key: "email", label: "E-Mail", type: "email", required: true, placeholder: "max@example.de" },
  { key: "phone", label: "Telefon", type: "text", placeholder: "+49 123 456789" },
  { key: "geburtsdatum", label: "Geburtsdatum", type: "date" },
];

interface TeilnehmerTabProps {
  onDataChange?: () => void;
}

export function TeilnehmerTab({ onDataChange }: TeilnehmerTabProps) {
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeilnehmer, setSelectedTeilnehmer] = useState<Teilnehmer | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const data = await LivingAppsService.getTeilnehmer();
      setTeilnehmer(data);
    } catch (error) {
      console.error("Error loading teilnehmer:", error);
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
      if (selectedTeilnehmer) {
        await LivingAppsService.updateTeilnehmerEntry(selectedTeilnehmer.record_id, data);
      } else {
        await LivingAppsService.createTeilnehmerEntry(data);
      }
      await loadData();
      onDataChange?.();
      setDialogOpen(false);
      setSelectedTeilnehmer(null);
    } catch (error) {
      console.error("Error saving teilnehmer:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeilnehmer) return;
    setSaving(true);
    try {
      await LivingAppsService.deleteTeilnehmerEntry(selectedTeilnehmer.record_id);
      await loadData();
      onDataChange?.();
      setDeleteDialogOpen(false);
      setSelectedTeilnehmer(null);
    } catch (error) {
      console.error("Error deleting teilnehmer:", error);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (t: Teilnehmer) => {
    setSelectedTeilnehmer(t);
    setDialogOpen(true);
  };

  const openDelete = (t: Teilnehmer) => {
    setSelectedTeilnehmer(t);
    setDeleteDialogOpen(true);
  };

  const openCreate = () => {
    setSelectedTeilnehmer(null);
    setDialogOpen(true);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    try {
      return format(parseISO(dateStr), "dd.MM.yyyy", { locale: de });
    } catch {
      return dateStr;
    }
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
        <h2 className="text-lg font-semibold">Teilnehmer ({teilnehmer.length})</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Teilnehmer
        </Button>
      </div>

      {teilnehmer.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Noch keine Teilnehmer vorhanden.</p>
          <p className="text-sm">Erstellen Sie einen neuen Teilnehmer, um zu beginnen.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Geburtsdatum</TableHead>
                <TableHead className="w-24">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teilnehmer.map((t) => (
                <TableRow key={t.record_id}>
                  <TableCell className="font-medium">{t.fields.name || "-"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {t.fields.email || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {t.fields.phone && (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {t.fields.phone}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(t.fields.geburtsdatum)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => openDelete(t)}>
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
        title={selectedTeilnehmer ? "Teilnehmer bearbeiten" : "Neuer Teilnehmer"}
        fields={fields}
        initialData={selectedTeilnehmer?.fields}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Teilnehmer löschen"
        description={`Möchten Sie den Teilnehmer "${selectedTeilnehmer?.fields.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
