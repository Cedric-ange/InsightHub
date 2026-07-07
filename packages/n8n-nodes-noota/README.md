# n8n-nodes-noota

This is an n8n community node. It lets you use Noota in your n8n workflows.

Noota is an AI-powered meeting recorder that automatically transcribes, summarizes, and analyzes your calls and meetings, providing structured notes, action items, and reports.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

Alternatively, you can manually install it:

```
git clone https://github.com/elevate-agency-data/n8n-nodes-noota.git
cd n8n-nodes-noota
npm install
```

## Operations

- **Recording**
  - **Get Many** — Retrieve a list of recordings (with optional filters and auto-pagination)
  - **Delete** — Permanently delete a recording by ID
  - **Get Audio File URL** — Get a temporary download URL valid for 24 hours

- **Transcript**
  - **Get** — Get the full transcript of a recording by ID

- **Report**
  - **Get** — Get the AI-generated report of a recording (Plain Text or HTML)

- **Noota Trigger**
  - Triggers your workflow when a Noota recording is completed

## Credentials

To use this node, you need a Noota API key.

1. Log into your [Noota account](https://app.noota.io)
2. Go to **Settings → API**
3. Copy your **API Key**
4. In n8n → **Credentials → New → Noota API** → paste your key → Save

## Compatibility

Tested with n8n version 2.7.4.

## Usage

### Using the Trigger

The **Noota Trigger** listens for recording completion events via webhook.

1. Add a **Noota Trigger** node as the first step of your workflow
2. **Activate** the workflow — n8n generates a unique webhook URL
3. Copy the webhook URL
4. In Noota → **Settings → Webhook** → paste the URL → Save

> **Note:** Noota does not provide an API to register webhooks programmatically.
> The webhook URL must be configured manually in the Noota dashboard.

### Typical Workflow

```
[Noota Trigger]
      ↓
[Noota - Get Many]       ← Recording ID = {{ $json.id }}
      ↓
[Noota - Get Transcript] ← Recording ID = {{ $json.id }}
      ↓
[Noota - Get Report]     ← Recording ID = {{ $json.id }}
      ↓
[Send to Slack / Email / CRM...]
```

### Using as a Tool in AI Agents

This node supports `usableAsTool`. To enable community nodes as tools, set the following environment variable:

```
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Noota API documentation](https://noota.readme.io/reference/welcome)

## Version history

| Version | Description |
|---|---|
| 0.1.0 | Initial release — Recording, Transcript, Report, Trigger |