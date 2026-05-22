import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  FlaskConical, HardDrive, CheckCircle2, AlertTriangle, Users,
  ArrowUpRight, ArrowLeftRight, Plus,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAMS } from "@/lib/store";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · AMS · CDGI ECE" }] }),
  component: Dashboard,
});

function Dashboard() {
  const labs = useAMS((s) => s.labs);
  const devices = useAMS((s) => s.devices);
  const staff = useAMS((s) => s.staff);
  const activities = useAMS((s) => s.activities);

  const totals = useMemo(() => {
    const totalAssets = devices.reduce((a, d) => a + d.quantity, 0);
    const working = devices.reduce((a, d) => a + d.workingQty, 0);
    const nonWorking = devices.reduce((a, d) => a + d.nonWorkingQty, 0);
    return { totalAssets, working, nonWorking };
  }, [devices]);

  const perLab = useMemo(() => labs.map((l) => ({
    name: l.name.replace(/ Lab$/, ""),
    assets: devices.filter((d) => d.labId === l.id).reduce((a, d) => a + d.quantity, 0),
  })), [labs, devices]);

  const conditionData = [
    { name: "Working", value: totals.working },
    { name: "Non-working", value: totals.nonWorking },
  ];
  const COLORS = ["var(--success)", "var(--destructive)"];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={<>● Live overview</>}
        title="Department Control Center"
        description="A single pane of glass for every lab, device and staff member across the ECE department."
        actions={
          <>
            <Link to="/labs/new" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:border-gold">
              <Plus className="h-4 w-4" /> Add Lab
            </Link>
            <Link to="/transfers" className="inline-flex items-center gap-2 rounded-lg gold-gradient px-4 py-2 text-sm font-semibold text-charcoal shadow shadow-gold/30 hover:shadow-gold/50">
              <ArrowLeftRight className="h-4 w-4" /> New Transfer
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Labs" value={labs.length} icon={<FlaskConical className="h-5 w-5" />} accent="gold" delay={0.0} hint="ECE Curriculum · RGPV" />
        <StatCard label="Total Assets" value={totals.totalAssets} icon={<HardDrive className="h-5 w-5" />} accent="default" delay={0.05} hint={`${devices.length} unique devices`} />
        <StatCard label="Working" value={totals.working} icon={<CheckCircle2 className="h-5 w-5" />} accent="success" delay={0.1} />
        <StatCard label="Non-working" value={totals.nonWorking} icon={<AlertTriangle className="h-5 w-5" />} accent="destructive" delay={0.15} />
        <StatCard label="Total Staff" value={staff.length} icon={<Users className="h-5 w-5" />} accent="warning" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Assets per Lab</h3>
              <p className="text-xs text-muted-foreground">Distribution across all departmental labs</p>
            </div>
            <Link to="/reports" className="inline-flex items-center gap-1 text-xs text-gold hover:underline">View report <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={perLab} margin={{ left: -10, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="goldBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="var(--gold)" stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={0} angle={-30} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip
                cursor={{ fill: "color-mix(in oklab, var(--gold) 12%, transparent)" }}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="assets" fill="url(#goldBar)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="mb-4">
            <h3 className="font-display text-lg font-semibold">Condition Snapshot</h3>
            <p className="text-xs text-muted-foreground">Working vs non-working units</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={conditionData} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={4} stroke="none">
                {conditionData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-center gap-6 text-xs">
            <span><span className="font-display text-2xl font-semibold text-success">{Math.round((totals.working / Math.max(1, totals.working + totals.nonWorking)) * 100)}%</span><br /><span className="text-muted-foreground">Working</span></span>
          </div>
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-display text-lg font-semibold">Recent Activity</h3>
            <p className="text-xs text-muted-foreground">Latest changes across labs, devices and transfers</p>
          </div>
        </div>
        <ul className="divide-y divide-border">
          {activities.slice(0, 8).map((a, i) => (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: i * 0.04 }}
              className="flex items-center gap-4 px-5 py-3"
            >
              <StatusPill tone={a.type === "delete" ? "destructive" : a.type === "transfer" ? "gold" : a.type === "create" ? "success" : "warning"}>
                {a.type}
              </StatusPill>
              <span className="flex-1 text-sm">{a.message}</span>
              <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.date), { addSuffix: true })}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
