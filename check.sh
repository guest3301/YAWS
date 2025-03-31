#!/bin/bash

# List of URLs under "Programmes & Courses"
urls=(
    "https://saketcollege.edu.in/programmes-courses-offered/"
    "https://saketcollege.edu.in/ug/"
    "https://saketcollege.edu.in/admission/"
    "https://saketcollege.edu.in/departments/"
    "https://saketcollege.edu.in/programme-course-outcome/"
    "https://saketcollege.edu.in/pg/"
    "https://saketcollege.edu.in/syballus/"
    "https://saketcollege.edu.in/junior-college/"
    "https://saketcollege.edu.in/arts/"
    "https://saketcollege.edu.in/science/"
    "https://saketcollege.edu.in/bi-focal/"
    "https://saketcollege.edu.in/commerce/"
    "https://saketcollege.edu.in/Docs/ADMISSION%20PROCEDURE.pdf?_t=1702711294"
    "https://saketcollege.edu.in/notices/"
    "https://saketcollege.edu.in/timetable/"
    "https://saketcollege.edu.in/result-2/"
    "https://saketcollege.edu.in/certificate-courses/"
)

# File to save valid URLs
output_file="valid_programmes_urls.txt"
> "$output_file" # Clear the file if it exists

# Loop through each URL
for url in "${urls[@]}"; do
    echo "Checking URL: $url"

    # Make a request to the URL
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$response" -eq 200 ]; then
        echo "URL is valid: $url"
        read -p "Do you want to keep this URL? (y/n): " choice
        if [[ "$choice" == "y" || "$choice" == "Y" ]]; then
            echo "$url" >> "$output_file"
        else
            echo "URL removed: $url"
        fi
    else
        echo "URL is invalid or has no content: $url (HTTP Status: $response)"
    fi
done

echo "Valid URLs saved to $output_file"