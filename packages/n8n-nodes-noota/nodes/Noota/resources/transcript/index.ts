import type { INodeProperties } from 'n8n-workflow';
import { transcriptGetDescription } from './get';

const transcriptOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['transcript'] } },
    options: [
      {
        name: 'Get',
        value: 'get',
        action: 'Get a transcript',
        description: 'Get the full transcript of a recording',
        routing: {
          request: {
            method: 'GET',
            url: '=/api/v1/transcript/{{$parameter["recordingId"]}}',
          },
        },
      },
    ],
    default: 'get',
  },
];

export const transcriptDescription: INodeProperties[] = [
  ...transcriptOperations,
  ...transcriptGetDescription,
];