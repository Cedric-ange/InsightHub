import type { INodeProperties } from 'n8n-workflow';

const showWhen = {
  operation: ['delete'],
  resource: ['recording'],
};

export const recordingDeleteDescription: INodeProperties[] = [
  {
    displayName: 'Recording ID',
    name: 'recordingId',
    type: 'string',
    required: true,
    displayOptions: { show: showWhen },
    default: '',
    placeholder: 'ex: abc123',
    description: 'The unique ID of the recording to delete',
  },
];