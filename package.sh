#!/usr/bin/env bash
set -e

# === Config ===
output="${1:-./leaf.mcaddon}"
data_file="lp.json"
sevenzip="/usr/bin/7z"

# === Make sure folders exist ===
mkdir -p temp staging

# === Parse lp.json ===
jq -c '.paths[]' "$data_file" | while read -r entry; do
    name=$(echo "$entry" | jq -r '.name')
    path=$(echo "$entry" | jq -r '.path')
    tempOut=$(echo "$entry" | jq -r '.tempOut')

    echo -e "\e[33mPackaging \e[34m$name\e[0m"

    # Collect all files
    if echo "$entry" | jq -e 'has("whitelist")' > /dev/null; then
        echo " → Using whitelist filtering..."
        mapfile -t whitelist < <(echo "$entry" | jq -r '.whitelist[]')
        filtered_files=()
        while IFS= read -r -d '' file; do
            rel="${file#$path/}"
            for w in "${whitelist[@]}"; do
                if [[ "$rel" == $w* ]]; then
                    filtered_files+=("$file")
                    break
                fi
            done
        done < <(find "$path" -type f -print0)
    else
        mapfile -d '' filtered_files < <(find "$path" -type f -print0)
    fi

    # Prepare staging dir
    staging_dir="staging/$name"
    rm -rf "$staging_dir"
    mkdir -p "$staging_dir"

    # Copy filtered files
    for f in "${filtered_files[@]}"; do
        rel="${f#$path/}"
        dest="$staging_dir/$rel"
        mkdir -p "$(dirname "$dest")"
        cp "$f" "$dest"
    done

    # Create temp zip
    temp_zip="temp/$tempOut"
    rm -f "$temp_zip"
    "$sevenzip" a -tzip "$temp_zip" "$staging_dir"/* > /dev/null

    # Clean up staging
    rm -rf "$staging_dir"
done

# === Combine all temp zips ===
if [ "$(find temp -type f | wc -l)" -gt 0 ]; then
    rm -f "$output"
    "$sevenzip" a -tzip "$output" temp/* > /dev/null
    echo -e "\e[32mFinal package created:\e[0m $output"
else
    echo -e "\e[31mNo files found in temp folder to zip!\e[0m"
fi
