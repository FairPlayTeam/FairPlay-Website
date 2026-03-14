import { ReactNode } from "react";

interface DocsSidebarProps {
  sections: { id: string; title: string; icon: ReactNode }[];
  activeSection: string;
}

export default function DocsSidebar({
  sections,
  activeSection,
}: DocsSidebarProps) {
  return (
    <aside className="sticky top-24 h-fit rounded-2xl border border-border bg-card p-3 shadow-md backdrop-blur-md md:col-span-1">
      <nav className="flex flex-col gap-4">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`flex items-center gap-3 text-base font-medium transition-all duration-300 p-2 rounded-lg ${
              activeSection === section.id
                ? "bg-primary/10 text-primary shadow-inner"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="text-lg">{section.icon}</span>
            <span>{section.title}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
