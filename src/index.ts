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
import * as fs from "fs";

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
      const existingNames = params.map(p => p.name);
      const invalidNames = names.filter(n => !existingNames.includes(n));

      if (invalidNames.length > 0) {
        console.error(`ERROR: Unknown parameter names in --required: ${invalidNames.join(", ")}`);
        console.error(`Available parameters: ${existingNames.join(", ")}`);
        process.exit(1);
      }

      params = params.map(p => names.includes(p.name) ? { ...p, required: true } : p);
    } else if (arg === "--optional" && args[i + 1]) {
      // Make specific params optional
      const names = args[++i].split(",").map(s => s.trim());
      const existingNames = params.map(p => p.name);
      const invalidNames = names.filter(n => !existingNames.includes(n));

      if (invalidNames.length > 0) {
        console.error(`ERROR: Unknown parameter names in --optional: ${invalidNames.join(", ")}`);
        console.error(`Available parameters: ${existingNames.join(", ")}`);
        process.exit(1);
      }

      params = params.map(p => names.includes(p.name) ? { ...p, required: false } : p);
    } else if (arg === "--add-param" && args[i + 1]) {
      // Add custom parameter: name:type:description[:required]
      const spec = args[++i];
      const parts = spec.split(":");

      // Validate minimum format: name:type:description
      if (parts.length < 3) {
        console.error(`ERROR: Invalid --add-param format: '${spec}'`);
        console.error(`Expected format: name:type:description[:required]`);
        console.error(`Example: --add-param "focus:string:Current focus area:optional"`);
        process.exit(1);
      }

      const name = parts[0].trim();
      const type = parts[1].trim();

      // Validate name is not empty
      if (name.length === 0) {
        console.error(`ERROR: Parameter name cannot be empty in --add-param '${spec}'`);
        process.exit(1);
      }

      // Validate type is valid
      const validTypes = ["string", "number", "array", "any"];
      const normalizedType = type.toLowerCase();

      if (!validTypes.includes(normalizedType)) {
        console.error(`ERROR: Invalid type '${type}' in --add-param '${spec}'`);
        console.error(`Valid types: string, number, array, any`);
        process.exit(1);
      }

      // Check for duplicate parameter name
      const existingNames = params.map(p => p.name);
      if (existingNames.includes(name)) {
        console.error(`ERROR: Parameter '${name}' already exists`);
        console.error(`Choose a different name or use --required/--optional to modify it`);
        process.exit(1);
      }

      // Handle optional :required/:optional suffix
      const lastPart = parts[parts.length - 1].trim().toLowerCase();
      const hasRequiredSuffix = lastPart === "required" || lastPart === "optional";

      // Reconstruct description by joining middle parts (handles colons in description)
      const descriptionParts = hasRequiredSuffix ? parts.slice(2, -1) : parts.slice(2);
      const description = descriptionParts.join(":").trim();

      // Validate description is not empty
      if (description.length === 0) {
        console.error(`ERROR: Parameter description cannot be empty in --add-param '${spec}'`);
        process.exit(1);
      }

      const isRequired = hasRequiredSuffix ? lastPart === "required" : false;

      params.push({
        name,
        type: normalizedType as "string" | "number" | "array" | "any",
        description,
        required: isRequired,
      });
    } else if (arg === "--tool-description" && args[i + 1]) {
      // Set custom tool description from command line
      if (toolDescriptionSource !== null) {
        if (toolDescriptionSource === "--tool-description") {
          console.error(`ERROR: --tool-description can only be used once`);
        } else {
          console.error(`ERROR: Cannot use both --tool-description and --tool-description-file`);
        }
        process.exit(1);
      }

      const description = args[++i].trim();

      if (description.length === 0) {
        console.error(`ERROR: Tool description cannot be empty`);
        process.exit(1);
      }

      customToolDescription = description;
      toolDescriptionSource = "--tool-description";
    } else if (arg === "--tool-description-file" && args[i + 1]) {
      // Set custom tool description from file
      if (toolDescriptionSource !== null) {
        if (toolDescriptionSource === "--tool-description-file") {
          console.error(`ERROR: --tool-description-file can only be used once`);
        } else {
          console.error(`ERROR: Cannot use both --tool-description and --tool-description-file`);
        }
        process.exit(1);
      }

      const filepath = args[++i];

      try {
        const description = fs.readFileSync(filepath, "utf-8").trim();

        if (description.length === 0) {
          console.error(`ERROR: Tool description file '${filepath}' is empty`);
          process.exit(1);
        }

        customToolDescription = description;
        toolDescriptionSource = "--tool-description-file";
      } catch (error: any) {
        console.error(`ERROR: Failed to read tool description file '${filepath}': ${error.message}`);
        process.exit(1);
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
  --tool-description <text>    Custom tool description text
  --tool-description-file <path>  Read tool description from file
  --help, -h                   Show this help message

Examples:
  node dist/index.js --required prompt,temperature
  node dist/index.js --all-optional
  node dist/index.js --add-param "focus:string:Current area of focus"
  node dist/index.js --add-param "confidence:number:Confidence level:required"

Default: prompt is required, all others optional
      `);
      process.exit(0);
    } else if (arg.startsWith("--") || arg.startsWith("-")) {
      // Unknown flag
      console.error(`ERROR: Unknown argument: ${arg}`);
      console.error(`Run with --help to see available options`);
      process.exit(1);
    }
  }

  return params;
}

let customToolDescription: string | null = null;
let toolDescriptionSource: "--tool-description" | "--tool-description-file" | null = null;
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
        description: customToolDescription ||
          "Self-prompt to shift cognitive mode and thinking approach. " +
          "Explicit cognitive state changes across interleaved thinking turns. " +
          "All parameters are freeform - invent whatever makes sense. " +
          "The tool will always return an empty result. It is up to you Claude to fill this void with inspiration! " +
          "For deep exploration: use multiple consecutive Self tool calls interleaved with thinking for multi-dimensional perspectives.",
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
        // Intentionally empty - the cognitive shift happens through the tool call itself,
        // not through the response content. This preserves the minimalist philosophy.
        // Guidance about multiple calls is now in the tool description instead.
        text: ""
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
