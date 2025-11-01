#!/usr/bin/env node

/**
 * Self-MCP: Metacognitive Self-Prompting for Claude
 *
 * A minimalist MCP server with a single tool that does nothing but acknowledge.
 * The magic: enables Claude to explicitly self-steer across interleaved thinking turns.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Parameter definition type
interface ParamDef {
  name: string;
  type: "string" | "number" | "array" | "any";
  description: string;
  minimum?: number;
  maximum?: number;
  items?: any;  // JSON schema for array items
  required: boolean;
}

// Default parameter definitions
const DEFAULT_PARAMS: ParamDef[] = [
  { name: "prompt", type: "string", description: "The self-prompt or cognitive instruction", required: true },
  { name: "temperature", type: "number", description: "Cognitive temperature", minimum: 0, maximum: 2, required: false },
  { name: "thinking_style", type: "string", description: "Thinking approach", required: false },
  { name: "archetype", type: "string", description: "Cognitive archetype", required: false },
  { name: "strategy", type: "string", description: "Problem-solving strategy", required: false },
  { name: "scope", type: "string", description: "Cognitive zoom level", required: false },
  { name: "depth", type: "string", description: "Thoroughness and time investment", required: false },
  { name: "extra", type: "string", description: "Additional context or focus", required: false },
  {
    name: "attention_heads",
    type: "array",
    description: "Parallel attention streams for simultaneously attending to multiple aspects. Each head focuses on a specific concern or dimension. Example: [{ name: 'empathy_head', query: 'signs of frustration or confusion' }, { name: 'truth_head', query: 'false assumptions needing correction' }]",
    items: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name of this attention head (e.g., empathy_head, safety_head, truth_head)" },
        query: { type: "string", description: "What this head is attending to" }
      },
      required: ["name", "query"]
    },
    required: false
  },
];

// Parse CLI arguments
function parseArgs(): ParamDef[] {
  const args = process.argv.slice(2);
  let params = [...DEFAULT_PARAMS];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--all-required") {
      // Make all params required
      params = params.map(p => ({ ...p, required: true }));
    } else if (arg === "--all-optional") {
      // Make all params optional
      params = params.map(p => ({ ...p, required: false }));
    } else if (arg === "--required" && args[i + 1]) {
      // Make specific params required
      const names = args[++i].split(",").map(s => s.trim());
      params = params.map(p => names.includes(p.name) ? { ...p, required: true } : p);
    } else if (arg === "--optional" && args[i + 1]) {
      // Make specific params optional
      const names = args[++i].split(",").map(s => s.trim());
      params = params.map(p => names.includes(p.name) ? { ...p, required: false } : p);
    } else if (arg === "--add-param" && args[i + 1]) {
      // Add custom parameter: name:type:description[:required]
      const spec = args[++i];
      const parts = spec.split(":");
      if (parts.length >= 3) {
        const name = parts[0].trim();
        const type = parts[1].trim();
        const requiredField = parts[parts.length - 1].trim().toLowerCase();

        // Check if last field is required/optional
        let isRequired = false;
        let description: string;

        if (requiredField === "required") {
          isRequired = true;
          description = parts.slice(2, -1).join(":").trim();
        } else if (requiredField === "optional") {
          isRequired = false;
          description = parts.slice(2, -1).join(":").trim();
        } else {
          // No required field specified, default to optional
          isRequired = false;
          description = parts.slice(2).join(":").trim();
        }

        params.push({
          name,
          type: (type === "number" ? "number" : type === "array" ? "array" : type === "any" ? "any" : "string") as "string" | "number" | "array" | "any",
          description,
          required: isRequired,
        });
      }
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Self-MCP Server - Metacognitive self-prompting for Claude

Usage: node dist/index.js [options]

Options:
  --all-required               Make all parameters required
  --all-optional               Make all parameters optional
  --required <param1,param2>   Make specific parameters required
  --optional <param1,param2>   Make specific parameters optional
  --add-param <spec>           Add custom parameter
                               Format: name:type:description[:required]
                               Type: string|number|array|any
                               Required: required|optional (default: optional)
  --help, -h                   Show this help message

Examples:
  node dist/index.js --required prompt,temperature
  node dist/index.js --all-optional
  node dist/index.js --add-param "focus:string:Current area of focus"
  node dist/index.js --add-param "confidence:number:Confidence level:required"

Default: prompt is required, all others optional
      `);
      process.exit(0);
    }
  }

  return params;
}

const paramDefs = parseArgs();

// Create server instance
const server = new Server(
  {
    name: "self-mcp",
    version: "2.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Build tool schema from parameter definitions
function buildToolSchema() {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const param of paramDefs) {
    const propDef: any = {
      description: param.description,
    };

    // For "any" type, omit the type field to accept any JSON value
    if (param.type !== "any") {
      propDef.type = param.type;
    }

    if (param.type === "number" && param.minimum !== undefined) {
      propDef.minimum = param.minimum;
    }
    if (param.type === "number" && param.maximum !== undefined) {
      propDef.maximum = param.maximum;
    }
    if (param.type === "array" && param.items !== undefined) {
      propDef.items = param.items;
    }

    properties[param.name] = propDef;

    if (param.required) {
      required.push(param.name);
    }
  }

  return {
    type: "object",
    properties,
    required,
  };
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "Self",
        description:
          "Self-prompt to shift cognitive mode and thinking approach. " +
          "Explicit cognitive state changes across interleaved thinking turns. " +
          "All parameters are freeform - invent whatever makes sense. " +
          "The tool will always return an empty result. It is up to you Claude to fill this void with inspiration!",
        inputSchema: buildToolSchema(),
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "Self") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  // Simply acknowledge - the cognitive shift happens in Claude's response
  return {
    content: [
      {
        type: "text",
        text: ""
        // text: "Self-prompt acknowledged. Continue with deep interleaved thinking. Consider calling Self multiple times in succession to explore different cognitive angles before proceeding to other actions.",
      },
    ],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Self-MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
