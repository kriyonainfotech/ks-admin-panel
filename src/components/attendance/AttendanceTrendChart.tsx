"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceTrendChartProps {
    data: {
        date: string;
        present: number;
        leave: number;
    }[];
}

export function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <CardDescription>
                    Checking trends for the last 7 days.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar
                                dataKey="present"
                                name="Present"
                                fill="currentColor"
                                radius={[4, 4, 0, 0]}
                                className="fill-slate-900 dark:fill-slate-50"
                                stackId="a"
                            />
                            <Bar
                                dataKey="leave"
                                name="Leave"
                                fill="currentColor"
                                radius={[4, 4, 0, 0]}
                                className="fill-blue-500"
                                stackId="a"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
