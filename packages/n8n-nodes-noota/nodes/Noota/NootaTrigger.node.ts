import {
  NodeConnectionTypes,
  type INodeType,
  type INodeTypeDescription,
  type IWebhookFunctions,
  type IWebhookResponseData,
} from 'n8n-workflow';

export class NootaTrigger implements INodeType {
  usableAsTool = true;

  description: INodeTypeDescription = {
    displayName: 'Noota Trigger',
    name: 'nootaTrigger',
    icon:'file:noota.svg',
    group: ['trigger'],
    version: 1,
    description: 'Triggers when a Noota recording is completed',
    defaults: { name: 'Noota Trigger' },
    inputs: [],
    outputs: [NodeConnectionTypes.Main],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'noota',
      },
    ],
    properties: [
      {
        displayName: '⚙️ Configuration requise dans Noota',
        name: 'setup',
        type: 'notice',
        default: '',
        displayOptions: { show: { '@version': [1] } },
      },
      {
        displayName: 'Instructions',
        name: 'instructions',
        type: 'notice',
        default: '1. Active ce nœud pour obtenir l\'URL webhook\n2. Copie l\'URL affichée ci-dessus\n3. Va dans Noota → Settings → Webhook\n4. Colle l\'URL et sauvegarde',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        options: [
          {
            name: 'Recording Completed',
            value: 'recording.completed',
            description: 'Triggered when a recording is fully processed by Noota',
          },
        ],
        default: 'recording.completed',
        description: 'The event to listen for',
      },
    ],
		usableAsTool: true,
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const bodyData = this.getBodyData();
    const headerData = this.getHeaderData();

    return {
      workflowData: [
        this.helpers.returnJsonArray({
          ...bodyData as object,
          _meta: {
            receivedAt: new Date().toISOString(),
            source: headerData['user-agent'] ?? 'noota',
          },
        }),
      ],
    };
  }
}