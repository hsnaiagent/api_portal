import { Link } from 'react-router-dom';

import { ROUTES } from '@/config/routes';

import { usePortal } from '@/store/AppStore';

import { getManagedApis } from '@/lib/roles';

import { ClassificationBadge } from '@/components/shared/ClassificationBadge';

import { LifecycleBadge } from '@/components/shared/LifecycleBadge';



export function MyApisPage() {

  const { state } = usePortal();

  const myApis = getManagedApis(state.apis, state.currentUser, state.activeRole);



  return (

    <div className="space-y-6">

      <div className="flex justify-between">

        <h1 className="text-2xl font-bold">My APIs</h1>

        <Link to={ROUTES.provider.register} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Register API</Link>

      </div>

      <div className="overflow-x-auto rounded-xl border bg-brand-white">

        <table className="w-full text-sm">

          <thead className="bg-slate-50 text-left">

            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Classification</th><th className="px-4 py-3">Tier</th><th className="px-4 py-3"></th></tr>

          </thead>

          <tbody>

            {myApis.map((api) => (

              <tr key={api.api_id} className="border-t">

                <td className="px-4 py-3 font-medium">{api.name}</td>

                <td className="px-4 py-3"><LifecycleBadge status={api.lifecycle_status} /></td>

                <td className="px-4 py-3"><ClassificationBadge classification={api.classification} /></td>

                <td className="px-4 py-3">Tier {api.gateway_tier}</td>

                <td className="px-4 py-3"><Link to={ROUTES.provider.manage(api.api_id)} className="text-brand-blue hover:text-brand-blue-dark hover:underline">Manage</Link></td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}


