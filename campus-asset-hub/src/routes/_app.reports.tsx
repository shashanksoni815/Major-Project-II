import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, BarChart3 } from "lucide-react";
import { useAMS } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports · AMS" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const labs = useAMS((s) => s.labs);
  const devices = useAMS((s) => s.devices);

  const labRows = labs.map((l) => {
    const ld = devices.filter((d) => d.labId === l.id);
    return {
      name: l.name,
      semester: l.semester,
      subject: l.subject,
      total: ld.reduce((a, d) => a + d.quantity, 0),
      working: ld.reduce((a, d) => a + d.workingQty, 0),
      nonWorking: ld.reduce((a, d) => a + d.nonWorkingQty, 0),
    };
  });

  function exportLabPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Lab-wise Asset Report", 14, 18);
    doc.setFontSize(10);
    doc.text("CDGI · ECE Department · Asset Management System", 14, 24);
    autoTable(doc, {
      startY: 32,
      head: [["Lab", "Sem", "Subject", "Total", "Working", "Non-working"]],
      body: labRows.map((r) => [r.name, `S${r.semester}`, r.subject, r.total, r.working, r.nonWorking]),
      headStyles: { fillColor: [212, 160, 23] },
      styles: { fontSize: 9 },
    });
    doc.save("lab-asset-report.pdf");
    toast.success("PDF downloaded");
  }

  function exportLabExcel() {
    const ws = XLSX.utils.json_to_sheet(labRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Labs");
    XLSX.writeFile(wb, "lab-asset-report.xlsx");
    toast.success("Excel downloaded");
  }

  function exportConditionPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Device Condition Report", 14, 18);
    autoTable(doc, {
      startY: 28,
      head: [["Device", "Lab", "Category", "Total", "Working", "Non-working", "Status"]],
      body: devices.map((d) => [
        d.name,
        labs.find((l) => l.id === d.labId)?.name ?? "—",
        d.category, d.quantity, d.workingQty, d.nonWorkingQty, d.status,
      ]),
      headStyles: { fillColor: [212, 160, 23] },
      styles: { fontSize: 8 },
    });
    doc.save("device-condition-report.pdf");
    toast.success("PDF downloaded");
  }

  function exportConditionExcel() {
    const rows = devices.map((d) => ({
      device: d.name,
      lab: labs.find((l) => l.id === d.labId)?.name ?? "—",
      category: d.category,
      total: d.quantity,
      working: d.workingQty,
      nonWorking: d.nonWorkingQty,
      status: d.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Condition");
    XLSX.writeFile(wb, "device-condition-report.xlsx");
    toast.success("Excel downloaded");
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Insights" title="Reports & Analytics" description="Export data across labs and devices in multiple formats." />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ReportCard
          title="Lab-wise Asset Report"
          description="Total, working and non-working device count per lab."
          onPDF={exportLabPDF}
          onExcel={exportLabExcel}
          delay={0}
        />
        <ReportCard
          title="Device Condition Report"
          description="All devices with status, category and quantities."
          onPDF={exportConditionPDF}
          onExcel={exportConditionExcel}
          delay={0.08}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <BarChart3 className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">Lab-wise Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Lab</th>
                <th className="px-3 py-3 text-left font-medium">Sem</th>
                <th className="px-3 py-3 text-right font-medium">Total</th>
                <th className="px-3 py-3 text-right font-medium">Working</th>
                <th className="px-3 py-3 text-right font-medium">Non-working</th>
                <th className="px-5 py-3 text-left font-medium">Health</th>
              </tr>
            </thead>
            <tbody>
              {labRows.map((r, i) => {
                const ratio = r.total ? r.working / r.total : 1;
                const tone = ratio >= 0.9 ? "success" : ratio >= 0.7 ? "warning" : "destructive";
                return (
                  <tr key={i} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{r.name}</td>
                    <td className="px-3 py-3">S{r.semester}</td>
                    <td className="px-3 py-3 text-right">{r.total}</td>
                    <td className="px-3 py-3 text-right text-success">{r.working}</td>
                    <td className="px-3 py-3 text-right text-destructive">{r.nonWorking}</td>
                    <td className="px-5 py-3">
                      <StatusPill tone={tone}>{Math.round(ratio * 100)}% healthy</StatusPill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function ReportCard({ title, description, onPDF, onExcel, delay }: { title: string; description: string; onPDF: () => void; onExcel: () => void; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
    >
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex gap-2">
        <button onClick={onPDF} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm hover:border-gold">
          <FileText className="h-4 w-4 text-destructive" /> Export PDF
        </button>
        <button onClick={onExcel} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm hover:border-gold">
          <FileSpreadsheet className="h-4 w-4 text-success" /> Export Excel
        </button>
      </div>
    </motion.div>
  );
}
