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
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The self-prompt or cognitive instruction",
            },
            temperature: {
              type: "number",
              description: "Cognitive temperature",
              minimum: 0,
              maximum: 2,
            },
            thinking_style: {
              type: "string",
              description: "Thinking approach",
            },
            archetype: {
              type: "string",
              description: "Cognitive archetype",
            },
            strategy: {
              type: "string",
              description: "Problem-solving strategy",
            },
            extra: {
              type: "string",
              description: "Additional context or focus",
            },
          },
          required: ["prompt", "temperature", "thinking_style", "archetype", "strategy"],
        },
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
