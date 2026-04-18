import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, CalendarDays, Users } from "lucide-react";

interface AttendanceStatsProps {
    stats: {
        present: number;
        leaves: number;
        halfDay: number;
    };
}

export function AttendanceStats({ stats }: AttendanceStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Present
                    </CardTitle>
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.present}</div>
                    <p className="text-xs text-muted-foreground">
                        Full day attendance
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Half Day
                    </CardTitle>
                    <CalendarDays className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.halfDay}</div>
                    <p className="text-xs text-muted-foreground">
                        Partial attendance
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        On Leave
                    </CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.leaves}</div>
                    <p className="text-xs text-muted-foreground">
                        Approved leaves
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
