import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';

import { initialApis } from '@/data/apis';

import { initialApplications } from '@/data/applications';

import { initialAuditLogs } from '@/data/audit-log';

import { initialCredentials } from '@/data/credentials';

import { initialLLMSubscriptionRequests } from '@/data/llm-requests';

import { initialProviderAccessRequests } from '@/data/provider-requests';

import { initialSubscriptions } from '@/data/subscriptions';

import { initialWorkflows } from '@/data/workflows';

import { initialState, portalReducer } from './reducer';

import type { PortalState } from '@/types';

import type { PortalAction } from './actions';



interface PortalContextValue {

  state: PortalState;

  dispatch: React.Dispatch<PortalAction>;

}



const PortalContext = createContext<PortalContextValue | null>(null);



export function AppStoreProvider({ children }: { children: ReactNode }) {

  const [state, dispatch] = useReducer(portalReducer, initialState);



  useEffect(() => {

    dispatch({

      type: 'INIT_DATA',

      payload: {

        apis: initialApis,

        subscriptions: initialSubscriptions,

        applications: initialApplications,

        workflows: initialWorkflows,

        credentials: initialCredentials,

        auditLogs: initialAuditLogs,

        providerAccessRequests: initialProviderAccessRequests,

        llmSubscriptionRequests: initialLLMSubscriptionRequests,

      },

    });

  }, []);



  return (

    <PortalContext.Provider value={{ state, dispatch }}>

      {children}

    </PortalContext.Provider>

  );

}



export function usePortal() {

  const ctx = useContext(PortalContext);

  if (!ctx) throw new Error('usePortal must be used within AppStoreProvider');

  return ctx;

}


