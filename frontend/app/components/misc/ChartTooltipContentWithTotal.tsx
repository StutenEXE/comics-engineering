import { useTranslation } from "~/i18n/i18n";
import { ChartTooltipContent } from "../shadcn/ui/chart";
import { capitalize } from "~/utils/strings";

// Custom tooltip content wrapping shadcn's default, adding a total row
export function ChartTooltipContentWithTotal({
  payload,
  ...props
}: React.ComponentProps<typeof ChartTooltipContent>) {
  const { t } = useTranslation();

  const total =
    payload?.reduce((sum, item) => sum + (item.value as number), 0) ?? 0;

  const payloadWithTotal = payload
    ? [
        ...payload,
        {
          ...payload[0], // clone shape so ChartTooltipContent doesn't choke on missing fields
          dataKey: total,
          name: t("generic.total", { capitalize: true }),
          value: total,
          color: undefined, // no color swatch for this row
        },
      ]
    : payload;

  return <ChartTooltipContent payload={payloadWithTotal} {...props} />;
}
