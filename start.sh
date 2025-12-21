#!/usr/bin/env bash

# watch-rollup.sh
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
src_path="$project_root/src"
banner_file="$project_root/banner.js"
interval=0.5  # seconds between checks

# Function to get file modification times
get_file_times() {
    local paths=("$@")
    local file_times=""
    for path in "${paths[@]}"; do
        if [ -e "$path" ]; then
            while IFS= read -r file; do
                mtime=$(stat -c %Y "$file")
                file_times+="$file:$mtime"$'\n'
            done < <(find "$path" -type f)
        fi
    done
    echo "$file_times"
}

watched_paths=("$src_path" "$banner_file")
last_times="$(get_file_times "${watched_paths[@]}")"

echo -e "\033[0;32mWatching src/**/*.js and banner.js for changes...\033[0m"

while true; do
    sleep "$interval"
    current_times="$(get_file_times "${watched_paths[@]}")"

    if ! diff -q <(echo "$last_times") <(echo "$current_times") >/dev/null; then
        echo -e "\n\033[1;33mChange detected, rebuilding...\033[0m"
        npx rollup -c
        last_times="$current_times"
    fi
done
