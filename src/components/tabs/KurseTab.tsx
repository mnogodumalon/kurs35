import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EntityDialog, type FieldConfig } from "@/components/EntityDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LivingAppsService, extractRecordId, createRecordUrl } from "@/services/livingAppsService";
import { APP_IDS } from "@/types/app";
import type { Kurse, Dozenten, Raeume, Anmeldungen } from "@/types/app";
import { Plus, Pencil, Trash2, BookOpen, Calendar, Users, Euro } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface KurseTabProps {
  onDataChange?: () => void;
}

export function KurseTab({ onDataChange }: KurseTabProps) {
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKurs, setSelectedKurs] = useState<Kurse | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [kursData, dozentData, raumData, anmeldungData] = await Promise.all([
        LivingAppsService.getKurse(),
        LivingAppsService.getDozenten(),
        LivingAppsService.getRaeume(),
        LivingAppsService.getAnmeldungen(),
      ]);
      setKurse(kursData);
      setDozenten(dozentData);
      setRaeume(raumData);
      setAnmeldungen(anmeldungData);
    } catch (error) {
      console.error("Error loading kurse:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFields = (): FieldConfig[] => [
    { key: "titel", label: "Titel", type: "text", required: true, placeholder: "Einführung in Python" },
    { key: "beschreibung", label: "Beschreibung", type: "textarea", placeholder: "Kursbeschreibung..." },
    { key: "startdatum", label: "Startdatum", type: "date", required: true },
    { key: "enddatum", label: "Enddatum", type: "date", required: true },
    { key: "max_teilnehmer", label: "Max. Teilnehmer", type: "number", required: true, placeholder: "20" },
    { key: "preis", label: "Preis (€)", type: "number", placeholder: "299" },
    {
      key: "dozent",
      label: "Dozent",
      type: "select",
      required: true,
      options: dozenten.map(d => ({ value: d.record_id, label: d.fields.name || "Unbekannt" }))
    },
    {
      key: "raum",
      label: "Raum",
      type: "select",
      options: raeume.map(r => ({
        value: r.record_id,
        label: `${r.fields.raumname || "Unbekannt"}${r.fields.gebaeude ? ` (${r.fields.gebaeude})` : ""}`
      }))
    },
  ];

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const processedData = { ...data };

      // Convert dozent ID to URL
      if (processedData.dozent && typeof processedData.dozent === "string" && processedData.dozent !== "none") {
        processedData.dozent = createRecordUrl(APP_IDS.DOZENTEN, processedData.dozent as string);
      } else {
        processedData.dozent = null;
      }

      // Convert raum ID to URL
      if (processedData.raum && typeof processedData.raum === "string" && processedData.raum !== "none") {
        processedData.raum = createRecordUrl(APP_IDS.RAEUME, processedData.raum as string);
      } else {
        processedData.raum = null;
      }

      if (selectedKurs) {
        await LivingAppsService.updateKurseEntry(selectedKurs.record_id, processedData);
      } else {
        await LivingAppsService.createKurseEntry(processedData);
      }
      await loadData();
      onDataChange?.();
      setDialogOpen(false);
      setSelectedKurs(null);
    } catch (error) {
      console.error("Error saving kurs:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedKurs) return;
    setSaving(true);
    try {
      await LivingAppsService.deleteKurseEntry(selectedKurs.record_id);
      await loadData();
      onDataChange?.();
      setDeleteDialogOpen(false);
      setSelectedKurs(null);
    } catch (error) {
      console.error("Error deleting kurs:", error);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (kurs: Kurse) => {
    setSelectedKurs(kurs);
    setDialogOpen(true);
  };

  const openDelete = (kurs: Kurse) => {
    setSelectedKurs(kurs);
    setDeleteDialogOpen(true);
  };

  const openCreate = () => {
    setSelectedKurs(null);
    setDialogOpen(true);
  };

  const getDozentName = (dozentUrl: string | undefined) => {
    if (!dozentUrl) return "-";
    const id = extractRecordId(dozentUrl);
    const dozent = dozenten.find(d => d.record_id === id);
    return dozent?.fields.name || "-";
  };

  const getRaumName = (raumUrl: string | undefined) => {
    if (!raumUrl) return "-";
    const id = extractRecordId(raumUrl);
    const raum = raeume.find(r => r.record_id === id);
    if (!raum) return "-";
    return `${raum.fields.raumname}${raum.fields.gebaeude ? ` (${raum.fields.gebaeude})` : ""}`;
  };

  const getEnrollmentCount = (kursId: string) => {
    return anmeldungen.filter(a => extractRecordId(a.fields.kurs) === kursId).length;
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
    if (!selectedKurs) return undefined;
    return {
      ...selectedKurs.fields,
      dozent: extractRecordId(selectedKurs.fields.dozent) || "",
      raum: extractRecordId(selectedKurs.fields.raum) || "",
    };
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
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Kurse ({kurse.length})</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Kurs
        </Button>
      </div>

      {kurse.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Noch keine Kurse vorhanden.</p>
          <p className="text-sm">Erstellen Sie einen neuen Kurs, um zu beginnen.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kurs</TableHead>
                <TableHead>Dozent</TableHead>
                <TableHead>Zeitraum</TableHead>
                <TableHead>Raum</TableHead>
                <TableHead>Belegung</TableHead>
                <TableHead>Preis</TableHead>
                <TableHead className="w-24">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kurse.map((kurs) => {
                const enrolled = getEnrollmentCount(kurs.record_id);
                const maxTn = kurs.fields.max_teilnehmer || 0;
                const progress = maxTn > 0 ? (enrolled / maxTn) * 100 : 0;

                return (
                  <TableRow key={kurs.record_id}>
                    <TableCell>
                      <div className="font-medium">{kurs.fields.titel || "-"}</div>
                      {kurs.fields.beschreibung && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {kurs.fields.beschreibung}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getDozentName(kurs.fields.dozent)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDate(kurs.fields.startdatum)} - {formatDate(kurs.fields.enddatum)}
                      </span>
                    </TableCell>
                    <TableCell>{getRaumName(kurs.fields.raum)}</TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[120px]">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            {enrolled} / {maxTn}
                          </span>
                          <span className="text-muted-foreground">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      {kurs.fields.preis ? (
                        <Badge variant="secondary" className="font-normal">
                          <Euro className="h-3 w-3 mr-0.5" />
                          {kurs.fields.preis}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(kurs)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => openDelete(kurs)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selectedKurs ? "Kurs bearbeiten" : "Neuer Kurs"}
        fields={getFields()}
        initialData={getInitialData()}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Kurs löschen"
        description={`Möchten Sie den Kurs "${selectedKurs?.fields.titel}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
