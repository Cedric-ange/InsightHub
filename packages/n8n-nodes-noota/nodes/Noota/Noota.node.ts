import {
  NodeConnectionTypes,
  type IDataObject,
  type IExecuteFunctions,
  type INodeExecutionData,
  type INodeType,
  type INodeTypeDescription,
} from 'n8n-workflow';

import { recordingDescription } from './resources/recording';
import { transcriptDescription } from './resources/transcript';
import { reportDescription } from './resources/report';

export class Noota implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Noota',
    name: 'noota',
    icon: { light: 'file:noota.svg', dark: 'file:noota.dark.svg' },
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["resource"] + " → " + $parameter["operation"]}}',
    description: 'Interact with the Noota API — recordings, transcripts & reports',
    defaults: { name: 'Noota' },
    usableAsTool: true,
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: 'nootaApi', required: true }],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        description: 'Select the resource. Use "recording" to list/delete recordings, "transcript" to get a transcription, "report" to get an AI-generated report.',
        options: [
          {
            name: 'Recording',
            value: 'recording',
            description: 'Get many, delete, or get audio file URL of a recording',
          },
          {
            name: 'Transcript',
            value: 'transcript',
            description: 'Get the full text transcription of a recording by ID',
          },
          {
            name: 'Report',
            value: 'report',
            description: 'Get the AI-generated summary report of a recording by ID',
          },
        ],
        default: 'recording',
      },
      ...recordingDescription,
      ...transcriptDescription,
      ...reportDescription,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const BASE_URL = 'https://api.noota.io';

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter('resource', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;

      // ─── RECORDING ───────────────────────────────────────────────
      if (resource === 'recording') {

        if (operation === 'getAll') {
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;
          const limit = returnAll ? Infinity : this.getNodeParameter('limit', i, 25) as number;
          const filters = this.getNodeParameter('filters', i, {}) as {
            id?: string;
            status?: string;
            email?: string;
            startDate?: number;
            endDate?: number;
          };

          let cursor: string | null = null;
          let hasMore = true;

          while (hasMore) {
            const qs: IDataObject = {
              limit: Math.min(25, Number.isFinite(limit) ? limit - returnData.length : 25),
            };

            if (filters.status && filters.status !== 'all') qs.status = filters.status;
            if (filters.email) qs.email = filters.email;
            if (filters.startDate) qs.start_date = filters.startDate;
            if (filters.endDate) qs.end_date = filters.endDate;
            if (cursor) qs.cursor = cursor;

            const response = await this.helpers.httpRequestWithAuthentication.call(
              this, 'nootaApi',
              { method: 'GET', url: `${BASE_URL}/api/v1/record`, qs, headers: { Accept: 'application/json' } },
            );

            const data = (response.data ?? []) as IDataObject[];
            returnData.push(...this.helpers.returnJsonArray(data));

            cursor = response.next_cursor ?? null;
            hasMore = response.has_more === true && cursor !== null;

            if (!returnAll && returnData.length >= limit) break;
          }

          if (filters.id) {
            const filtered = returnData.filter(
              (item) => item.json['id'] === filters.id,
            );
            return [filtered];
          }
        }

        else if (operation === 'delete') {
          const recordingId = this.getNodeParameter('recordingId', i) as string;

          await this.helpers.httpRequestWithAuthentication.call(
            this, 'nootaApi',
            { method: 'DELETE', url: `${BASE_URL}/api/v1/record/${recordingId}`, headers: { Accept: 'application/json' } },
          );

          returnData.push({ json: { success: true, id: recordingId } });
        }

        else if (operation === 'getFile') {
          const recordingId = this.getNodeParameter('recordingId', i) as string;

          const response = await this.helpers.httpRequestWithAuthentication.call(
            this, 'nootaApi',
            { method: 'GET', url: `${BASE_URL}/api/v1/record/${recordingId}/file`, headers: { Accept: 'application/json' } },
          );

          returnData.push(...this.helpers.returnJsonArray([response] as IDataObject[]));
        }
      }

      // ─── TRANSCRIPT ──────────────────────────────────────────────
      else if (resource === 'transcript') {
        if (operation === 'get') {
          const recordingId = this.getNodeParameter('recordingId', i) as string;

          const response = await this.helpers.httpRequestWithAuthentication.call(
            this, 'nootaApi',
            { method: 'GET', url: `${BASE_URL}/api/v1/transcript/${recordingId}`, headers: { Accept: 'application/json' } },
          );

          returnData.push(...this.helpers.returnJsonArray([response] as IDataObject[]));
        }
      }

      // ─── REPORT ──────────────────────────────────────────────────
      else if (resource === 'report') {
        if (operation === 'get') {
          const recordingId = this.getNodeParameter('recordingId', i) as string;
          const format = this.getNodeParameter('format', i, 'plaintext') as string;

          const response = await this.helpers.httpRequestWithAuthentication.call(
            this, 'nootaApi',
            { method: 'GET', url: `${BASE_URL}/api/v1/report/${recordingId}`, qs: { format } as IDataObject, headers: { Accept: 'application/json' } },
          );

          returnData.push(...this.helpers.returnJsonArray([response] as IDataObject[]));
        }
      }
    }

    return [returnData];
  }
}