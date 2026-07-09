const SAMPLE_OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'Employee Benefits API',
    version: '1.0.0',
    description:
      'Provides employee benefits enrollment, plan lookup, and status queries for HR systems.',
  },
  servers: [{ url: 'https://apis.example.com/hr-benefits' }],
  paths: {
    '/v1/benefits': {
      get: {
        summary: 'List benefit plans',
        operationId: 'listBenefits',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'object' } },
                example: [{ id: 'plan-1', name: 'Health Plus' }],
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '500': { description: 'Internal Server Error' },
        },
      },
    },
    '/v1/benefits/{id}': {
      get: {
        summary: 'Get benefit plan by ID',
        operationId: 'getBenefitById',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: { type: 'object' },
                example: { id: 'plan-1', name: 'Health Plus' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '500': { description: 'Internal Server Error' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

export const SAMPLE_OPENAPI_SPEC_JSON = JSON.stringify(SAMPLE_OPENAPI_SPEC, null, 2);
