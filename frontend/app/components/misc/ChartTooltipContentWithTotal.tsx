import { useTranslation } from "~/i18n/i18n";
import { ChartTooltipContent } from "../shadcn/ui/chart";

type ChartTooltipContentWithTotalProps = React.ComponentProps<
  typeof ChartTooltipContent
> & {
  // Ex : currency formatting, applied to every row including the total
  valueFormatter?: (value: number) => string;
  // The total row is useless with a single series
  showTotal?: boolean;
};

// Custom tooltip content wrapping shadcn's default, adding a total row
export function ChartTooltipContentWithTotal({
  payload,
  valueFormatter,
  showTotal = true,
  ...props
}: ChartTooltipContentWithTotalProps) {
  const { t } = useTranslation();

  const total =
    payload?.reduce((sum, item) => sum + (item.value as number), 0) ?? 0;

  const format = (value: unknown) =>
    valueFormatter && typeof value === "number" ? valueFormatter(value) : value;

  const formattedPayload = payload?.map((item) => ({
    ...item,
    value: format(item.value),
  }));

  const payloadWithTotal =
    formattedPayload && showTotal
      ? [
          ...formattedPayload,
          {
            ...formattedPayload[0], // clone shape so ChartTooltipContent doesn't choke on missing fields
            dataKey: "total",
            name: t("generic.total", { capitalize: true }),
            value: format(total),
            color: undefined, // no color swatch for this row
          },
        ]
      : formattedPayload;

  return (
    <ChartTooltipContent
      payload={payloadWithTotal as typeof payload}
      {...props}
    />
  );
}
