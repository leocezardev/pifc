import { Analysis } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle, CheckCircle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisReportProps {
  analysis: Analysis;
}

export function AnalysisReport({ analysis }: AnalysisReportProps) {
  // Parse raw JSON if needed, assuming it matches the expected structure
  // For demo, we assume summary is text and points are in fields
  const data = [
    { name: "Contracted", points: analysis.totalPoints },
    { name: "Delivered", points: analysis.deliveredPoints },
  ];

  const discrepancy = analysis.totalPoints - analysis.deliveredPoints;
  const isMatch = Math.abs(discrepancy) < 0.1 * analysis.totalPoints; // 10% tolerance

  return (
    <div className="space-y-6 animate-enter">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracted Scope</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.totalPoints} <span className="text-sm font-normal text-muted-foreground">pts</span></div>
            <p className="text-xs text-muted-foreground">Estimated function points</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Scope</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.deliveredPoints} <span className="text-sm font-normal text-muted-foreground">pts</span></div>
            <p className="text-xs text-muted-foreground">Verified in code</p>
          </CardContent>
        </Card>

        <Card className={isMatch ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Discrepancy</CardTitle>
            <AlertTriangle className={isMatch ? "text-emerald-500" : "text-red-500"} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{discrepancy > 0 ? `-${discrepancy}` : `+${Math.abs(discrepancy)}`} <span className="text-sm font-normal text-muted-foreground">pts</span></div>
            <p className="text-xs text-muted-foreground">
              {isMatch ? "Within acceptable tolerance" : "Significant deviation detected"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Comparison Chart</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="points" radius={[4, 4, 0, 0]} barSize={60}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#94a3b8" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {analysis.summary.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF Report
        </Button>
      </div>
    </div>
  );
}
