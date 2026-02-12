import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EntityDialog, type FieldConfig } from "@/components/EntityDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LivingAppsService, extractRecordId, createRecordUrl } from "@/services/livingAppsService";
import { APP_IDS } from "@/types/app";
import type { Anmeldungen, Teilnehmer, Kurse } from "@/types/app";
import { Plus, Pencil, Trash2, ClipboardList, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface AnmeldungenTabProps {
  onDataChange?: () => void;
}

export function AnmeldungenTab({ onDataChange }: AnmeldungenTabProps) {
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnmeldung, setSelectedAnmeldung] = useState<Anmeldungen | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [anmeldungData, teilnehmerData, kursData] = await Promise.all([
        LivingAppsService.getAnmeldungen(),
        LivingAppsService.getTeilnehmer(),
        LivingAppsService.getKurse(),
      ]);
      setAnmeldungen(anmeldungData);
      setTeilnehmer(teilnehmerData);
      setKurse(kursData);
    } catch (error) {
      console.error("Error loading anmeldungen:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFields = (): FieldConfig[] => [
    {
      key: "teilnehmer",
      label: "Teilnehmer",
      type: "select",
      required: true,
      options: teilnehmer.map(t => ({ value: t.record_id, label: t.fields.name || "Unbekannt" }))
    },
    {
      key: "kurs",
      label: "Kurs",
      type: "select",
      required: true,
      options: kurse.map(k => ({ value: k.record_id, label: k.fields.titel || "Unbekannt" }))
    },
    { key: "anmeldedatum", label: "Anmeldedatum", type: "date", required: true },
    { key: "bezahlt", label: "Bezahlt", type: "checkbox" },
  ];

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const processedData = { ...data };

      // Convert teilnehmer ID to URL
      if (processedData.teilnehmer && typeof processedData.teilnehmer === "string" && processedData.teilnehmer !== "none") {
        processedData.teilnehmer = createRecordUrl(APP_IDS.TEILNEHMER, processedData.teilnehmer as string);
      } else {
        processedData.teilnehmer = null;
      }

      // Convert kurs ID to URL
      if (processedData.kurs && typeof processedData.kurs === "string" && processedData.kurs !== "none") {
        processedData.kurs = createRecordUrl(APP_IDS.KURSE, processedData.kurs as string);
      } else {
        processedData.kurs = null;
      }

      if (selectedAnmeldung) {
        await LivingAppsService.updateAnmeldungenEntry(selectedAnmeldung.record_id, processedData);
      } else {
        await LivingAppsService.createAnmeldungenEntry(processedData);
      }
      await loadData();
      onDataChange?.();
      setDialogOpen(false);
      setSelectedAnmeldung(null);
    } catch (error) {
      console.error("Error saving anmeldung:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAnmeldung) return;
    setSaving(true);
    try {
      await LivingAppsService.deleteAnmeldungenEntry(selectedAnmeldung.record_id);
      await loadData();
      onDataChange?.();
      setDeleteDialogOpen(false);
      setSelectedAnmeldung(null);
    } catch (error) {
      console.error("Error deleting anmeldung:", error);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (anmeldung: Anmeldungen) => {
    setSelectedAnmeldung(anmeldung);
    setDialogOpen(true);
  };

  const openDelete = (anmeldung: Anmeldungen) => {
    setSelectedAnmeldung(anmeldung);
    setDeleteDialogOpen(true);
  };

  const openCreate = () => {
    setSelectedAnmeldung(null);
    setDialogOpen(true);
  };

  const getTeilnehmerName = (url: string | undefined) => {
    if (!url) return "-";
    const id = extractRecordId(url);
    const t = teilnehmer.find(t => t.record_id === id);
    return t?.fields.name || "-";
  };

  const getKursTitel = (url: string | undefined) => {
    if (!url) return "-";
    const id = extractRecordId(url);
    const k = kurse.find(k => k.record_id === id);
    return k?.fields.titel || "-";
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    try {
      return format(parseISO(dateStr), "dd.MM.yyyy", { locale: de });
    } catch {
      return dateStr;
    }
  };

  const getInitialData = () => {
    if (!selectedAnmeldung) return undefined;
    return {
      ...selectedAnmeldung.fields,
      teilnehmer: extractRecordId(selectedAnmeldung.fields.teilnehmer) || "",
      kurs: extractRecordId(selectedAnmeldung.fields.kurs) || "",
    };
  };

  const toggleBezahlt = async (anmeldung: Anmeldungen) => {
    try {
      await LivingAppsService.updateAnmeldungenEntry(anmeldung.record_id, {
        bezahlt: !anmeldung.fields.bezahlt
      });
      await loadData();
      onDataChange?.();
    } catch (error) {
      console.error("Error toggling bezahlt:", error);
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
        <h2 className="text-lg font-semibold">Anmeldungen ({anmeldungen.length})</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Anmeldung
        </Button>
      </div>

      {anmeldungen.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Noch keine Anmeldungen vorhanden.</p>
          <p className="text-sm">Erstellen Sie eine neue Anmeldung, um zu beginnen.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teilnehmer</TableHead>
                <TableHead>Kurs</TableHead>
                <TableHead>Anmeldedatum</TableHead>
                <TableHead>Bezahlt</TableHead>
                <TableHead className="w-24">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anmeldungen.map((anmeldung) => (
                <TableRow key={anmeldung.record_id}>
                  <TableCell className="font-medium">
                    {getTeilnehmerName(anmeldung.fields.teilnehmer)}
                  </TableCell>
                  <TableCell>{getKursTitel(anmeldung.fields.kurs)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(anmeldung.fields.anmeldedatum)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleBezahlt(anmeldung)}
                      className="cursor-pointer focus:outline-none"
                    >
                      {anmeldung.fields.bezahlt ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Bezahlt
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Offen
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(anmeldung)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => openDelete(anmeldung)}>
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
        title={selectedAnmeldung ? "Anmeldung bearbeiten" : "Neue Anmeldung"}
        fields={getFields()}
        initialData={getInitialData()}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Anmeldung löschen"
        description="Möchten Sie diese Anmeldung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
