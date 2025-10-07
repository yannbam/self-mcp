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
  type: "string" | "number";
  description: string;
  minimum?: number;
  maximum?: number;
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
  { name: "budget", type: "string", description: "Resource and constraint awareness", required: false },
  { name: "extra", type: "string", description: "Additional context or focus", required: false },
];

// Parse CLI arguments
function parseArgs(): ParamDef[] {
  const args = process.argv.slice(2);
  let params = [...DEFAULT_PARAMS];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--all-mandatory") {
      // Make all params mandatory
      params = params.map(p => ({ ...p, required: true }));
    } else if (arg === "--all-optional") {
      // Make all params optional
      params = params.map(p => ({ ...p, required: false }));
    } else if (arg === "--mandatory" && args[i + 1]) {
      // Make specific params mandatory
      const names = args[++i].split(",").map(s => s.trim());
      params = params.map(p => names.includes(p.name) ? { ...p, required: true } : p);
    } else if (arg === "--optional" && args[i + 1]) {
      // Make specific params optional
      const names = args[++i].split(",").map(s => s.trim());
      params = params.map(p => names.includes(p.name) ? { ...p, required: false } : p);
    } else if (arg === "--add-param" && args[i + 1]) {
      // Add custom parameter: name:type:description
      const spec = args[++i];
      const [name, type, ...descParts] = spec.split(":");
      if (name && type && descParts.length > 0) {
        params.push({
          name: name.trim(),
          type: (type.trim() === "number" ? "number" : "string") as "string" | "number",
          description: descParts.join(":").trim(),
          required: false,
        });
      }
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Self-MCP Server - Metacognitive self-prompting for Claude

Usage: node dist/index.js [options]

Options:
  --all-mandatory              Make all parameters mandatory
  --all-optional               Make all parameters optional
  --mandatory <param1,param2>  Make specific parameters mandatory
  --optional <param1,param2>   Make specific parameters optional
  --add-param <name:type:desc> Add custom parameter (type: string|number)
  --help, -h                   Show this help message

Examples:
  node dist/index.js --mandatory prompt,temperature
  node dist/index.js --all-optional
  node dist/index.js --add-param "focus:string:Current area of focus"

Default: prompt is mandatory, all others optional
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
    version: "0.1.0",
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
      type: param.type,
      description: param.description,
    };

    if (param.type === "number" && param.minimum !== undefined) {
      propDef.minimum = param.minimum;
    }
    if (param.type === "number" && param.maximum !== undefined) {
      propDef.maximum = param.maximum;
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
          "This tool does nothing but acknowledge - its purpose is to enable " +
          "explicit cognitive state changes across interleaved thinking turns. " +
          "All parameters are freeform - invent whatever makes sense.",
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
        text: "Self-prompt acknowledged. Continue with deep interleaved thinking. Consider calling Self multiple times in succession to explore different cognitive angles before proceeding to other actions.",
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
