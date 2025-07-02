import os
import sys

# Customize these
TARGET_EXTENSIONS = {
    ".py",
    ".cpp",
    ".h",
    ".c",
    ".java",
    ".js",
    ".ts",
    ".html",
    ".css",
    ".json",
}
OUTPUT_FILE = "all_code_output.txt"


def delete_output_file(output_path):
    if os.path.exists(output_path):
        os.remove(output_path)
        print(f"Deleted existing file: {output_path}")


def collect_code_files(directory, extensions, script_name):
    collected = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file == script_name:
                continue  # skip this script itself
            if any(file.endswith(ext) for ext in extensions):
                collected.append(os.path.join(root, file))
    return collected


def extract_text_from_files(file_paths):
    combined_text = ""
    for file_path in file_paths:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                combined_text += f"\n\n# --- {file_path} ---\n"
                combined_text += f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    return combined_text


def save_to_file(text, output_path):
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Combined text saved to: {output_path}")


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Scrape code text from a directory")
    parser.add_argument("directory", help="Root directory to scan")
    args = parser.parse_args()

    script_name = os.path.basename(__file__)

    delete_output_file(OUTPUT_FILE)

    code_files = collect_code_files(args.directory, TARGET_EXTENSIONS, script_name)
    print(f"Found {len(code_files)} code files (excluding this script).")

    combined_text = extract_text_from_files(code_files)
    save_to_file(combined_text, OUTPUT_FILE)


if __name__ == "__main__":
    main()
