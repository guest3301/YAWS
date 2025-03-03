import re

def read_file(filepath):
    with open(filepath, 'r') as file:
        return file.read()

def write_file(filepath, content):
    with open(filepath, 'w') as file:
        file.write(content)

def get_css_blocks(content):
    """
    Splits the CSS content into blocks. Each block is defined as the text 
    from the start up to and including a closing curly brace "}". Any leftover 
    text (e.g. comments or global rules outside of blocks) is included as well.
    """
    # Split on "}" and reappend it
    parts = content.split("}")
    blocks = []
    for part in parts:
        block = part.strip()
        if block:
            blocks.append(block + "}")
    return blocks

def normalize_block(block):
    # Normalize whitespace for comparison purposes.
    return " ".join(block.split())

def remove_duplicate_css(content1, content2):
    blocks1 = get_css_blocks(content1)
    blocks2 = get_css_blocks(content2)

    norm_set1 = {normalize_block(b) for b in blocks1}
    norm_set2 = {normalize_block(b) for b in blocks2}

    unique_blocks1 = [b for b in blocks1 if normalize_block(b) not in norm_set2]
    unique_blocks2 = [b for b in blocks2 if normalize_block(b) not in norm_set1]

    # Reassemble the content (separating blocks with double newlines)
    new_content1 = "\n\n".join(unique_blocks1) + "\n" if unique_blocks1 else ""
    new_content2 = "\n\n".join(unique_blocks2) + "\n" if unique_blocks2 else ""
    return new_content1, new_content2

def main():
    base_filepath = '/home/guest3301/YAWS/app/static/css/base.css'
    index_filepath = '/home/guest3301/YAWS/app/static/css/index.css'

    base_content = read_file(base_filepath)
    index_content = read_file(index_filepath)

    unique_base, unique_index = remove_duplicate_css(base_content, index_content)

    write_file(base_filepath, unique_base)
    write_file(index_filepath, unique_index)

if __name__ == "__main__":
    main()