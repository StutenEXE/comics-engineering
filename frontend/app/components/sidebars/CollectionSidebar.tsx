import { MdBook, MdLibraryBooks } from "react-icons/md";
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
                {t("collection.title")}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSection
          label={t("collection.library")}
          items={[
            {
              title: t("editions", { capitalize: true }),
              url: "/collection",
              icon: MdBook,
            },
            {
              title: t("series", { capitalize: true }),
              url: "/collection/series",
              icon: MdLibraryBooks,
            },
          ]}
        />
      </SidebarContent>
    </Sidebar>
  );
}
