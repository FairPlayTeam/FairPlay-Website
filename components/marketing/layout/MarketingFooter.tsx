import Link from "next/link";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import Logo from "@/components/marketing/ui/Logo";
import { cn } from "@/lib/utils";

interface FooterProps {
  variant?: "primary" | "secondary";
}

export default function MarketingFooter({ variant = "primary" }: FooterProps) {
  return (
    <footer className="border-t border-border bg-card px-6 py-10 text-base text-foreground sm:px-10">
      {variant === "primary" && (
        <section
          aria-label="About FairPlay"
          className="mx-auto mb-10 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground"
        >
          <p className="mb-4">
            FairPlay is a{" "}
            <strong className="text-foreground">free, ad-free streaming platform</strong> built as
            an open-source alternative to mainstream video services. No subscriptions, no tracking,
            no algorithmic rabbit holes, just content that respects your time and attention.
          </p>
          <p>
            We&apos;re a small team of volunteers with a simple belief:{" "}
            <strong className="text-foreground">
              the internet can be a better place for creators and viewers alike
            </strong>
            . If that resonates with you, come join us.
          </p>
        </section>
      )}

      <div className="mx-auto mb-8 h-px w-16 bg-primary/30" />

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <Logo />

        <nav aria-label="Legal links">
          <ul className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {[
              { label: "Terms of Use", href: "/terms" },
              { label: "Privacy Policy", href: "/terms#privacy-policy" },
              { label: "Code of Conduct", href: "/terms#conduct" },
              { label: "FAQ", href: "/terms#faq" },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className={cn(
                    "text-muted-foreground underline-offset-4",
                    "transition-all duration-200",
                    "hover:text-primary hover:underline hover:decoration-primary/40",
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Social links">
          <ul className="flex gap-5 text-2xl">
            {[
              { href: "https://github.com/FairPlayTeam/", icon: FaGithub, label: "GitHub" },
              { href: "https://x.com/StreamNew90503", icon: FaTwitter, label: "Twitter / X" },
              { href: "https://discord.gg/AZBwM6u9Kr", icon: FaDiscord, label: "Discord" },
            ].map(({ href, icon: Icon, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    "text-muted-foreground",
                    "transition-colors duration-200",
                    "hover:text-primary",
                  )}
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mt-8 border-t border-border pt-5 text-center text-sm text-muted-foreground">
        Powered by the Community.
      </p>
    </footer>
  );
}
