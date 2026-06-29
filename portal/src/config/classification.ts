import type { Classification } from '@/types';

export const CLASSIFICATIONS: Record<
  Classification,
  {
    label: string;
    color: string;
    bg: string;
    searchable: boolean;
    crossDomain: boolean;
    handling: string;
  }
> = {
  restricted: {
    label: 'Restricted',
    color: 'text-red-700',
    bg: 'bg-red-100',
    searchable: false,
    crossDomain: false,
    handling: 'Encrypted at rest and in transit. Named individuals only.',
  },
  confidential: {
    label: 'Confidential',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    searchable: true,
    crossDomain: false,
    handling: 'Encrypted in transit (TPC-52). Role-based access.',
  },
  internal: {
    label: 'Internal',
    color: 'text-brand-blue-dark',
    bg: 'bg-brand-blue-light',
    searchable: true,
    crossDomain: true,
    handling: 'Employees with business need. Company systems only.',
  },
  public: {
    label: 'Public',
    color: 'text-brand-green',
    bg: 'bg-brand-green-light',
    searchable: true,
    crossDomain: true,
    handling: 'Approved for disclosure. Verify before use.',
  },
};
