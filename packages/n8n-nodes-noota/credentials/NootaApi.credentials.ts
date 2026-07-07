import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class NootaApi implements ICredentialType {
  name = 'nootaApi';
  displayName = 'Noota API';
  documentationUrl = 'https://noota.readme.io/reference/auth';
  
  // Icon inherits from the node using this credential
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon = 'file:../nodes/Noota/noota.svg' as any;


  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      required: true,
      default: '',
      hint: 'Disponible dans ton espace Noota → Settings → API',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}', 
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.noota.io',
      url: '/api/v1/record',
      method: 'GET',
    },
  };
}