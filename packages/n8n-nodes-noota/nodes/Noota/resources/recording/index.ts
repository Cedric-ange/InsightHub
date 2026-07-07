import type { INodeProperties } from 'n8n-workflow';
import { recordingGetAllDescription } from './getAll';
import { recordingDeleteDescription } from './delete';
import { recordingGetFileDescription } from './getFile';

const showWhen = { resource: ['recording'] };

const recordingOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: showWhen },
    options: [
      {
        name: 'Get Many',
        value: 'getAll',
        action: 'Get many recordings',
        description: 'Retrieve a list of recordings',
        routing: {
          request: { method: 'GET', url: '/api/v1/record' },
        },
      },
      {
        name: 'Delete',
        value: 'delete',
        action: 'Delete a recording',
        description: 'Delete a recording by ID',
        routing: {
          request: {
            method: 'DELETE',
            url: '=/api/v1/record/{{$parameter["recordingId"]}}',
          },
        },
      },
      {
        name: 'Get Audio File',
        value: 'getFile',
        action: 'Get audio file URL',
        description: 'Get a temporary URL (24h) for the audio file',
        routing: {
          request: {
            method: 'GET',
            url: '=/api/v1/record/{{$parameter["recordingId"]}}/file',
          },
        },
      },
    ],
    default: 'getAll',
  },
];

export const recordingDescription: INodeProperties[] = [
  ...recordingOperations,
  ...recordingGetAllDescription,
  ...recordingDeleteDescription,
  ...recordingGetFileDescription,
];