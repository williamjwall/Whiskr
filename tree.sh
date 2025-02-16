#!/bin/bash

print_tree() {
    local dir="$1"
    local prefix="$2"

    for entry in "$dir"/*; do
        [[ -e "$entry" ]] || continue  # Skip non-existent files
        [[ "$(basename "$entry")" == "node_modules" ]] && continue  # Exclude node_modules

        local name="${entry##*/}"  # Extract file/folder name
        echo "${prefix}├── $name"

        if [[ -d "$entry" ]]; then
            local new_prefix="${prefix}│   "
            print_tree "$entry" "$new_prefix"
        fi
    done
}

echo "."
print_tree "." ""
