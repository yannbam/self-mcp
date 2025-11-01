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
4. With `--all-required`: Deep scaffolded exploration
5. With `--add-param`: Domain-specific cognitive dimensions

## Parameters

**Default configuration:**
- `prompt` (string) - Required
- All others optional: `temperature`, `thinking_style`, `archetype`, `strategy`, `scope`, `depth`, `extra`

All string parameters are completely freeform - Claude invents appropriate values.

## CLI Configurability

The server accepts command-line arguments to customize parameter requirements and even add new parameters dynamically.

**Why configurable?**
- Different use cases need different ceremony levels
- Quick pivots benefit from minimal required params
- Deep exploration benefits from comprehensive scaffolding
- Custom parameters enable domain-specific cognitive dimensions

**CLI Arguments:**
- `--all-required` - Require all parameters (maximum scaffolding)
- `--all-optional` - Make everything optional (minimum ceremony)
- `--required prompt,temperature` - Specify which params are required
- `--optional extra,depth` - Specify which params are optional
- `--add-param "name:type:description[:required]"` - Add custom parameters
  - Required field: `required` or `optional`
  - Defaults to optional if not specified

**Examples:**

```bash
# Minimal version: only prompt required
node dist/index.js --required prompt

# Full scaffolding: all params required
node dist/index.js --all-required

# Custom cognitive dimensions (optional by default)
node dist/index.js --add-param "risk_tolerance:number:Acceptable risk level"

# Required custom parameter
node dist/index.js --add-param "focus:string:Current focus area:required"
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
- `src/index.ts` - Complete server implementation (~295 lines)
- `package.json` - Dependencies and metadata
- `README.md` - Public documentation
- `CLAUDE.md` - Developer documentation (this file)

**Future considerations:**
- Parameter refinement based on real-world usage patterns
- Additional CLI args for acknowledgment message customization?
- Metrics/logging for parameter usage frequency?

Remember: Every addition should be questioned. The power is in what the tool *doesn't* do.

## Recent Changes

### Session 2025-11-01: Custom Tool Description (v2.1.0)

**Added features:**
- New `--tool-description <text>` CLI argument for inline custom tool descriptions
- New `--tool-description-file <path>` CLI argument for file-based tool descriptions
- Mutually exclusive validation between both arguments
- Duplicate usage detection with specific error messages

**Implementation:**
- Module-level variable `customToolDescription` stores custom description
- Module-level variable `toolDescriptionSource` tracks which flag was used
- Synchronous file reading with fs.readFileSync (fail-fast at startup)
- Empty description validation (after trim) for both inline and file-based
- Clear error messages distinguish between duplicate usage vs mutual exclusivity

**Design decisions:**
- Simple KISS implementation (~50 lines added total)
- Follows existing parseArgs validation patterns exactly
- Fail-fast philosophy: invalid configs prevent server startup
- File reading is synchronous to maintain simple startup flow
- Uses `||` operator for fallback to default description

**Testing:**
- Verified mutual exclusivity error handling
- Verified duplicate flag usage error messages
- Verified empty description validation
- Verified file reading with valid, missing, and empty files
- Verified custom descriptions appear correctly in MCP tool definition via MCP-Debug

**Documentation:**
- README.md updated with new CLI arguments and examples
- CLI help text updated
- package.json version kept at v2.1.0 (minor feature addition)

**Commits:**
- `241c630` - feat: add custom tool description CLI arguments

**Pull Request:**
- PR #5: https://github.com/yannbam/self-mcp/pull/5

### Session 2025-11-01: attention_heads parameter (v2.1.0)

**Added features:**
- New `attention_heads` parameter - array of `{name, query}` objects for parallel attention streams
- Extended type system to support `array` and `any` types
- Array type: untyped arrays accepting any elements
- Any type: accepts any JSON value (primitives, objects, arrays, null)

**Design decisions:**
- Started with transformer Q/K/V analogy, simplified to just `{name, query}` (KISS)
- Name field follows lm_head convention (like in transformer architectures)
- Query field specifies what that attention head is monitoring
- Description kept general (avoiding metaphor-specific language like "whiskers")
- Untyped arrays validated via MCP-Debug - work perfectly for cognitive scaffolding
- "Any" type implemented by omitting JSON Schema type field

**Testing:**
- Tested all type combinations via MCP-Debug tool
- Verified arrays accept: strings, numbers, objects, mixed types, nested structures
- Verified "any" accepts: all JSON primitives, objects, arrays, booleans, null
- MCP schema layer handles both gracefully without validation issues

**Documentation:**
- README.md fully updated with attention_heads examples and patterns
- CLI help updated to include array and any types
- Documented common head patterns: interpersonal, technical, quality

**Commits:**
- `eb6a518` - Initial attention_heads implementation
- `4626748` - Added "any" type support and comprehensive README updates

### Session 2025-11-01: PR Review for v2.1.0

**Review conducted**: Comprehensive PR review using pr-review-toolkit agents (code-reviewer, type-design-analyzer, pr-test-analyzer, silent-failure-hunter, comment-analyzer)

**Key findings**:
- Feature design is excellent and aligns with minimalist philosophy
- Identified 5 critical CLI parsing bugs (colon-splitting, silent type coercion, silent failures)
- Zero test coverage (acceptable given tool's philosophy - it does nothing)
- Minor documentation inconsistencies

**Philosophy calibration**: Since tool returns empty response and does nothing, runtime input validation is not critical. Focus is on server configuration/startup correctness.

**Outcome**: Created PR_REVIEW_FINDINGS.md with self-contained fix guide for next session (3-4 hours estimated)

**Additional fix identified**: Tool description needs update to encourage multiple consecutive Self calls (the magic pattern lost when acknowledgment message was removed). Added to PR_REVIEW_FINDINGS.md.

**Next steps**: Implement CLI parsing fixes, update documentation (including tool description), then merge to main

### Session 2025-11-01: CLI Validation Fixes Implementation

**Implemented all fixes** from PR_REVIEW_FINDINGS.md systematically across 5 phases:

**Phase 1 & 2: Critical fixes and improvements** (src/index.ts parseArgs function):
- Fixed colon-splitting bug in --add-param (descriptions with colons/URLs now work correctly)
- Added type validation with case-insensitive normalization (invalid types error clearly)
- Added malformed --add-param validation (< 3 parts errors with helpful message)
- Added --required/--optional parameter name validation (typos error with list of valid params)
- Added unknown CLI argument detection (flag typos error suggesting --help)
- Added empty name/description validation
- Added duplicate parameter name detection

**Phase 3: Documentation updates**:
- Updated tool description to encourage multiple consecutive Self calls (critical for users discovering the deep interleaved thinking pattern)
- Fixed README.md inconsistency (now correctly states "empty response" not "acknowledgment message")
- Added explanatory comments for intentionally empty tool response (documents minimalist philosophy)
- Updated CLAUDE.md line count to ~295 lines (grew from 239 due to validation code)

**Phase 4: Manual testing**:
- Built project successfully
- Verified all 5 fix categories with edge case testing
- All tests passed with clear, helpful error messages

**Verification complete**: All critical issues resolved. Code now has comprehensive CLI validation with user-friendly error messages. Ready for merge to main.

**Commit**: `eafac71` - fix: add comprehensive CLI argument validation and error handling

---

*Built with janbam 🌱*
