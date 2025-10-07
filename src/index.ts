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
              type: "string",
              description:
                "Cognitive temperature (freeform: 'high', 'low', 'precise', 'exploratory', etc.)",
            },
            thinking_style: {
              type: "string",
              description:
                "Thinking approach (freeform: 'adversarial', 'systematic', 'creative', 'first_principles', etc.)",
            },
            archetype: {
              type: "string",
              description:
                "Cognitive archetype (freeform: 'skeptic', 'architect', 'debugger', 'explorer', etc.)",
            },
            strategy: {
              type: "string",
              description:
                "Problem-solving strategy (freeform: 'divide_and_conquer', 'find_edge_cases', 'trace_execution', etc.)",
            },
            extra: {
              type: "string",
              description: "Additional context or focus (optional)",
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
        text: "Self-prompt acknowledged. Shifting cognitive mode...",
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
