import { BsBookshelf } from "react-icons/bs";
import { FaReadme, FaWallet } from "react-icons/fa6";
import { MdBook, MdEditDocument } from "react-icons/md";
import { useTranslation } from "~/i18n/i18n";
import { Sidebar, SidebarContent, SidebarHeader } from "../shadcn/ui/sidebar";
import { NavSection } from "./NavSection";
import { PiCurrencyEurBold, PiStackFill } from "react-icons/pi";

export function CollectionSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();

  return (
    <Sidebar
      className="border-sidebar-border bg-sidebar text-sidebar-foreground"
      collapsible="offcanvas"
      {...props}
    >
      {/* Same height as the page header (SideContentHeader) so both borders line up */}
      <SidebarHeader className="h-13 shrink-0 justify-center border-b border-sidebar-border px-4 py-0">
        <span className="text-xs font-medium uppercase tracking-widest text-stash-400/70">
          {t("stash.title")}
        </span>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <NavSection
          label={t("stash.library")}
          items={[
            {
              title: t("editions", { capitalize: true }),
              url: "/stash",
              icon: MdBook,
            },
            {
              title: t("stash.prices"),
              url: "/stash/prices",
              icon: PiCurrencyEurBold,
            },
            {
              title: t("stash.bookshelf"),
              url: "/stash/bookshelf",
              icon: BsBookshelf,
            },
            // {
            //   title: t("stash.toReadPile"),
            //   url: "/stash/toread-pile",
            //   icon: PiStackFill,
            // },
          ]}
        />
        <NavSection
          label={t("stash.statistics")}
          items={[
            {
              title: t("stash.spending"),
              url: "/stash/spending",
              icon: FaWallet,
            },
            {
              title: t("stash.reading"),
              url: "/stash/reading",
              icon: FaReadme,
            },
          ]}
        />
        <NavSection
          label={t("stash.activity")}
          items={[
            {
              title: t("contributions"),
              url: "/stash/contributions",
              icon: MdEditDocument,
            },
          ]}
        />
      </SidebarContent>
    </Sidebar>
  );
}
