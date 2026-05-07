#!/bin/bash
# Converts JPG/JPEG/PNG files over 300kb to WebP at quality 82.
# Updates all HTML references in-place.
# Original files are left untouched (delete manually once you're happy).

set -e

SITE_DIR="$(cd "$(dirname "$0")" && pwd)"
MIN_SIZE=307200  # 300kb in bytes
QUALITY=82
CHANGED=0
SKIPPED=0

echo "Scanning for images over 300kb..."

while IFS= read -r -d '' file; do
  size=$(stat -f%z "$file")
  if [ "$size" -lt "$MIN_SIZE" ]; then
    continue
  fi

  # Derive output path
  dir="$(dirname "$file")"
  base="$(basename "${file%.*}")"
  out="$dir/$base.webp"

  if [ -f "$out" ]; then
    echo "  SKIP (webp exists): ${file#$SITE_DIR/}"
    ((SKIPPED++))
    continue
  fi

  echo "  Converting ($(( size / 1024 ))kb): ${file#$SITE_DIR/}"
  cwebp -q $QUALITY -mt "$file" -o "$out" -quiet

  new_size=$(stat -f%z "$out")
  savings=$(( (size - new_size) * 100 / size ))
  echo "    → ${base}.webp ($(( new_size / 1024 ))kb, ${savings}% smaller)"
  ((CHANGED++))
done < <(find "$SITE_DIR/images" \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) ! -path "*/.playwright-mcp/*" -print0)

echo ""
echo "Converted $CHANGED files, skipped $SKIPPED already-converted."

if [ "$CHANGED" -eq 0 ]; then
  echo "Nothing to update in HTML."
  exit 0
fi

echo ""
echo "Updating HTML references..."

for html in "$SITE_DIR"/*.html; do
  name="$(basename "$html")"
  before="$(cat "$html")"

  # Replace .jpg / .jpeg / .png references with .webp — only for paths that have a matching .webp
  while IFS= read -r -d '' webp_file; do
    rel="${webp_file#$SITE_DIR/}"
    base_no_ext="${rel%.webp}"
    # Replace all three extensions
    sed -i '' \
      -e "s|${base_no_ext}\.jpg|${base_no_ext}.webp|g" \
      -e "s|${base_no_ext}\.jpeg|${base_no_ext}.webp|g" \
      -e "s|${base_no_ext}\.png|${base_no_ext}.webp|g" \
      "$html"
  done < <(find "$SITE_DIR/images" -name "*.webp" -print0)

  after="$(cat "$html")"
  if [ "$before" != "$after" ]; then
    echo "  Updated: $name"
  fi
done

echo ""
echo "Done. Original files untouched — delete them once you've verified the site looks right."
