import type { INodeProperties } from 'n8n-workflow';

const showWhen = {
  operation: ['getAll'],
  resource: ['recording'],
};

export const recordingGetAllDescription: INodeProperties[] = [
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: { show: showWhen },
    default: false,
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
      show: { ...showWhen, returnAll: [false] },
    },
    typeOptions: { minValue: 1, maxValue: 25 },
    default: 50,
    description: 'Max number of results to return',
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: { show: showWhen },
    options: [
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'number',
        default: 0,
        placeholder: 'Unix timestamp',
      },
      {
        displayName: 'Owner Email',
        name: 'email',
        type: 'string',
        default: '',
        placeholder: 'user@example.com',
      },
      {
        displayName: 'Recording ID',
        name: 'id',
        type: 'string',
        default: '',
        placeholder: 'ex: abc123',
        description: 'Return only the recording matching this ID. Useful with Noota Trigger.',
      },
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'number',
        default: 0,
        placeholder: 'Unix timestamp',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'All', value: 'all' },
          { name: 'Transcribed', value: 'transcribed' },
          { name: 'Uploaded', value: 'uploaded' },
          { name: 'Processing', value: 'processing' },
        ],
        default: 'all',
      },
    ],
  },
];