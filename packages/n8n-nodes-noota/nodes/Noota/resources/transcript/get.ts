import type { INodeProperties } from 'n8n-workflow';

const showWhen = {
  operation: ['get'],
  resource: ['transcript'],
};

export const transcriptGetDescription: INodeProperties[] = [
  {
    displayName: 'Recording ID',
    name: 'recordingId',
    type: 'string',
    required: true,
    displayOptions: { show: showWhen },
    default: '',
    placeholder: 'ex: abc123',
    description: 'The ID of the recording to get the transcript from',
  },
];