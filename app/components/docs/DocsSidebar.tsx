import { ReactNode } from "react";

interface DocsSidebarProps {
  sections: { id: string; title: string; icon: ReactNode }[];
  activeSection: string;
}

export default function DocsSidebar({ sections, activeSection }: DocsSidebarProps) {
  return (
    <aside className="md:col-span-1 bg-(--color-container) rounded-2xl p-3 backdrop-blur-md border border-(--color-border) h-fit sticky top-24 shadow-md">
      <nav className="flex flex-col gap-4">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`flex items-center gap-3 text-base font-medium transition-all duration-300 p-2 rounded-lg ${
              activeSection === section.id
                ? "bg-(--color-links)/20 text-(--color-links) shadow-inner"
                : "text-(--color-text-para) hover:bg-(--color-links)/10 hover:text-(--color-links)"
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