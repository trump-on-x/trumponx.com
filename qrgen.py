import os
import requests
import re
import subprocess

# Define paths
data_file_path = 'donate-crypto.js'
qr_folder = 'qr'

# --- Function to parse JavaScript array ---
def parse_js_array_to_python_list(file_path):
    """Parses a JavaScript array from a file into a Python list."""
    try:
        with open(file_path, 'r') as f:
            js_content = f.read()

        # Extract content between 'const cryptoWallets = [' and '];'
        match = re.search(r'const cryptoWallets\s*=\s*(\[.*?]);', js_content, re.DOTALL)

        if not match:
            print("Error: 'const cryptoWallets = [...];' not found in file.")
            return None

        array_content = match.group(1).strip()

        # Convert JavaScript-like keys (e.g., name:) to Python dictionary keys (e.g., "name":)
        array_content = re.sub(r'(\w+)\s*:', r'"\1":', array_content)

        # Replace single quotes with double quotes for eval compatibility
        array_content = array_content.replace("'", '"')

        data = eval(array_content) # Use eval to parse
        return data

    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        return None
    except SyntaxError as e:
        print(f"Error evaluating content from '{file_path}': {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

# --- Main script execution ---

# Parse data from file
data = parse_js_array_to_python_list(data_file_path)

if data is None:
    print("Exiting script due to data parsing error.")
    exit()

# Create QR folder if it doesn.t exist
os.makedirs(qr_folder, exist_ok=True)

# Remove existing files from the QR folder
print(f"Clearing existing files in '{qr_folder}'...")
for filename in os.listdir(qr_folder):
    file_path = os.path.join(qr_folder, filename)
    try:
        if os.path.isfile(file_path) or os.path.islink(file_path):
            os.unlink(file_path)
        elif os.path.isdir(file_path):
            import shutil
            shutil.rmtree(file_path)
        print(f"Deleted: {file_path}")
    except Exception as e:
        print(f'Failed to delete {file_path}. Reason: {e}')
print("Finished clearing existing files.")

# Generate and save QR codes
print("\nStarting QR code generation...")
for item in data:
    if 'address' in item:
        address = item['address']
        symbol = item.get('symbol', 'UNKNOWN')
        qr_url = f'https://api.qrserver.com/v1/create-qr-code/?size=128x128&margin=10&data={address}'

        # Sanitize address for filename
        sanitized_address = re.sub(r'[\\/:*?"<>|]', '_', address)
        file_path = os.path.join(qr_folder, f'{sanitized_address}.png')

        try:
            response = requests.get(qr_url)
            response.raise_for_status()

            with open(file_path, 'wb') as f:
                f.write(response.content)
            print(f"Generated QR code for {symbol} (address: {address[:10]}...) to {file_path}")
        except requests.exceptions.RequestException as e:
            print(f"Error fetching QR code for {symbol} ({address}): {e}")
        except Exception as e:
            print(f"An unexpected error occurred for {symbol} ({address}): {e}")
    else:
        print(f"Warning: Item missing 'address' key, skipping: {item}")

print("\nQR code generation complete.")

# --- Run git add command at the end ---
print(f"\n--- Running git add {qr_folder} ---")
try:
    git_result = subprocess.run(
        ['git', 'add', qr_folder],
        check=True,
        capture_output=True,
        text=True
    )
    print("Git add output:")
    print(git_result.stdout)
    if git_result.stderr:
        print("Git add errors:")
        print(git_result.stderr)
    print(f"--- git add finished with exit code {git_result.returncode} ---")
except FileNotFoundError:
    print("Error: 'git' command not found. Please ensure Git is installed and in your system's PATH.")
except subprocess.CalledProcessError as e:
    print(f"Error: 'git add' failed with exit code {e.returncode}")
    print(f"Command: {e.cmd}")
    if e.stdout:
        print(f"Stdout: {e.stdout}")
    if e.stderr:
        print(f"Stderr: {e.stderr}")
except Exception as e:
    print(f"An unexpected error occurred during 'git add': {e}")
