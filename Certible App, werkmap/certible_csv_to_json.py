import csv
import json

# Pad naar jouw CSV-bestand
input_csv = "L:/GIT/Projects/Certible Project/certible_export.csv"
output_json = "L:/GIT/Projects/Certible Project/certible_export.json"

# Lezen en omzetten
with open(input_csv, mode='r', encoding='latin1') as csv_file:
    reader = csv.DictReader(csv_file)
    data = [row for row in reader]

with open(output_json, mode='w', encoding='utf-8') as json_file:
    json.dump(data, json_file, indent=4)

print("✅ CSV succesvol omgezet naar JSON!")
