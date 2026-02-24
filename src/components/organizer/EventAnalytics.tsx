"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DollarSign, Ticket, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EventTicketType, PublishedEvent } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PulseCard } from "@/components/organizer/PulseCard";
import { TicketRevenueRow } from "@/components/organizer/TicketRevenueRow";
import { fetchEventAnalytics } from "@/app/actions/analytics";
import { format, differenceInDays, startOfDay } from "date-fns";
import type { SalesHistoryItem, RecentOrder, OperationsMetrics } from "@/lib/backend-client";

interface EventAnalyticsProps {
    eventId: string;
    ticketTypes: EventTicketType[];
    event?: PublishedEvent;
}

export function EventAnalytics({ eventId, ticketTypes, event }: EventAnalyticsProps) {
    const [salesHistory, setSalesHistory] = useState<SalesHistoryItem[]>([]);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [operations, setOperations] = useState<OperationsMetrics>({ checkedInCount: 0, totalSold: 0, noShowRate: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await fetchEventAnalytics(eventId);
                if (mounted && data) {
                    setSalesHistory(data.salesHistory);
                    setRecentOrders(data.orders);
                    setOperations(data.operations);
                }
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [eventId]);

    // Core Metrics (Derived from TicketTypes which are passed as props and accurate)
    const totalRevenue = ticketTypes.reduce((acc, t) => acc + (t.soldCount * t.price), 0);
    const totalTicketsSold = ticketTypes.reduce((acc, t) => acc + t.soldCount, 0);
    const totalCapacity = ticketTypes.reduce((acc, t) => acc + t.totalQuantity, 0);
    const percentSold = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0;

    const checkedInCount = operations.checkedInCount ?? 0;
    const noShowRate = operations.noShowRate ?? 0;

    // Days Until Event Calculation
    const getDaysRemaining = () => {
        if (!event?.startTime) return { value: "—", subtext: "TBD" };
        const start = new Date(event.startTime);
        if (isNaN(start.getTime())) return { value: "—", subtext: "TBD" };

        const now = new Date();
        const days = differenceInDays(startOfDay(start), startOfDay(now));
        const dateStr = format(start, "MMM d, yyyy");

        if (days < 0) return { value: "Completed", subtext: `Event date: ${dateStr}` };
        if (days === 0) return { value: "Today", subtext: `Event date: ${dateStr}` };
        return { value: `${days} Day${days > 1 ? 's' : ''}`, subtext: `Event date: ${dateStr}` };
    };

    const daysInfo = getDaysRemaining();

    // Use sales-history from API; if empty but we have sales, show a synthetic point so the chart isn't blank
    const trendData = useMemo(() => {
        if (salesHistory.length > 0) return salesHistory;
        if (totalTicketsSold > 0 || totalRevenue > 0) {
            const today = format(new Date(), "yyyy-MM-dd");
            return [{ date: today, revenue: totalRevenue, sales: totalTicketsSold }];
        }
        return [];
    }, [salesHistory, totalRevenue, totalTicketsSold]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <h2 className="text-xl font-bold text-white">Event Performance</h2>

            {/* Tier 1: The "Pulse" (Top Row) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PulseCard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtext="Gross sales across all ticket types"
                    icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
                />
                <PulseCard
                    title="Tickets Sold"
                    value={`${totalTicketsSold} / ${totalCapacity}`}
                    subtext={`${percentSold}% of total capacity filled`}
                    icon={<Ticket className="w-6 h-6 text-blue-400" />}
                />
                <PulseCard
                    title="Days Until Event"
                    value={daysInfo.value}
                    subtext={daysInfo.subtext}
                    icon={<Calendar className="w-6 h-6 text-purple-400" />}
                />
            </div>

            {/* Tier 1 & 4: Sales Velocity & Attribution (Middle Section) */}
            <Card className="bg-[var(--color-surface)] border-white/10 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-white/5 pb-0">
                    <div className="flex items-center justify-between mb-4">
                        <CardTitle className="text-white flex items-center gap-2">
                            Sales Trends
                            {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                        </CardTitle>
                        <Select defaultValue="30">
                            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Last 30 Days" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 Days</SelectItem>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="90">Last 3 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <Tabs defaultValue="revenue" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-black/20 mb-6">
                            <TabsTrigger value="revenue" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Revenue Over Time</TabsTrigger>
                            <TabsTrigger value="sales" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Ticket Sales Volume</TabsTrigger>
                        </TabsList>

                        <TabsContent value="revenue" className="h-[300px] w-full mt-0">
                            {trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300} minHeight={300}>
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} itemStyle={{ color: '#10b981' }} formatter={(value: any) => [`$${value}`, "Revenue"]} />
                                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-white/5 rounded-lg border border-dashed border-white/10">
                                    <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                                    <p>No sales history available yet</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="sales" className="h-[300px] w-full mt-0">
                            {trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300} minHeight={300}>
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} itemStyle={{ color: '#3b82f6' }} formatter={(value: any) => [value, "Tickets"]} />
                                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-white/5 rounded-lg border border-dashed border-white/10">
                                    <Ticket className="w-8 h-8 mb-2 opacity-50" />
                                    <p>No sales data available yet</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Tier 2 & 3: Breakdown (Bottom Section) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Revenue by Ticket Type */}
                <Card className="bg-[var(--color-surface)] border-white/10 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Revenue by Ticket Type</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {ticketTypes.map((ticket) => (
                            <TicketRevenueRow key={ticket.id} ticket={ticket} totalRevenue={totalRevenue} />
                        ))}
                        {ticketTypes.length === 0 && (
                            <p className="text-slate-500">No ticket types defined.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Operations & Live Metrics */}
                <div className="space-y-6">
                    {/* Live Check-in Pulse */}
                    <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-white/10 shadow-xl overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-sm uppercase tracking-wider flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Live Operations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 rounded-xl p-4">
                                <p className="text-xs text-slate-400 mb-1">Real-Time Check-ins</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-2xl font-bold text-white">{checkedInCount}</p>
                                    <span className="text-xs text-slate-500 mb-1">/ {totalTicketsSold}</span>
                                </div>
                                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                    {checkedInCount > 0 ? <TrendingUp className="w-3 h-3" /> : null}
                                    {checkedInCount > 0 ? "Active" : "Waiting for guests"}
                                </p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-4">
                                <p className="text-xs text-slate-400 mb-1">No-Show Rate</p>
                                <p className="text-2xl font-bold text-white">{noShowRate}%</p>
                                <p className="text-xs text-slate-500 mt-1">Projected: 10-15%</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Orders List */}
                    <Card className="bg-[var(--color-surface)] border-white/10 shadow-xl flex-1">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center justify-between">
                                Recent Orders
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 hover:bg-emerald-500/20">Live</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentOrders.length > 0 ? recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white">
                                            {order.user.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{order.user}</p>
                                            <p className="text-xs text-slate-400">{order.ticket}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-400">+${order.amount.toFixed(2)}</p>
                                        <p className="text-[10px] text-slate-500">{order.time || order.timestamp}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-slate-500 border border-dashed border-white/5 rounded-lg bg-white/[0.02]">
                                    <p className="text-sm">No recent orders found.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

