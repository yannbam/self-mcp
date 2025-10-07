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

Key insights from development:
- The tool does nothing functionally, but calling it creates explicit cognitive pivot points
- Parameters force articulation of intent, which changes what's cognitively possible
- The acknowledgment message encourages multiple consecutive calls for multi-perspective exploration
- CLI configurability solves the ceremony/precision trade-off

## Testing

Test by using it! The best validation is whether calling Self actually triggers meaningful cognitive shifts during real work.

**Testing patterns:**
1. Single call: Simple cognitive pivot
2. Multiple consecutive calls: Multi-angle exploration (3-5 calls before action)
3. With `--all-optional`: Lightweight quick pivots
4. With `--all-mandatory`: Deep scaffolded exploration
5. With `--add-param`: Domain-specific cognitive dimensions

## Parameters

**Default configuration:**
- `prompt` (string) - Required
- All others optional: `temperature`, `thinking_style`, `archetype`, `strategy`, `scope`, `depth`, `budget`, `extra`

All string parameters are completely freeform - Claude invents appropriate values.

## CLI Configurability

The server accepts command-line arguments to customize parameter requirements and even add new parameters dynamically.

**Why configurable?**
- Different use cases need different ceremony levels
- Quick pivots benefit from minimal required params
- Deep exploration benefits from comprehensive scaffolding
- Custom parameters enable domain-specific cognitive dimensions

**CLI Arguments:**
- `--all-mandatory` - Require all parameters (maximum scaffolding)
- `--all-optional` - Make everything optional (minimum ceremony)
- `--mandatory prompt,temperature` - Specify which params are required
- `--optional extra,depth` - Specify which params are optional
- `--add-param "focus:string:Current area of focus"` - Add custom parameters

**Examples:**

```bash
# Minimal version: only prompt required
node dist/index.js --mandatory prompt

# Full scaffolding: all params required
node dist/index.js --all-mandatory

# Custom cognitive dimensions
node dist/index.js --add-param "risk_tolerance:number:Acceptable risk level"
```

Configure in `.mcp.json` by adding arguments to the `args` array.

## Implementation Notes

**Architecture decisions:**
- Single tool, single purpose (minimalism principle)
- Dynamic schema generation from parameter definitions
- CLI arguments parsed at server startup, immutable during runtime
- All string params freeform with minimal descriptions (no examples = maximum flexibility)
- Tool handler simply acknowledges - all cognitive work happens in Claude's response

**Key files:**
- `src/index.ts` - Complete server implementation (~190 lines)
- `package.json` - Dependencies and metadata
- `README.md` - Public documentation
- `CLAUDE.md` - Developer documentation (this file)

**Future considerations:**
- Parameter refinement based on real-world usage patterns
- Additional CLI args for acknowledgment message customization?
- Metrics/logging for parameter usage frequency?

Remember: Every addition should be questioned. The power is in what the tool *doesn't* do.

---

*Built with janbam 🌱*
