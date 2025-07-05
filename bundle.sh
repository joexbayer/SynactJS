#!/bin/bash

ENTRY="main.js"
OUTPUT="bundle.js"
> "$OUTPUT"

VISITED=()
INCLUDED_FILES=()

# Recursively resolve and inline a JS file
bundle_file() {
  local file="$1"
  local abs_path
  abs_path=$(realpath "$file")

  for visited in "${VISITED[@]}"; do
    if [[ "$visited" == "$abs_path" ]]; then
      return
    fi
  done
  VISITED+=("$abs_path")
  INCLUDED_FILES+=("$file")

  echo "📦 Including: $file"

  echo "// --- $file ---" >> "$OUTPUT"

  while IFS= read -r line || [[ -n "$line" ]]; do
    # Match import lines like: import ... from './x.js';
    if [[ $line =~ ^[[:space:]]*import[[:space:]].*from[[:space:]]+[\"\']([^\"\']+)[\"\'] ]]; then
      import_path="${BASH_REMATCH[1]}"
      resolved_path=$(realpath "$(dirname "$file")/$import_path")

      # Log and bundle the imported file
      bundle_file "$resolved_path"

    # Naively remove 'export' from declarations
    elif [[ $line =~ ^[[:space:]]*export[[:space:]]+(function|const|let|var) ]]; then
      echo "$line" | sed -E 's/^[[:space:]]*export[[:space:]]+//' >> "$OUTPUT"
    else
      echo "$line" >> "$OUTPUT"
    fi
  done < "$file"
}

echo "Starting bundling from $ENTRY"
bundle_file "$ENTRY"
echo "Bundled into $OUTPUT"

# Summary
echo ""
echo "Included files:"
for f in "${INCLUDED_FILES[@]}"; do
  echo "  - $f"
done