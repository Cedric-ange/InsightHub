import type { INodeProperties } from 'n8n-workflow';

const showWhen = {
  operation: ['getFile'],
  resource: ['recording'],
};

export const recordingGetFileDescription: INodeProperties[] = [
  {
    displayName: 'Recording ID',
    name: 'recordingId',
    type: 'string',
    required: true,
    displayOptions: { show: showWhen },
    default: '',
    placeholder: 'ex: abc123',
    description: 'Returns a SAS URL valid for 24 hours',
  },
];