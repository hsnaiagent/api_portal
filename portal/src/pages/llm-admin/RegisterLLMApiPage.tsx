import { RegisterApiPage } from '@/pages/provider/RegisterApiPage';

import { ROUTES } from '@/config/routes';



export function RegisterLLMApiPage() {

  return (

    <RegisterApiPage fixedDomainId="dom_ai" successRoute={ROUTES.llmAdmin.myApis} llmMode />

  );

}


