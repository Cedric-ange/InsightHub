import type { INodeProperties } from 'n8n-workflow';
import { reportGetDescription } from './get';

const reportOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['report'] } },
    options: [
      {
        name: 'Get',
        value: 'get',
        action: 'Get a report',
        description: 'Get the AI-generated report of a recording',
        routing: {
          request: {
            method: 'GET',
            url: '=/api/v1/report/{{$parameter["recordingId"]}}',
          },
        },
      },
    ],
    default: 'get',
  },
];

export const reportDescription: INodeProperties[] = [
  ...reportOperations,
  ...reportGetDescription,
];