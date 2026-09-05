'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

/**
 * Client CTA inside server-rendered pages — navigates to the real
 * /contact route on click.
 */
export function ContactCta({ label }: { label: string }) {
  const router = useRouter();
  return (
    <div className="mt-10">
      <Button
        size="lg"
        onClick={() => router.push('/contact')}
        className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
      >
        {label}
        <ChevronRight className="ms-2 h-4 w-4" />
      </Button>
    </div>
  );
}
