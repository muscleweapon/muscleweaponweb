import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & Athlete Support',
  description:
    'Get in touch with the Muscle Weapon team. Direct inquiries, product verification questions, and authorized distribution support.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
