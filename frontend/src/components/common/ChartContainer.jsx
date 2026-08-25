import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";

import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";

/**
 * Chart card used across Dashboard and Reports. Renders a real Recharts
 * chart when `data` has entries, and an EmptyState when it doesn't --
 * which, until the reports API is connected, is always. This keeps the
 * chart genuinely wired for Recharts while never fabricating analytics.
 *
 * @param {string} title
 * @param {string} [description]
 * @param {Array<object>} [data]
 * @param {"bar"|"line"} [type]
 * @param {string} [dataKey]
 * @param {string} [xKey]
 * @param {boolean} [isLoading]
 * @param {number} [height]
 */
export function ChartContainer({
  title,
  description,
  data = [],
  type = "bar",
  dataKey = "value",
  xKey = "label",
  isLoading = false,
  height = 260,
}) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card>
      <Card.Header>
        <div>
          <h2 className="font-display text-base font-semibold text-text-primary">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-text-muted">{description}</p>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <Skeleton style={{ height }} className="w-full" />
        ) : hasData ? (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              {type === "line" ? (
                <LineChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgb(var(--color-border))"
                  />
                  <XAxis
                    dataKey={xKey}
                    stroke="rgb(var(--color-text-muted))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgb(var(--color-text-muted))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke="rgb(var(--color-primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgb(var(--color-border))"
                  />
                  <XAxis
                    dataKey={xKey}
                    stroke="rgb(var(--color-text-muted))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgb(var(--color-text-muted))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar
                    dataKey={dataKey}
                    fill="rgb(var(--color-primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No data yet"
            description="This chart will populate once workout data is available from the API."
            className="border-none bg-transparent py-10"
          />
        )}
      </Card.Body>
    </Card>
  );
}
