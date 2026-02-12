import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/StatCard";
import { KurseTab } from "@/components/tabs/KurseTab";
import { DozentenTab } from "@/components/tabs/DozentenTab";
import { TeilnehmerTab } from "@/components/tabs/TeilnehmerTab";
import { RaeumeTab } from "@/components/tabs/RaeumeTab";
import { AnmeldungenTab } from "@/components/tabs/AnmeldungenTab";
import { LivingAppsService, extractRecordId } from "@/services/livingAppsService";
import type { Kurse, Dozenten, Teilnehmer, Raeume, Anmeldungen } from "@/types/app";
import { BookOpen, GraduationCap, Users, DoorOpen, Euro, ClipboardList } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  kurse: number;
  dozenten: number;
  teilnehmer: number;
  raeume: number;
  anmeldungen: number;
  revenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    kurse: 0,
    dozenten: 0,
    teilnehmer: 0,
    raeume: 0,
    anmeldungen: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [kurseData, dozentenData, teilnehmerData, raeumeData, anmeldungenData] = await Promise.all([
        LivingAppsService.getKurse(),
        LivingAppsService.getDozenten(),
        LivingAppsService.getTeilnehmer(),
        LivingAppsService.getRaeume(),
        LivingAppsService.getAnmeldungen(),
      ]) as [Kurse[], Dozenten[], Teilnehmer[], Raeume[], Anmeldungen[]];

      // Calculate revenue from paid enrollments
      const paidAnmeldungen = anmeldungenData.filter(a => a.fields.bezahlt);
      let totalRevenue = 0;
      paidAnmeldungen.forEach(anmeldung => {
        const kursId = extractRecordId(anmeldung.fields.kurs);
        const kurs = kurseData.find(k => k.record_id === kursId);
        if (kurs?.fields.preis) {
          totalRevenue += kurs.fields.preis;
        }
      });

      setStats({
        kurse: kurseData.length,
        dozenten: dozentenData.length,
        teilnehmer: teilnehmerData.length,
        raeume: raeumeData.length,
        anmeldungen: anmeldungenData.length,
        revenue: totalRevenue,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleDataChange = () => {
    loadStats();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Kursverwaltung</h1>
              <p className="text-muted-foreground text-sm">
                Verwalten Sie Kurse, Dozenten, Teilnehmer und Anmeldungen
              </p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Aktive Kurse"
                value={stats.kurse}
                icon={BookOpen}
                variant="primary"
              />
              <StatCard
                title="Anmeldungen"
                value={stats.anmeldungen}
                subtitle={`${stats.teilnehmer} Teilnehmer`}
                icon={ClipboardList}
                variant="default"
              />
              <StatCard
                title="Dozenten"
                value={stats.dozenten}
                icon={Users}
                variant="default"
              />
              <StatCard
                title="Einnahmen"
                value={`${stats.revenue.toLocaleString("de-DE")} €`}
                subtitle="Aus bezahlten Anmeldungen"
                icon={Euro}
                variant="accent"
              />
            </>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="kurse" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="kurse" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Kurse</span>
            </TabsTrigger>
            <TabsTrigger value="dozenten" className="gap-1.5">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Dozenten</span>
            </TabsTrigger>
            <TabsTrigger value="teilnehmer" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Teilnehmer</span>
            </TabsTrigger>
            <TabsTrigger value="raeume" className="gap-1.5">
              <DoorOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Räume</span>
            </TabsTrigger>
            <TabsTrigger value="anmeldungen" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Anmeldungen</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kurse">
            <KurseTab onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="dozenten">
            <DozentenTab onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="teilnehmer">
            <TeilnehmerTab onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="raeume">
            <RaeumeTab onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="anmeldungen">
            <AnmeldungenTab onDataChange={handleDataChange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
