import { permanentRedirect } from 'next/navigation';

/** /lab is an alias of the Forward Deployed Engineering page (single canonical URL) */
export default function LabPage() {
  permanentRedirect('/fde');
}
