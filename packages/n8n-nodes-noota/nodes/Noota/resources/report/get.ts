import type { INodeProperties } from 'n8n-workflow';

const showWhen = {
  operation: ['get'],
  resource: ['report'],
};

export const reportGetDescription: INodeProperties[] = [
  {
    displayName: 'Recording ID',
    name: 'recordingId',
    type: 'string',
    required: true,
    displayOptions: { show: showWhen },
    default: '',
    placeholder: 'ex: abc123',
    description: 'The ID of the recording to get the report from',
  },
  {
    displayName: 'Format',
    name: 'format',
    type: 'options',
    displayOptions: { show: showWhen },
    options: [
      { name: 'HTML', value: 'html', description: 'Returns formatted HTML' },
      { name: 'Plain Text', value: 'plaintext', description: 'Returns plain text' },
    ],
    default: 'plaintext',
    routing: {
      send: { type: 'query', property: 'format' },
    },
  },
];