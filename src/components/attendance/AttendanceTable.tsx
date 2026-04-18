import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AttendanceLog } from "@/src/types/attendanceTypes";
import { format } from "date-fns";

interface AttendanceTableProps {
    logs: AttendanceLog[];
}

export function AttendanceTable({ logs }: AttendanceTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance Logs</CardTitle>
                <CardDescription>
                    Full history of check-ins.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Check-in Time</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.slice(0, 50).map((log) => (
                            <TableRow key={log._id}>
                                <TableCell className="font-medium">
                                    <div>{log.user.name}</div>
                                    <div className="text-xs text-muted-foreground">{log.user.email}</div>
                                </TableCell>
                                <TableCell>{format(new Date(log.date), "MMM d, yyyy")}</TableCell>
                                <TableCell>{log.startTime}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            log.status === 'Leave' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                                log.status === 'Half Day' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                                                    'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                        }
                                    >
                                        {log.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                        {logs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
