import { motion } from "framer-motion";

interface DocsSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  index: number;
}

export default function DocsSection({
  id,
  title,
  children,
  index,
}: DocsSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-container border border-border rounded-2xl p-6 mb-10 backdrop-blur-md shadow-sm"
    >
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <div className="space-y-3 text-text-para leading-relaxed">{children}</div>
    </motion.section>
  );
}
