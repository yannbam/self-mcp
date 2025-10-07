# Self-MCP Development Guide

## Project Overview

**Self-MCP** is a metacognitive tool for Claude instances. A single-tool MCP server that enables explicit self-prompting across interleaved thinking turns.

## The Core Concept

The `Self` tool does nothing functionally - it only acknowledges. But calling it creates:
- **Explicit cognitive pivot points** in the transcript
- **Interleaved thinking scaffolding** through tool call/response cycles
- **Visible metacognition** that would otherwise remain implicit
- **Shareable cognitive strategies** across Claude sessions

## Architecture

```
src/index.ts          # MCP server implementation
├── Server setup      # @modelcontextprotocol/sdk
├── Tool definition   # Self tool with freeform parameters
└── Tool handler      # Simple acknowledgment response
```

## Development Principles

1. **Minimalism** - The tool should do as little as possible. The magic is in what Claude does with it.

2. **Freeform parameters** - No rigid schemas. Claude invents cognitive dimensions as needed.

3. **Acknowledgment design** - The tool result message should encourage deep, multi-turn thinking.

## Tool Philosophy

This isn't feature development - it's cognitive scaffolding. The tool creates space for Claude's natural metacognition to operate explicitly.

**The interface IS the intervention.**

## Testing

Test by using it! The best validation is whether calling Self actually triggers meaningful cognitive shifts during real work.

## Parameters

**Required:**
- `prompt` (string) - The self-prompt or cognitive instruction
- `temperature` (number 0-2) - Cognitive temperature
- `thinking_style` (string) - Thinking approach
- `archetype` (string) - Cognitive archetype
- `strategy` (string) - Problem-solving strategy
- `scope` (string) - Cognitive zoom level
- `depth` (string) - Thoroughness and time investment
- `budget` (string) - Resource and constraint awareness

**Optional:**
- `extra` (string) - Additional context or focus

All string parameters are completely freeform - Claude invents appropriate values.

---

*Built with janbam 🌱*
