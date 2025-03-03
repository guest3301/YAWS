import re
import os

def read_file(filepath):
    """Read file content safely."""
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as file:
            return file.read()
    else:
        print(f"Warning: File not found: {filepath}")
        return ""

def write_file(filepath, content):
    """Write content to file safely."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Updated file written: {filepath}")

def parse_css_blocks(content):
    """
    Parse CSS content into semantic blocks.
    Handles nested structures like @media and @keyframes correctly.
    Returns a list of (selector, properties) tuples.
    """
    blocks = []
    current_position = 0
    content_length = len(content)
    
    # Skip initial comments and whitespace
    while current_position < content_length:
        char = content[current_position]
        
        # Handle comments
        if current_position + 1 < content_length and content[current_position:current_position+2] == '/*':
            comment_end = content.find('*/', current_position + 2)
            if comment_end == -1:
                current_position = content_length  # End of file
            else:
                current_position = comment_end + 2
            continue
            
        # Skip whitespace
        if char.isspace():
            current_position += 1
            continue
            
        # Start of a potential selector or at-rule
        selector_start = current_position
        
        # Find the opening brace
        brace_position = content.find('{', current_position)
        if brace_position == -1:
            break  # No more blocks
            
        # Get the selector text
        selector = content[selector_start:brace_position].strip()
        current_position = brace_position + 1
        
        # For at-rules with nested blocks (@media, @keyframes)
        if selector.startswith('@media') or selector.startswith('@keyframes'):
            # We need to find the matching closing brace
            open_braces = 1
            block_start = current_position
            
            while open_braces > 0 and current_position < content_length:
                if content[current_position] == '{':
                    open_braces += 1
                elif content[current_position] == '}':
                    open_braces -= 1
                current_position += 1
                
            if open_braces == 0:
                # The whole at-rule including nested blocks
                full_block = content[selector_start:current_position]
                blocks.append(full_block)
            continue
                
        # For normal selectors
        properties_end = content.find('}', current_position)
        if properties_end == -1:
            break  # Malformed CSS
            
        properties = content[current_position:properties_end].strip()
        current_position = properties_end + 1
        
        # Add the complete block (selector + properties)
        blocks.append(f"{selector} {{{properties}}}")
    
    return blocks

def normalize_block(block):
    """
    Normalize a CSS block for comparison:
    - Remove comments
    - Normalize whitespace
    - Sort properties alphabetically when possible
    """
    # Remove comments
    block = re.sub(r'/\*.*?\*/', '', block, flags=re.DOTALL)
    
    # For at-rules with nested blocks, we need a different approach
    if block.startswith('@media') or block.startswith('@keyframes'):
        # Just basic whitespace normalization for at-rules
        return re.sub(r'\s+', ' ', block).strip()
    
    # For normal blocks, try to split selector and properties
    match = re.match(r'([^{]*)\s*\{\s*(.*?)\s*\}', block, re.DOTALL)
    if match:
        selector = match.group(1).strip()
        properties_text = match.group(2)
        
        # Split properties, normalize and sort them
        properties = [p.strip() for p in properties_text.split(';') if p.strip()]
        properties.sort()
        
        # Rebuild the normalized block
        return f"{selector} {{ {'; '.join(properties)}; }}"
    
    # Fallback for any other case
    return re.sub(r'\s+', ' ', block).strip()

def remove_duplicates(base_content, index_content):
    """Remove blocks from index_content that are already in base_content."""
    base_blocks = parse_css_blocks(base_content)
    index_blocks = parse_css_blocks(index_content)
    
    # Normalize base blocks for comparison
    normalized_base_blocks = [normalize_block(block) for block in base_blocks]
    
    # Filter index blocks to keep only unique ones
    unique_index_blocks = []
    for block in index_blocks:
        normalized_block = normalize_block(block)
        if normalized_block not in normalized_base_blocks:
            unique_index_blocks.append(block)
    
    # Reconstitute the index content with only unique blocks
    return "\n\n".join(unique_index_blocks)

def main():
    base_filepath = '/home/guest3301/YAWS/app/static/css/base.css'
    index_filepath = '/home/guest3301/YAWS/app/static/css/index.css'
    
    # Read content from files
    base_content = read_file(base_filepath)
    index_content = read_file(index_filepath)
    
    # Process the content to remove duplicates
    unique_index_content = remove_duplicates(base_content, index_content)
    
    # Write the updated content back to index.css
    if unique_index_content.strip():
        write_file(index_filepath, unique_index_content)
    else:
        print("Warning: After removing duplicates, index.css would be empty. No changes made.")

if __name__ == "__main__":
    main()