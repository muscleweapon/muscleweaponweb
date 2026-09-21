import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Your Product',
  description:
    'Verify the authenticity of your Muscle Weapon supplement using the unique 12-digit scratch code on your product packaging. Instant anti-counterfeit validation.',
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
