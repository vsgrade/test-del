
import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "./chart";
import {
  Bar,
  Line,
  Pie,
  ComposedChart,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

// Типы для данных и конфигурации графиков
type ChartDataItem = Record<string, any>;
type ChartData = ChartDataItem[];

interface BaseChartProps {
  className?: string;
  data: ChartData;
  valueFormatter?: (value: number) => string;
}

interface CartesianChartProps extends BaseChartProps {
  index: string;
  categories: string[];
  colors?: string[];
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  yAxisWidth?: number;
}

interface PieChartProps extends BaseChartProps {
  category: string;
  index: string;
  colors?: string[];
  showLegend?: boolean;
}

// Преобразование массива категорий в цветовую схему
const DEFAULT_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet 
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#ef4444", // red
  "#22c55e", // green
  "#3b82f6", // blue
  "#d946ef", // fuchsia
];

// Компонент гистограммы (столбчатый график)
export const BarChart = ({
  className,
  data,
  index,
  categories,
  colors = DEFAULT_COLORS,
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
  yAxisWidth = 56,
}: CartesianChartProps) => {
  const config = categories.reduce<Record<string, { color?: string }>>(
    (acc, category, idx) => {
      acc[category] = { color: colors[idx % colors.length] };
      return acc;
    },
    {}
  );

  return (
    <ChartContainer className={className} config={config}>
      <RechartsBarChart data={data} layout="horizontal" barGap={4}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
          />
        )}
        {showXAxis && <XAxis dataKey={index} />}
        {showYAxis && <YAxis width={yAxisWidth} />}
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => value}
              formatter={(value, name) => [valueFormatter(value as number), name]}
            />
          }
        />
        {showLegend && (
          <Legend
            content={<ChartLegendContent verticalAlign="bottom" />}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        )}
        {categories.map((category, index) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
};

// Компонент линейного графика
export const LineChart = ({
  className,
  data,
  index,
  categories,
  colors = DEFAULT_COLORS,
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
  yAxisWidth = 56,
}: CartesianChartProps) => {
  const config = categories.reduce<Record<string, { color?: string }>>(
    (acc, category, idx) => {
      acc[category] = { color: colors[idx % colors.length] };
      return acc;
    },
    {}
  );

  return (
    <ChartContainer className={className} config={config}>
      <RechartsLineChart data={data}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
          />
        )}
        {showXAxis && <XAxis dataKey={index} />}
        {showYAxis && <YAxis width={yAxisWidth} />}
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => value}
              formatter={(value, name) => [valueFormatter(value as number), name]}
            />
          }
        />
        {showLegend && (
          <Legend
            content={<ChartLegendContent verticalAlign="bottom" />}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        )}
        {categories.map((category, index) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[index % colors.length]}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
};

// Компонент кольцевой диаграммы
export const DonutChart = ({
  className,
  data,
  index,
  category,
  colors = DEFAULT_COLORS,
  valueFormatter = (value) => `${value}`,
  showLegend = true,
}: PieChartProps) => {
  const config = data.reduce<Record<string, { color?: string }>>(
    (acc, item, idx) => {
      const indexValue = item[index] as string;
      acc[indexValue] = { color: colors[idx % colors.length] };
      return acc;
    },
    {}
  );

  return (
    <ChartContainer className={className} config={config}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey={category}
          nameKey={index}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
          ))}
        </Pie>
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelKey={index}
              formatter={(value) => valueFormatter(value as number)}
            />
          }
        />
        {showLegend && (
          <Legend
            content={<ChartLegendContent nameKey={index} verticalAlign="bottom" />}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        )}
      </RechartsPieChart>
    </ChartContainer>
  );
};
