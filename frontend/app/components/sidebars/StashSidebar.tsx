import { BsBookshelf } from "react-icons/bs";
import { FaReadme, FaWallet } from "react-icons/fa6";
import { MdBook, MdEditDocument } from "react-icons/md";
import { useTranslation } from "~/i18n/i18n";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../shadcn/ui/sidebar";
import { NavSection } from "./NavSection";

export function CollectionSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  return (
    <Sidebar
      className="border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm"
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader className="border-b border-sidebar-border pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a
                href="#"
                className="text-lg font-medium uppercase tracking-wide"
              >
                {t("stash.title")}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSection
          items={[
            {
              title: t("contributions"),
              url: "/stash/contributions",
              icon: MdEditDocument,
            },
          ]}
        />
        <NavSection
          label={t("stash.library")}
          items={[
            {
              title: t("stash.bookshelf", { capitalize: true }),
              url: "/stash/bookshelf",
              icon: BsBookshelf,
            },
            {
              title: t("editions", { capitalize: true }),
              url: "/stash",
              icon: MdBook,
            },
          ]}
        />
        <NavSection
          label={t("stash.statistics")}
          items={[
            {
              title: t("stash.spending", { capitalize: true }),
              url: "/stash/spending",
              icon: FaWallet,
            },
            {
              title: t("stash.reading", { capitalize: true }),
              url: "/stash/reading",
              icon: FaReadme,
            },
          ]}
        />
      </SidebarContent>
    </Sidebar>
  );
}
